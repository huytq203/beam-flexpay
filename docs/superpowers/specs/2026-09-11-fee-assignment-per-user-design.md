# Thiết kế: Gán chính sách phí cho riêng một người dùng

- **Ngày:** 2026-09-11
- **Trạng thái:** Chờ duyệt thiết kế
- **Phạm vi:** Thêm tiêu chí chủ thể vào bản ghi gán của `flexpay.fee`, và ô chọn người dùng ở màn Cấu hình phí của `ewallet-cms-web`
- **Hai repo:** `be/flexpay/flexpay.fee` và `fe/ewallet-cms-web`

## Bối cảnh & Vấn đề

Biểu phí cần ba mức gán đè lên nhau: một người dùng đặc biệt đè lên nhóm, nhóm đè lên biểu phí chung. Hôm nay chỉ có mức đơn vị chấp nhận thanh toán; mọi người dùng ví đều chịu chung một mức.

Bảng `fee_policy_assignments` có sáu tiêu chí khớp lệnh — `merchant_id`, `bank_code`, `payment_method`, `card_type`, `service_type`, `customer_group` — và **không có cột nào trỏ tới một người dùng**.

**Tin tốt:** mã người dùng đã nằm sẵn trên đường truyền và đã được ký.

`FeeCommitQuoteRequest` khai `subjectType` (`@NotNull`) và `subjectId` (`@NotBlank`, tối đa 128 ký tự). `FeeCalculationService.validateCallerContext` bắt ví phải gửi `subjectType=USER` và không được mang `merchantId`; bắt merchant phải gửi `subjectType=MERCHANT` với `subjectId` bằng đúng UUID merchant đó. `FeeQuoteCanonicalizer.commitRequestHash` đưa cả hai vào phong bì băm. Wallet-core đối chiếu lại `subjectId` với người khởi tạo bút toán (`FeeQuoteContractValidator`, thông điệp *"Fee quote subjectId does not match the journal initiator"*).

**Chỗ đứt duy nhất:** `FeeCommitQuoteRequest.toCalculationRequest()` dựng `FeeCalculationRequest` mà **bỏ rơi `subjectType` và `subjectId`**. Tầng khớp lệnh không bao giờ nhìn thấy chủ thể.

### Vì sao mức người dùng rẻ hơn mức nhóm

`FeeQuoteCanonicalizer.normalizedContext` gồm đúng tám khoá: `merchantId`, `bankCode`, `paymentMethod`, `cardType`, `customerGroup`, `currency`, `serviceType`, `amount`. Chủ thể **không** nằm trong đó — nó ở phong bì ngoài.

Wallet-core kiểm `normalizedContext` phải đúng thứ tự khoá chuẩn (*"normalizedContext keys/order are not canonical"*). Nên:

- Dùng **chủ thể** để khớp lệnh: không đổi `normalizedContext`, không tăng `FeeEngineContract.CONTEXT_SCHEMA_VERSION` (đang là 1), không sửa wallet-core.
- Dùng **nhóm khách hàng** để khớp lệnh: nhóm nằm ngay trong `normalizedContext`, nên phải tăng phiên bản lược đồ và sửa bộ kiểm của wallet-core. Đó là việc của một spec khác.

## Lỗi phát hiện trong lúc khảo sát

### L1 — Sửa bản gán mà thiếu `merchantId` sẽ âm thầm nới phí ra toàn hệ thống

`FeePolicyAssignmentUpdateRequest.merchantId` không có ràng buộc nào, và `FeePolicyAssignmentMapper.updateEntity` ghi đè vô điều kiện:

```java
entity.setMerchantId(request.getMerchantId());
```

Client gọi `PUT /fee/policy-assignments/{id}` chỉ để đổi ngày hiệu lực mà không gửi lại `merchantId` sẽ biến một bản gán riêng cho một đơn vị chấp nhận thanh toán thành bản gán áp cho **mọi** đơn vị. Không có thông báo nào, và bản ghi vẫn ở trạng thái hợp lệ.

Cùng một cơ chế sẽ áp cho `subject_id` sau khi thêm cột, với hậu quả nặng hơn: bản gán miễn phí cho một tài khoản nội bộ trở thành miễn phí cho tất cả.

- **Mức độ:** cao — sai số tiền trên diện rộng, không có dấu hiệu nhận biết.
- **Đề xuất:** giữ nguyên ngữ nghĩa thay thế toàn phần của `PUT`, nhưng bổ sung kiểm tra chéo ở tầng service: nếu bản ghi đang có `merchantId`/`subjectId` mà request gửi rỗng, từ chối với thông điệp nói rõ đây là thao tác nới phạm vi, buộc client gửi lại tường minh. Việc nới phạm vi phải là một quyết định, không phải một thiếu sót.
- **Đã kiểm:** màn Cấu hình phí mới của CMS luôn gửi đủ tiêu chí từ biểu mẫu nên không dính lỗi này. Màn Quản lý gán phí cũ thì chưa rà.

### L2 — `service_type` được chấm 2 điểm nhưng không bao giờ phân định được gì

`findMatchingAssignments` bắt `TRIM(fpa.serviceType) = :serviceTypeName`, tức bản gán bỏ trống loại dịch vụ **không bao giờ khớp**. Vậy mọi ứng viên bước vào vòng xếp hạng đều đã có loại dịch vụ, và `+2` trong `getSpecificityScore` là hằng số cộng cho tất cả.

- **Mức độ:** thấp — không gây sai kết quả, nhưng làm thang điểm khó đọc và dễ tính nhầm khi thêm tiêu chí mới.
- **Đề xuất:** không sửa trong đợt này. Ghi chú lại trong `getSpecificityScore` để người sau không tưởng nó đang phân định.

### L3 — Tab cấu hình phí ở màn chi tiết ví đang nhét mã ví vào tham số merchant

`useFeeSettingRules` gọi `applicable-rules` với `merchantId: walletId`. Không bản gán nào có `merchant_id` bằng một mã ví, nên `findAssignments` chỉ trả về các bản gán để trống merchant — đúng tập cần hiện, nhưng đúng vì trượt chứ không phải vì lọc.

Hệ quả nhìn thấy được: `resolveObjectType` trả `ACCOUNT` khi `merchantId` khớp `assignment.merchantId`, nên mọi dòng ở tab này luôn hiện là áp chung, kể cả sau khi có bản gán riêng cho chính ví đó.

- **Mức độ:** trung bình — hiển thị sai ngay khi tính năng này lên.
- **Đề xuất:** sửa trong đợt này, xem B7.

## Quyết định đã chốt

1. **Một cặp cột, không phải một cột.** Lưu `subject_type` + `subject_id` chứ không chỉ `user_id`, để mức đơn vị chấp nhận thanh toán sau này dùng lại được cùng cơ chế thay vì có hai đường song song.
2. **`subject_id` kiểu chuỗi 128 ký tự**, khớp `FeeCommitQuoteRequest.subjectId` và cột `subject_id` đã có trên `fee_calculation_logs`. Không dùng UUID: hợp đồng báo giá khai chuỗi, ép kiểu ở tầng lưu là tự tạo lệch.
3. **Điểm độ cụ thể của chủ thể là 128.** Trần của cả sáu tiêu chí hiện có là `32+16+8+4+2+1 = 63`. Đặt 128 thì bản gán cho một chủ thể luôn thắng mọi tổ hợp chung, và còn chừa chỗ cho nhóm ở 64 khi làm mức hai.
4. **Không đụng `normalizedContext`.** Xem phần bối cảnh.
5. **Không sửa L1 và L3 trong cùng commit với tính năng.** Tách commit riêng để rà soát được độc lập.
6. **Mức phí bằng 0 không cần cơ chế mới.** Biểu mẫu đã coi "để trống hết ô mức phí" là miễn phí.

## Thay đổi backend — `flexpay.fee`

### B1. Migration `V9__fee_assignment_subject.sql`

```sql
ALTER TABLE fee_policy_assignments
    ADD COLUMN IF NOT EXISTS subject_type VARCHAR(20),
    ADD COLUMN IF NOT EXISTS subject_id   VARCHAR(128);

CREATE INDEX IF NOT EXISTS idx_fee_policy_assignments_subject
    ON fee_policy_assignments (subject_type, subject_id);
```

Cả hai cột cho phép NULL — NULL là wildcard, đúng khuôn năm tiêu chí chuỗi hiện có. Bản ghi cũ không cần backfill.

### B2. Thực thể `FeePolicyAssignment`

Thêm hai trường, và thêm 128 điểm vào `getSpecificityScore`:

```java
if (isSpecified(subjectId)) score += 128;
```

Chấm theo `subjectId` chứ không theo `subjectType`: `subjectType` không có `subjectId` là một bản ghi vô nghĩa, và luật này phải chặn ở validator chứ không được biến thành điểm.

Bổ sung chú thích: thang điểm là các luỹ thừa của 2 nên hai bản gán bằng điểm nhau tức là **điền đúng cùng một tập ô**. `FeeAssignmentConflictGuard` dựa vào tính chất đó.

### B3. `FeeCommitQuoteRequest.toCalculationRequest()`

Ngừng bỏ rơi chủ thể. `FeeCalculationRequest` nhận thêm `subjectType` và `subjectId`.

`FeeCalculationRequest` cũng là đầu vào của đường `/calculate` cũ (`LEGACY_INTERNAL`) — ở đó hai trường này để trống, và bản gán có chủ thể sẽ không khớp. Đó là hành vi đúng: đường cũ không chứng thực được người dùng là ai.

### B4. `FeePolicyAssignmentRepository.findMatchingAssignments`

Thêm điều kiện theo đúng khuôn wildcard đang dùng cho `bankCode`:

```sql
AND ((:subjectId IS NULL AND NULLIF(TRIM(fpa.subjectId), '') IS NULL)
     OR (:subjectId IS NOT NULL AND (NULLIF(TRIM(fpa.subjectId), '') IS NULL
                                     OR TRIM(fpa.subjectId) = :subjectId)))
AND ((:subjectType IS NULL AND NULLIF(TRIM(fpa.subjectType), '') IS NULL)
     OR (:subjectType IS NOT NULL AND (NULLIF(TRIM(fpa.subjectType), '') IS NULL
                                       OR TRIM(fpa.subjectType) = :subjectType)))
```

`NULLIF(TRIM(x), '')` là bắt buộc, không phải trang trí: đây là bản sao SQL của `FeePolicyAssignment.isWildcard`, và chính sự lệch giữa hai bên đã gây sự cố chuyển tiền nội bộ ngày 17/08.

### B5. `FeeAssignmentConflictGuard.criteriaOverlap`

Thêm cặp chủ thể:

```java
&& compatible(left.getSubjectType(), right.getSubjectType())
&& compatible(left.getSubjectId(), right.getSubjectId())
```

Thiếu bước này thì hai bản gán cho hai người khác nhau bị coi là chồng nhau, và người thứ hai không bật được.

### B6. `FeeExecutionCapabilityRegistry.validateAssignmentForPublication`

Thêm luật, đặt cạnh luật đang chặn `cardType` và `customerGroup`:

- `subjectId` có giá trị mà `subjectType` để trống, hoặc ngược lại → từ chối.
- `subjectType` phải khớp luồng: `USER` cho `EWALLET_DEPOSIT`, `EWALLET_WITHDRAWAL`, `EWALLET_TRANSFER_INTERNAL`; `MERCHANT` cho `MERCHANT_VA_BILL_COLLECTION`, `PAYOUT_BANK_TRANSFER`.
- `subjectType=MERCHANT` thì `subjectId` phải bằng `merchantId` của chính bản gán, khớp đúng luật `validateCallerContext` đang áp cho báo giá.

Đây là ngữ cảnh producer chứng thực được, khác hẳn `cardType` và `customerGroup` — lý do hai cái kia bị chặn vẫn giữ nguyên.

Năm chỗ gọi validator này đều đi qua cùng một hàm nên không phải sửa từng chỗ: `FeeAssignmentApprovalService`, `FeePublicationBootstrapService`, `FeePolicyApprovalService`, `FeePolicyAssignmentService`, `FeePolicyService`.

### B7. `ApplicableFeeRuleService` nhận mã chủ thể

`getApplicableRules` và `countApplicableRules` nhận thêm `subjectType` + `subjectId`, truyền xuống `findAssignments`. `resolveObjectType` trả `ACCOUNT` khi bản gán khớp đúng chủ thể được hỏi.

Đây cũng là chỗ vá L3: tab phí ở màn chi tiết ví chuyển sang truyền `subjectType=USER` + `subjectId=walletId` thay vì nhét vào `merchantId`.

### Không đổi

- `normalizedContext`, `CONTEXT_SCHEMA_VERSION`, `commitRequestHash`.
- `FeeConfigurationCompiler`, `configurationHash`, `FeeConfigurationPublication` — chủ thể quyết định chọn bản gán nào, không quyết định cấu hình được biên dịch ra sao.
- wallet-core và user-wallet: không một dòng nào.
- `fee_calculation_logs`: đã có sẵn `subject_type` và `subject_id` từ migration V8.

## Thay đổi frontend — `ewallet-cms-web`

### F1. Nguồn danh sách người dùng

Dùng lại `useGetAccountQuery` của `apiWalletAccount.api` với `ownerType=USER`. Chuỗi mã đã kiểm nối liền bốn mắt xích:

| Mắt xích | Trường |
|---|---|
| `accounts.owner_id` của wallet-core | chú thích lược đồ: *ID của User hoặc Merchant* |
| user-wallet giữ tiền | `TransactionHoldRequest.ownerId(userIdStr)` |
| user-wallet hỏi phí | `FeeCalculationRequest.subjectId(authenticatedUserId)` |
| dịch vụ phí nhận | `FeeCommitQuoteRequest.subjectId` |

Cùng một biến `userId` được dùng cho cả lệnh giữ tiền lẫn yêu cầu báo giá trong `VcbEwalletService` và `VpBankEwalletService`. Không cần map, không cần API mới.

### F2. `UserPickerField` + `UserPickerDialog`

Dựng theo đúng khuôn `MerchantPickerField`/`MerchantPickerDialog` vừa làm: nút mở hộp thoại, bảng có ô tìm theo số điện thoại, chọn xong đổ lại thông tin ví.

Cột hiển thị lấy từ `ContentAccountWallet`: `ownerUsername` (số điện thoại), `ownerFullName`, `ekycStatus`, `status`, `balance`. Lưu `ownerId` vào biểu mẫu.

### F3. Ma trận field theo miền

`DomainFieldRules` thêm `showSubject`. Bật ở miền Ví, tắt ở Bank và ĐVCNTT — mức đơn vị chấp nhận thanh toán đã có ô riêng.

### F4. Schema và payload

`feeConfigFormSchema` thêm `subjectId: z.string()`. `toAssignmentRequest` gửi `subjectType: 'USER'` và `subjectId` khi có giá trị, bỏ hẳn trường khi để trống — cùng quy tắc đang áp cho `bankCode` và `merchantId`.

### F5. Bảng danh sách

Thêm cột Đối tượng, phân biệt ba mức: một người dùng, một đơn vị, hoặc áp chung. Lấy dữ liệu từ bản gán của chính sách.

## Kiểm thử

### Backend

| Trường hợp | Kỳ vọng |
|---|---|
| Bản gán cho đúng một người + bản gán chung điền kín sáu ô | Bản của người thắng (128 > 63) |
| Bản gán cho người A, báo giá của người B | Không khớp bản của A, rơi về bản chung |
| Báo giá không có chủ thể (đường `/calculate` cũ) | Không khớp bản gán có chủ thể |
| Hai bản gán cho hai người khác nhau | Cả hai bật được, không chặn nhau |
| Hai bản gán cho cùng một người, cùng tiêu chí, cùng ưu tiên | Chốt chặn từ chối lúc bật |
| `subjectId` có, `subjectType` rỗng | Từ chối lúc duyệt |
| `subjectType=USER` trên luồng thu hộ | Từ chối lúc duyệt |
| `subjectType=MERCHANT` với `subjectId` khác `merchantId` | Từ chối lúc duyệt |
| Chuỗi rỗng trong `subject_id` của bản ghi cũ | Đọc như wildcard, không thành điều kiện cụ thể |

Trường hợp cuối chạy trên PostgreSQL thật, cùng khuôn `InternalTransferAssignmentMatchingTest`.

### Frontend

- `toAssignmentRequest` bỏ hẳn `subjectId` khi để trống, gửi kèm `subjectType` khi có.
- Ma trận field bật ô người dùng ở đúng miền Ví.
- Hộp thoại chọn người dùng lưu `ownerId` chứ không lưu `id` của tài khoản ví — hai trường này khác nhau và chọn nhầm thì bản gán không bao giờ khớp.

## Rủi ro

| Rủi ro | Vì sao | Chặn thế nào |
|---|---|---|
| Lấy nhầm `id` tài khoản thay vì `ownerId` | Cùng là UUID, cùng nằm trong một dòng dữ liệu | Test F, và đặt tên biến là `ownerId` suốt cả đường đi |
| Bộ chọn từ chối vì hai bản gán ngang điểm | Ném lỗi giữa luồng giao dịch, người dùng cuối thấy giao dịch hỏng | Thang luỹ thừa 2, cộng chốt chặn ở B5 |
| Đổi thang điểm làm lệch kết quả bản ghi đang chạy | Điểm tính lúc chạy chứ không lưu | Thêm 128 là phép cộng thuần, không đổi thứ tự tương đối của các bản gán hiện có |
| Sửa bản gán làm nới phạm vi | Lỗi L1 | Vá L1 trước khi thêm cột chủ thể |

## Thứ tự triển khai

1. Vá L1 ở `flexpay.fee`, commit riêng.
2. B1 đến B6, kèm test.
3. B7 và vá L3.
4. F1 đến F5.
5. Chạy thử đầu cuối: tạo chính sách miễn phí cho một tài khoản thật, duyệt, bật, rồi gọi báo giá cho đúng tài khoản đó và một tài khoản khác.
