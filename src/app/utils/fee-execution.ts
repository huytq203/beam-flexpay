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
  EWALLET_REFUND: 'USER',
  MERCHANT_VA_BILL_COLLECTION: 'MERCHANT',
  PAYOUT_BANK_TRANSFER: 'MERCHANT'
}

/**
 * Loại dịch vụ cho người vận hành CHỌN người chịu phí đầu ra trong một tập, thay
 * vì suy cố định ra một giá trị. Hoàn tiền: `USER` trừ vào số khách thực nhận,
 * `MERCHANT` cộng vào số merchant bị trừ. Giá trị đầu tiên là mặc định; chưa
 * khai ở đây thì chỉ có đúng payer của `EXECUTABLE_PAYER_BY_SERVICE`.
 */
const SELECTABLE_PAYERS_BY_SERVICE: Readonly<
  Record<string, readonly string[]>
> = {
  EWALLET_REFUND: ['USER', 'MERCHANT'],
  // Chuyển tiền: `USER` = người gửi bị trừ thêm phí, `RECEIVER` = phí trừ vào
  // tiền người nhận nhận được.
  EWALLET_TRANSFER_INTERNAL: ['USER', 'RECEIVER']
}

/**
 * Dịch vụ mà toàn bộ phí đầu ra của một chính sách phải do cùng một bên chịu.
 * Sổ cái chỉ có một cặp net/gross cho mỗi lần chuyển, nên không tách phí cho
 * cả người gửi và người nhận được; backend từ chối lúc duyệt.
 */
const SINGLE_BEARER_SERVICES: readonly string[] = ['EWALLET_TRANSFER_INTERNAL']

export const requiresSingleFeeBearer = (
  serviceType: string | null | undefined
): boolean =>
  Boolean(serviceType && SINGLE_BEARER_SERVICES.includes(serviceType))

/**
 * Chân phí dương hiện ghi sổ được với người hưởng SYSTEM hoặc BANK. BANK chỉ là
 * nhãn báo cáo — bút toán GL vẫn Credit vào doanh thu của SYSTEM y như trước,
 * chưa có tách sổ hay tự động trả tiền cho ngân hàng. Merchant, đối tác và cơ
 * quan thuế vẫn bị từ chối khi duyệt.
 */
export const EXECUTABLE_BENEFICIARIES = ['SYSTEM', 'BANK'] as const

/** Giá trị mặc định khi thêm thành phần phí mới. */
export const EXECUTABLE_BENEFICIARY: (typeof EXECUTABLE_BENEFICIARIES)[number] =
  'SYSTEM'

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
  serviceType ? (EXECUTABLE_PAYER_BY_SERVICE[serviceType] ?? null) : null

/** Người chịu phí đầu ra được phép chọn; phần tử đầu là mặc định. */
export const getSelectablePayers = (
  serviceType: string | null | undefined
): readonly string[] => {
  if (!serviceType) return []
  return (
    SELECTABLE_PAYERS_BY_SERVICE[serviceType] ??
    [EXECUTABLE_PAYER_BY_SERVICE[serviceType]].filter(Boolean)
  )
}

/**
 * Bản gán của dịch vụ ví không được mang merchant: fee engine không nhận được
 * ngữ cảnh merchant có thẩm quyền từ luồng ví.
 */
export const allowsMerchantCriteria = (
  serviceType: string | null | undefined
): boolean => getExecutablePayer(serviceType) === 'MERCHANT'
// Cố ý suy từ payer MẶC ĐỊNH: `EWALLET_REFUND` cho chọn payer MERCHANT nhưng bản
// gán của nó vẫn cấm merchantId (danh sách merchant của fee service chưa có dữ liệu).

/**
 * Loại thẻ chưa phải ngữ cảnh producer chứng thực được, nên mọi bản gán mang
 * loại thẻ đều bị từ chối khi duyệt. Giữ hằng số này để chỗ nào còn hiển thị
 * trường đó cũng đọc chung một nguồn khi backend mở ra.
 */
export const SUPPORTS_CARD_TYPE_CRITERIA = false
