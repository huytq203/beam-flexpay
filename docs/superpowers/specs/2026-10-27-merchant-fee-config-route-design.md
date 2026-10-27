# Cấu hình phí ĐVCNTT (thu hộ / chi hộ): route riêng trên CMS

Ngày: 2026-10-27. Phạm vi: chỉ FE (`ewallet-cms-web`). Backend người chịu phí làm sau, theo spec riêng.

## Vì sao

Phía ví user đã cấu hình được nhiều thứ: chọn ai chịu phí, gán biểu phí cho từng ví, cho nhóm khách
hoặc cho tất cả, và xem trong chi tiết ví những quy tắc đang áp cho riêng ví đó. Phí thu hộ VA
(`MERCHANT_VA_BILL_COLLECTION`) và chi hộ chuyển khoản (`PAYOUT_BANK_TRANSFER`) của merchant thì chưa:

- Chỉ gán được cho một merchant (ô `MerchantPickerField`) hoặc để trống là áp cho tất cả.
- Không gán được theo nhóm merchant.
- Người chịu phí luôn là Merchant.
- Phí thu hộ / chi hộ đang nằm lẫn trong màn "Cấu hình phí đầu ra" chung với phí ví.

Người vận hành quản lý merchant muốn có một chỗ riêng trong nhóm menu của cổng ĐVCNTT để cấu hình
phí thu hộ / chi hộ, với cách làm giống như bên ví user.

## Mục tiêu

1. Thêm route riêng **"Cấu hình phí ĐVCNTT"** trong menu "Nhóm quản lý cổng ĐVCNTT". Route này có
   màn danh sách, màn tạo và màn sửa, và chỉ làm việc với chính sách thu hộ / chi hộ.
2. Gán đối tượng cho chính sách merchant theo 3 mức: **Tất cả merchant / Nhóm merchant / Merchant
   cụ thể**. Merchant cụ thể thắng nhóm merchant, nhóm merchant thắng tất cả.
3. Hiện ô **Người chịu phí** cho thu hộ / chi hộ.
   - Lúc này chỉ chọn được **Merchant**.
   - Các lựa chọn "Khách hàng" và "Cả hai bên cùng chịu" vẫn hiện nhưng **bị khóa**, kèm nhãn
     **"Sắp hỗ trợ"**.
   - Ở thu hộ / chi hộ, hai bên chỉ được gọi là **Merchant** và **Khách hàng**, không dùng
     "Người chuyển / Người nhận" như luồng ví. Khách hàng là người nộp tiền vào VA (thu hộ) hoặc
     người nhận tiền chi (chi hộ).
4. Thêm khối **"Quy tắc phí thu hộ / chi hộ dành riêng cho merchant này"** vào màn chi tiết
   merchant. Khối này làm theo mẫu tab Cấu hình phí của chi tiết ví.

## Không làm (lần này)

- Không sửa backend. Ba phần nhóm merchant, khối quy tắc trong chi tiết merchant và lọc
  `feeDomain=MERCHANT` đều chạy được với backend hiện tại.
- Chưa cho chọn người chịu phí khác Merchant. Muốn mở thì backend phải sửa ở `flexpay.fee`,
  `flex.merchant` và `flexpay.wallet-core`. Phần đó làm theo spec sau.
- Không thêm mã quyền mới.
- Không chuyển hay xóa những chính sách merchant đã có. Chúng vẫn mở được.

## Không được để xảy ra

- Người vận hành chọn được một người chịu khác `MERCHANT`, rồi khi lưu thì lựa chọn đó âm thầm bị
  đổi về `MERCHANT`.
  - Đây là cách `toSetupRequest` đang làm: nó viết lại mọi payer nằm ngoài `getSelectablePayers`.
  - Backend chỉ thực thi được `MERCHANT` ([FeeExecutionCapabilityRegistry.java:331](../../../../../be/flexpay/flexpay.fee/src/main/java/com/flexpay/fee/application/validator/FeeExecutionCapabilityRegistry.java)).
  - Vì vậy ô chọn không được mở lựa chọn nào khác, và schema phải chặn chứ không được viết lại.
- Chọn "Merchant cụ thể" mà quy tắc tạo ra vẫn thua quy tắc nhóm. Xem mục Gán đối tượng.
- Phí thu hộ / chi hộ tạo được ở màn chung.
  - Hiện cả hai loại này đang bị ẩn ở mọi màn bằng `TEMPORARILY_HIDDEN_SERVICE_TYPES`
    (`src/app/utils/fee-execution.ts`, commit 944d5fde).
  - Màn ĐVCNTT phải bỏ ẩn cho riêng nó. Màn chung vẫn giữ ẩn.

## Các quyết định

### Menu, route, quyền

- Thêm một mục con **"Cấu hình phí ĐVCNTT"** vào khối `merchantManagement` ("Quản lý ĐVCNTT") trong
  `Navigation.tsx`, đặt ngay sau "Quản lý danh sách merchant". *(Mình chọn chỗ đặt. Builder có thể
  tách thành khối riêng nếu thấy hợp hơn với sidebar.)*
- Screen mới `MERCHANT_FEE_CONFIG` trong `app/permissions/registry.ts`:
  - `path: ${MERCHANT}/fee-config`, `actions: { ...FEE_ACTIONS }`.
  - Dùng lại họ quyền FEE giống `FEE_CONFIG`, vì backend phí không phân quyền theo miền. *(Mình
    chọn.)*
- Thêm 3 route vào khối route merchant trong `routes.ts`: `${MERCHANT}/fee-config`,
  `.../create` và `.../edit/:id`. Thêm các hằng `PATHS` tương ứng.

### Dùng lại màn hiện có

- Không viết màn mới từ đầu. `FeePolicyListPage` và `FeeConfigPage` đang được dùng chung cho hai
  màn qua prop `policyKind`, nên làm thêm một biến thể cho merchant.
- `policyKind` gửi xuống API **vẫn là `CUSTOMER_FEE`**.
- Biến thể merchant là khái niệm chỉ có ở FE. Builder tự chọn cách thể hiện, ví dụ prop
  `variant: 'customer' | 'merchant'` đi kèm `policyKind`, nhưng không được gửi giá trị mới nào xuống
  backend.
- Biến thể quyết định những thứ sau:

| | Cấu hình phí đầu ra (hiện có) | Cấu hình phí ĐVCNTT (mới) |
|---|---|---|
| Lọc danh sách | không đổi | luôn gửi `feeDomain=MERCHANT` (cả `/search` lẫn `/export`). Chính sách thu hộ / chi hộ cũ ở miền `BANK` không có hoặc không cần hiện, theo xác nhận của chủ sản phẩm ngày 2026-10-27 |
| Ô lọc Loại giao dịch | không đổi | chỉ Thu hộ VA, Chi hộ chuyển khoản |
| Ô Loại giao dịch khi tạo | ẩn thu hộ / chi hộ | chỉ thu hộ / chi hộ |
| Nút Tạo, link Sửa | đường dẫn `FEE_V4` | đường dẫn `${MERCHANT}/fee-config` |
| Quyền `screen` | `FEE_CONFIG` | `MERCHANT_FEE_CONFIG` |
| Tên file CSV | `cau-hinh-phi` | `cau-hinh-phi-dvcntt` |
| Tiêu đề, breadcrumb | không đổi | "Cấu hình phí ĐVCNTT" |

- Lệnh ẩn tạm `TEMPORARILY_HIDDEN_SERVICE_TYPES` phải phụ thuộc vào biến thể.
  - Ô chọn loại giao dịch (`PolicyGeneralSection.tsx`) và các tab lọc (`FeePolicyFilterBar.tsx`)
    của màn ĐVCNTT phải hiện thu hộ / chi hộ.
  - Màn chung giữ nguyên như hiện nay: ẩn cả ở ô chọn lẫn tab lọc, nhưng loại đang được chọn vẫn
    hiện đúng nhãn.
  - Mình chọn coi lệnh ẩn này là để chờ có route riêng, nên không cần gỡ hẳn. Ở màn chung, nó trở
    thành luật cố định.
- Danh sách của màn chung **vẫn hiện** chính sách merchant. Lý do: API chỉ lọc `feeDomain` theo
  điều kiện bằng, nếu gửi `feeDomain=EWALLET` thì sẽ mất luôn các chính sách miền `BANK` cũ. *(Mình
  chọn. Có thể gỡ khi backend có điều kiện loại trừ.)*
- Mở màn sửa ở sai màn thì chuyển hướng:
  - Mở `.../fee-policy/edit/:id` với một chính sách `feeDomain=MERCHANT` → chuyển sang
    `${MERCHANT}/fee-config/edit/:id`.
  - Mở màn sửa merchant với một chính sách không thuộc miền merchant → chuyển sang màn chung.
  - Làm giống cách `FeeConfigPage` đang xử lý khi `savedKind` không khớp. *(Mình chọn.)*

### Gán đối tượng (thu hộ / chi hộ)

- Thay ô `MerchantPickerField` đứng riêng bằng ô **"Đối tượng áp dụng"** có 3 lựa chọn, giống
  `ASSIGNMENT_SCOPE` của luồng ví nhưng đổi nhãn:
  - `ALL` → "Tất cả merchant".
  - `SEGMENT` → "Nhóm merchant". Hiện ô chọn nhóm, dùng chung danh mục `useGetCustomerSegmentsQuery`.
  - `SUBJECT` → "Merchant cụ thể". Hiện `MerchantPickerField`.
- Payload gửi đi theo từng lựa chọn (`feeConfigPayload`):
  - `ALL`: không gửi `merchantId`, `customerGroup`, `subjectType`, `subjectId`.
  - `SEGMENT`: chỉ gửi `customerGroup`.
  - `SUBJECT`: gửi **cả** `merchantId`, `subjectType='MERCHANT'` và `subjectId` (bằng merchantId).
    - Bắt buộc gửi cặp subject. Nếu chỉ có `merchantId`, bản gán được 128 điểm và thua bản gán nhóm
      (256 điểm). Cặp subject được 512 điểm (`FeePolicyAssignment.getSpecificityScore`).
    - Backend cũng bắt `subjectId` phải bằng `merchantId` khi `subjectType=MERCHANT`.
  - Hằng `WALLET_SUBJECT_TYPE='USER'` hiện đang được dùng cứng. Phải chọn subjectType theo luồng:
    `MERCHANT` cho thu hộ / chi hộ, `USER` cho luồng ví.
  - Sửa luôn comment cũ ghi rằng backend từ chối subject ở luồng merchant. Backend giờ đã nhận
    `MERCHANT`.
- Đọc bản gán cũ khi mở màn sửa:
  - Có `subjectType=MERCHANT` → `SUBJECT`.
  - Chỉ có `merchantId` (dữ liệu cũ) → cũng là `SUBJECT`, và khi lưu thì gửi thêm cặp subject.
  - Có `customerGroup` → `SEGMENT`.
  - Không có gì → `ALL`.
  - Việc lưu lại một bản gán cũ làm nó mạnh lên (từ 128 lên 512 điểm), và đó đúng là ý người vận
    hành. Thay đổi đi qua luồng duyệt như mọi lần sửa khác.
- Ô Ngân hàng và ô Phương thức không đổi.
- Dòng gợi ý dưới ô: "Merchant cụ thể được ưu tiên hơn nhóm merchant, nhóm merchant được ưu tiên hơn
  tất cả."

### Người chịu phí (hộp thoại thành phần phí)

- Với thu hộ / chi hộ, ô Người chịu hiện các lựa chọn sau:

| Loại giao dịch | Chọn được | Bị khóa, nhãn "Sắp hỗ trợ" |
|---|---|---|
| Thu hộ VA | Merchant | Khách hàng · Cả hai bên cùng chịu |
| Chi hộ chuyển khoản | Merchant | Khách hàng · Cả hai bên cùng chịu |

- Nhãn hai bên của thu hộ / chi hộ là **Merchant** và **Khách hàng** ở mọi chỗ: ô chọn, phần tóm tắt
  thành phần, tiêu đề khối mức phí khi cả hai bên chịu (`getBearerSideTitles`), cột danh sách và
  bộ lọc. Không chỗ nào được hiện "Người chuyển" hay "Người nhận" cho hai loại giao dịch này.
  `payerLabelsFor` thêm một bảng nhãn riêng cho luồng merchant.

- Các lựa chọn bị khóa dùng option `disabled` của antd Select, và vẫn hiện trong danh sách để người
  vận hành biết sắp có.
- Mặc định và giá trị duy nhất được lưu là `MERCHANT`.
- Schema zod cũng chặn mọi payer khác `MERCHANT` cho hai loại giao dịch này, để không lọt qua bằng
  dữ liệu cũ hay sửa tay.
- Giá trị nội bộ của các lựa chọn bị khóa chỉ để hiển thị và không bao giờ được gửi đi. Khi backend
  làm xong, spec backend sẽ quyết định giá trị thật. Gợi ý: "Khách hàng" ở thu hộ ứng với phía
  người gửi, ở chi hộ ứng với `RECEIVER`.
- Hiện nay `getOutputPayerOptions` luôn nối thêm `USER` và `RECEIVER` vào sau payer mặc định. Với
  thu hộ / chi hộ, hai lựa chọn này phải bị thay bằng danh sách ở bảng trên. Như vậy cũng gỡ được
  luôn lỗi màn chung đang cho chọn "Người chuyển" / "Người nhận" ở luồng merchant, là những lựa chọn
  backend không chạy được.
- Phải xử lý cả VAT:
  - `dependentPayerFor` sẽ khóa VAT theo Merchant.
  - Phần "Cả hai bên" (`canSplit`, `BOTH_BEARERS_OPTION`) không bao giờ được bật cho hai loại giao
    dịch này.

### Khối quy tắc phí trong chi tiết merchant

- Thêm vào `MerchantDetail.tsx`, đặt ngay sau `SubjectSegmentCard`.
- Dùng lại `FeeSettingCard`, bảng cột `getApplicableFeeRuleColumns`, `ExportCsvButton` và empty
  state.
- Tổng quát hóa `useFeeSettingRules` để nhận `subjectType` và `feeDomain` thay vì hardcode
  `USER` / `EWALLET`.
- Query: `subjectType=MERCHANT`, `subjectId=merchant.id`, **`merchantId=merchant.id`**,
  `appliedObjectTypes=ACCOUNT,CUSTOMER_GROUP`, `feeDomain=MERCHANT`. Xuất CSV dùng cùng bộ tham số.
  - Bắt buộc gửi `merchantId`. Nếu thiếu, `ApplicableFeeRuleService.findAssignments` thêm điều kiện
    `merchantId IS NULL`.
  - Khi đó khối sẽ mất mọi bản gán "Merchant cụ thể", cả bản cũ chỉ có `merchantId` lẫn bản mới có
    cặp subject, và chỉ còn lại quy tắc nhóm.
- Backend tự tra nhóm của merchant khi có `subjectId` (`ApplicableFeeRuleService.resolveCustomerGroup`).
- Khi có `merchantId` trong query, bản gán cũ chỉ có `merchantId` cũng được tính là `ACCOUNT`
  (`resolveObjectType`).
- Cột "Đối tượng áp dụng": nhãn `ACCOUNT` hiện "Merchant cụ thể" (dòng phụ là tên merchant),
  `CUSTOMER_GROUP` hiện "Nhóm merchant". Phía ví giữ nguyên nhãn cũ.
- Tiêu đề: "Quy tắc phí thu hộ / chi hộ dành riêng cho merchant này".
- Empty state: "Merchant này chưa có quy tắc phí riêng — đang áp dụng biểu phí chung."
- Chỉ hiện với người có quyền xem của `MERCHANT_FEE_CONFIG`. Người không có quyền thì không thấy
  khối này, thay vì thấy lỗi.

## Ràng buộc

- Giữ đúng các quy ước đang dùng: RTK Query, zod schema, react-hook-form, `FormSelect`, `Can` /
  `useScreenAccess`, comment tiếng Việt ở mức như code xung quanh.
- Luồng ví (Cấu hình phí đầu ra, tab phí của chi tiết ví) không được đổi hành vi, trừ việc ẩn thu hộ
  / chi hộ khi tạo mới ở màn chung.
- Test bằng Vitest + Testing Library như các test đã có (`FeeSetting.test.tsx`, test của
  fee-config). Tối thiểu phải có:
  - Payload gán ở cả ba lựa chọn, kèm cặp subject cho `SUBJECT`.
  - Ô người chịu khóa đúng lựa chọn và schema chặn payer khác `MERCHANT`.
  - Danh sách luôn gửi `feeDomain=MERCHANT`.
  - Chuyển hướng giữa hai màn sửa.
  - Khối quy tắc trong chi tiết merchant gửi đúng tham số và hiện đúng empty state.

## Để builder quyết

- Hình thức của biến thể (prop, context hay wrapper).
- Cách đặt tên file và component mới.
- Cách hiện nhãn "Sắp hỗ trợ": hậu tố trong label hoặc tag nhỏ.
- Icon của mục menu.
- Có cần ẩn bộ lọc "Bên chịu phí" (`feeBearer`) trong danh sách merchant hay không. Lúc này bộ lọc
  đó vô nghĩa vì luôn là Merchant.

## Việc tiếp theo (ngoài spec này)

Spec backend cho người chịu phí thu hộ / chi hộ. Ở thu hộ, khách hàng chịu phí thì số tiền trên QR
bằng tiền đơn cộng phí, và phí chốt lúc tạo đơn. Ở chi hộ, khách hàng chịu phí thì ngân hàng nhận
tiền chi trừ phí. Spec đó sẽ sửa `flexpay.fee`, `flex.merchant`, `flexpay.wallet-core` và có thể cả
payment-gateway. Khi backend xong, mở khóa các lựa chọn ở ô Người chịu.
