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
 * Chuyển tiền cho người gửi chịu, người nhận chịu hoặc cả hai chịu. Cả hai chịu là hai thành phần
 * cùng loại phí, mỗi bên một thành phần; riêng phí phụ thuộc (VAT) chỉ khai một dòng và backend
 * tự tách theo phí của từng bên. Luật kiểm tra nằm ở `validateTransferBearers`.
 */
const BEARER_SPLIT_SERVICES: readonly string[] = ['EWALLET_TRANSFER_INTERNAL']

export const supportsBearerSplit = (
  serviceType: string | null | undefined
): boolean =>
  Boolean(serviceType && BEARER_SPLIT_SERVICES.includes(serviceType))

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

/**
 * Loại giao dịch tạm ẩn khỏi các ô chọn và tab lọc của màn cấu hình phí. Chỉ là ẩn giao diện:
 * `PUBLISHABLE_SERVICE_TYPES` và mọi luật kiểm tra vẫn nhận đủ các loại này nên chính sách đã có
 * vẫn đọc, sửa và duyệt bình thường. Bật lại chỉ cần bỏ loại khỏi danh sách.
 */
export const TEMPORARILY_HIDDEN_SERVICE_TYPES: readonly string[] = [
  'MERCHANT_VA_BILL_COLLECTION',
  'PAYOUT_BANK_TRANSFER'
]

/**
 * Bỏ các loại tạm ẩn khỏi danh sách để chọn, trừ loại đang được chọn: chính sách cũ thuộc loại ẩn
 * vẫn hiện đúng nhãn của nó thay vì rơi về mã thô.
 */
export const withoutHiddenServiceTypes = (
  serviceTypes: readonly string[],
  current?: string | null
): readonly string[] =>
  serviceTypes.filter(
    (serviceType) =>
      serviceType === current ||
      !TEMPORARILY_HIDDEN_SERVICE_TYPES.includes(serviceType)
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
