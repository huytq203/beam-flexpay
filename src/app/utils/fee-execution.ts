/**
 * Bản sao phía FE của `FeeExecutionCapabilityRegistry` bên service phí.
 *
 * Registry đó chỉ chạy lúc DUYỆT, không chạy lúc tạo. Nghĩa là một chính sách
 * cấu hình sai vẫn lưu được rồi tắc ở bước duyệt, và người vận hành chỉ biết
 * sau khi đã nhập xong cả màn. File này đẩy đúng bộ ràng buộc đó lên form để
 * lỗi lộ ra ngay lúc chọn, không phải lúc trình duyệt.
 *
 * Đổi ở BE thì phải đổi ở đây — nếu không, form sẽ mở ra những lựa chọn mà
 * backend từ chối, hoặc chặn mất những lựa chọn backend đã cho phép.
 */

/** Người chịu phí mà downstream thật sự thu được, xét theo loại dịch vụ. */
const EXECUTABLE_PAYER_BY_SERVICE: Readonly<Record<string, string>> = {
  EWALLET_DEPOSIT: 'USER',
  EWALLET_WITHDRAWAL: 'USER',
  EWALLET_TRANSFER_INTERNAL: 'USER',
  MERCHANT_VA_BILL_COLLECTION: 'MERCHANT',
  PAYOUT_BANK_TRANSFER: 'MERCHANT'
}

/**
 * Chân phí dương hiện chỉ ghi sổ được về hệ thống. Ngân hàng, merchant, đối tác
 * và cơ quan thuế đều bị từ chối khi duyệt, nên ô chọn người hưởng không còn là
 * một quyết định.
 */
export const EXECUTABLE_BENEFICIARY = 'SYSTEM'

/** Đơn vị tiền tệ duy nhất fee engine hỗ trợ (minor-unit scale 0). */
export const EXECUTABLE_CURRENCY = 'VND'

/**
 * Hai loại dịch vụ dưới đây chưa có hợp đồng thực thi nên duyệt là hỏng:
 * `EWALLET_TRANSFER_EXTERNAL` thiếu producer/journal mapping,
 * `EWALLET_CASHBACK` chưa có hợp đồng cho chân phí. Không bày ra để chọn.
 */
export const PUBLISHABLE_SERVICE_TYPES: readonly string[] = Object.keys(
  EXECUTABLE_PAYER_BY_SERVICE
)

export const isPublishableServiceType = (
  serviceType: string | null | undefined
): boolean => Boolean(serviceType && serviceType in EXECUTABLE_PAYER_BY_SERVICE)

/**
 * Người chịu phí suy ra từ loại dịch vụ. Trả `null` khi loại dịch vụ chưa chọn
 * hoặc không nằm trong hợp đồng thực thi — gọi chỗ dùng phải hiển thị dấu chờ
 * thay vì đoán bừa một giá trị rồi gửi lên.
 */
export const getExecutablePayer = (
  serviceType: string | null | undefined
): string | null =>
  serviceType ? EXECUTABLE_PAYER_BY_SERVICE[serviceType] ?? null : null

/**
 * Bản gán của dịch vụ ví không được mang merchant: fee engine không nhận được
 * ngữ cảnh merchant có thẩm quyền từ luồng ví.
 */
export const allowsMerchantCriteria = (
  serviceType: string | null | undefined
): boolean => getExecutablePayer(serviceType) === 'MERCHANT'

/**
 * Loại thẻ và nhóm khách hàng chưa phải ngữ cảnh producer chứng thực được, nên
 * mọi bản gán mang chúng đều bị từ chối khi duyệt. Giữ hằng số này để chỗ nào
 * còn hiển thị hai trường đó cũng đọc chung một nguồn khi backend mở ra.
 */
export const SUPPORTS_CARD_TYPE_CRITERIA = false
export const SUPPORTS_CUSTOMER_GROUP_CRITERIA = false
