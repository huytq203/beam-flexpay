# Thiết kế tải cấu hình phí theo trang cho danh sách chính sách

Ngày: 2026-09-22

Phạm vi liên repo:

- Frontend: `/home/huytq/code/beam/fe/ewallet-cms-web`
- Backend: `/home/huytq/code/beam/be/flexpay/flexpay.fee`

## Mục tiêu

Màn **Cấu hình phí** tiếp tục dùng bảng có dòng mở rộng, action và phân trang như hiện tại, nhưng người vận hành có thể mở nhiều dòng hoặc mở toàn bộ dòng trên trang mà không phát sinh chuỗi request theo từng policy/component.

Một lần tìm kiếm phải trả đủ dữ liệu cần cho phần mở rộng của cả trang: mọi assignment, mọi component và mọi tier. Mỗi component phải hiển thị thêm **Người chịu** và **Người hưởng**.

## Quyết định kiến trúc

Mở rộng endpoint hiện có bằng tham số opt-in:

```http
GET /api/v1/admin/fee/policies/search?...&includeConfiguration=true
```

Khi `includeConfiguration` vắng mặt hoặc bằng `false`, response giữ nguyên hành vi hiện tại để không làm nặng các consumer khác. Khi bằng `true`, mỗi `FeePolicyResponse` có thêm trường `configuration`.

Không tạo API detail theo từng policy và không tạo batch endpoint thứ hai. Frontend danh sách chỉ gọi một HTTP request cho mỗi bộ lọc/trang.

## Contract response

```json
{
  "id": "policy-id",
  "name": "Phí rút tiền",
  "appliedTargets": [],
  "configuration": {
    "assignments": [
      {
        "id": "assignment-id",
        "feePolicyId": "policy-id",
        "merchantId": null,
        "bankCode": "VCB",
        "paymentMethod": "ATM",
        "cardType": null,
        "serviceType": "EWALLET_WITHDRAWAL",
        "customerGroup": null,
        "subjectType": "USER",
        "subjectId": "user-id",
        "status": "ACTIVE",
        "effectiveFromDate": null,
        "effectiveToDate": null
      }
    ],
    "components": [
      {
        "id": "component-id",
        "feePolicyId": "policy-id",
        "componentType": "TRANSACTION_FEE",
        "baseOn": "AMOUNT",
        "baseComponentType": null,
        "calculationMethod": "FLAT_TIER",
        "fixedAmount": 0,
        "percentage": 0,
        "roundMode": "HALF_UP",
        "minFee": 0,
        "maxFee": 0,
        "payerType": "USER",
        "payerObjectType": null,
        "payerObjectId": null,
        "beneficiaryType": "SYSTEM",
        "beneficiaryObjectType": null,
        "beneficiaryObjectId": null,
        "tiers": []
      }
    ]
  }
}
```

Quy ước:

- `configuration` không được serialize khi không yêu cầu tải cấu hình; DTO dùng
  `@JsonInclude(JsonInclude.Include.NON_NULL)` để contract cũ không có thêm field.
- Khi có yêu cầu, `assignments`, `components` và `tiers` luôn là mảng; không trả `null`.
- Trả toàn bộ assignment của policy, không chỉ phần tử đầu tiên.
- Tier được sắp theo `minValue` tăng dần trong từng component.
- Component có thứ tự ổn định theo `componentType`, sau đó theo `id`, để UI không đổi vị trí ngẫu nhiên giữa các lần tải.
- DTO tổng hợp tái sử dụng các trường của response hiện có nhưng là contract đọc riêng; không gắn quan hệ JPA mới vào entity.

## Backend

### Luồng tải dữ liệu

Sau khi truy vấn được `Page<FeePolicy>`:

1. Map policy và dựng `appliedTargets` theo luồng hiện có.
2. Nếu `includeConfiguration=false`, trả response ngay.
3. Lấy toàn bộ `policyIds` của trang.
4. Gọi một lần `FeePolicyAssignmentRepository.findByFeePolicyIdIn(policyIds)`.
5. Gọi một lần `FeePolicyComponentRepository.findByFeePolicyIdIn(policyIds)`.
6. Lấy toàn bộ `componentIds`, rồi gọi một lần `FeeComponentTierRepository.findByFeeComponentIdInOrderByMinValueAsc(componentIds)`.
7. Group assignment theo `feePolicyId`, component theo `feePolicyId`, tier theo `feeComponentId` trong bộ nhớ.
8. Gắn `configuration` tương ứng vào từng `FeePolicyResponse`.

Không gọi repository trong vòng lặp. Các entity hiện tại chỉ chứa khóa UUID, không có lazy relationship để cần thêm `@EntityGraph`; các truy vấn `IN` batch là ranh giới tải dữ liệu rõ ràng hơn cho aggregate đọc này.

Trang rỗng không gọi ba repository cấu hình. Danh sách component rỗng không gọi repository tier.

### Tổ chức mã

- Tạo các DTO đọc tổng hợp cạnh `FeePolicyResponse`, gồm configuration và component có tiers.
- Tạo một assembler/service chuyên tải và group configuration cho danh sách policy; `FeePolicyService` chỉ điều phối search và enrichment.
- Thêm `boolean includeConfiguration` vào method search dùng cho admin list.
- `searchForExport` tiếp tục không tải `configuration`, vì export đã có luồng batch riêng và không được nhân đôi dữ liệu.
- Controller nhận `@RequestParam(defaultValue = "false") boolean includeConfiguration`.

### Hiệu năng

Với một trang 10 policy và bất kỳ số component nào trong giới hạn dữ liệu hợp lệ, phần configuration dùng tối đa ba truy vấn DB bổ sung. Số truy vấn không tăng theo số policy/component. Payload chỉ nặng khi consumer chủ động gửi `includeConfiguration=true`.

## Frontend

### Data flow

- `SearchFeePoliciesParams` gửi `includeConfiguration: true` từ màn danh sách.
- Bổ sung type cho `configuration`, assignment, component và nested tiers tại tầng app dùng chung.
- `useFeePolicyList` tiếp tục là nguồn dữ liệu duy nhất của table.
- Xóa việc dùng `useFeePolicyExpandedDetail` trên màn list; mở dòng chỉ đọc dữ liệu đã có trong `row.configuration`.
- Giữ các endpoint assignment/component/tier cũ cho màn tạo, sửa và các consumer khác.

### Table expand

- Giữ nguyên các cột, action, phân quyền, filter, refresh, export và pagination.
- Đổi state từ một `expandedPolicyId` sang `expandedPolicyIds: string[]`.
- Cho phép mở/đóng từng dòng độc lập.
- Thêm nút **Mở tất cả** khi còn dòng chưa mở; khi toàn bộ dòng trên trang đã mở, nút đổi thành **Thu gọn tất cả**.
- “Tất cả” chỉ có nghĩa các dòng của trang hiện tại.
- Khi page, page size, filter hoặc fee domain thay đổi, reset danh sách dòng mở.
- Mở dòng không gọi API và không hiện skeleton/loading riêng.

### Nội dung dòng mở rộng

Phần **Gán đối tượng** hiển thị mọi assignment. Mỗi assignment là một dòng compact gồm:

- Đối tượng áp dụng;
- Chủ thể hoặc merchant ID khi có;
- Ngân hàng;
- Phương thức giao dịch;
- Trạng thái assignment khi có ý nghĩa phân biệt.

Tên/số điện thoại đã có trong `appliedTargets` được dùng để làm rõ subject tương ứng; khi không có profile, hiển thị ID và không để ô trống.

Phần **Thiết lập phí** hiển thị mọi component. Mỗi component gồm:

- Loại phí;
- Công thức tính và cơ sở tính;
- Mức phí hoặc bảng tier;
- Sàn và trần;
- Người chịu (`payerType`);
- Người hưởng (`beneficiaryType`).

Enum được map sang nhãn tiếng Việt. Nếu backend bổ sung enum mới mà frontend chưa biết, UI hiển thị mã gốc thay vì rỗng hoặc lỗi render.

### Cache và invalidation

Search query cung cấp các tag:

- `FeePolicy`
- `feeAssign`
- `FeePolicyComponent`
- `feeComponentTier`

Mutation hiện có chỉ cần invalidate tag thuộc phần nó thay đổi; search aggregate sẽ được refetch khi bất kỳ tag liên quan nào bị invalidated. RTK Query tiếp tục cache theo toàn bộ search args, nên quay lại một trang/bộ lọc còn cache không tạo request trùng ngoài chính sách refetch hiện có.

Các URL phụ vẫn nằm trong whitelist loading toàn cục vì màn tạo/sửa còn sử dụng; màn list không còn phụ thuộc whitelist đó để tránh nháy loading.

## Loading và lỗi

- Search đang tải lần đầu: dùng loading của table như hiện tại.
- Refetch do filter/page/action: giữ data cũ theo hành vi RTK Query hiện có và dùng trạng thái fetching của table.
- Search hoặc enrichment configuration lỗi: API trả lỗi cho toàn request; frontend hiển thị error toàn danh sách và nút **Thử lại**.
- Không trả response thành công với configuration thiếu một phần, vì điều đó khiến người vận hành hiểu nhầm chính sách không có assignment/component/tier.
- Policy thật sự không có assignment hoặc component dùng empty state riêng trong dòng mở rộng.

## Kiểm thử

### Backend

- Controller truyền đúng `includeConfiguration`, mặc định `false`.
- Search không yêu cầu configuration không gọi assembler mới và giữ contract cũ.
- Search yêu cầu configuration group đúng nhiều policy, nhiều assignment, nhiều component và nhiều tier.
- Policy không có assignment/component nhận mảng rỗng.
- Không có component thì repository tier không được gọi.
- Test bằng mock xác nhận mỗi repository batch chỉ được gọi một lần với toàn bộ ID của trang, không gọi theo vòng lặp.
- Giữ xanh các test search, applied target và export hiện có.

### Frontend

- Một request `/policies/search` chứa `includeConfiguration=true`; không có request detail khi mở một hoặc mọi dòng.
- Có thể mở nhiều dòng cùng lúc.
- **Mở tất cả / Thu gọn tất cả** tác động đúng các dòng của trang hiện tại.
- Đổi page/filter/domain reset trạng thái expand.
- Hiển thị mọi assignment và mọi component.
- Hiển thị đúng Người chịu, Người hưởng và fallback enum lạ.
- Hiển thị tier, direct fee và empty state.
- Các action xem/sửa, duyệt, kích hoạt, ngừng áp dụng và pagination không đổi hành vi.

## Tương thích và triển khai

Backend nên được triển khai trước frontend. Frontend mới yêu cầu `includeConfiguration=true`, nên không thể hoạt động đầy đủ với backend chưa có contract này. Consumer cũ không truyền tham số vẫn nhận payload cũ.

Không thay đổi schema database và không xóa endpoint hiện có.
