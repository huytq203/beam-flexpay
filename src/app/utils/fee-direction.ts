/**
 * Chiều dòng tiền của một loại dịch vụ, xét theo ranh giới ngân hàng.
 *
 * Danh sách bám `com.flexpay.fee.common.enums.ServiceType` của service phí —
 * thêm giá trị ở BE thì phải khai thêm ở đây, nếu không chiều tiền trả về null
 * và bảng hiện dấu gạch ngang thay vì đoán bừa.
 *
 * BE không lưu trường này — nó được suy ra từ `serviceType` để phục vụ đối
 * soát: tiền đi VÀO ví từ bên ngoài, đi RA khỏi ví ra bên ngoài, hay chỉ luân
 * chuyển trong nội bộ FlexPay (không phát sinh phí ngân hàng).
 *
 * `EWALLET_CASHBACK` tuy làm tăng số dư ví nhưng là bút toán nội bộ do FlexPay
 * chi, không qua ngân hàng, nên xếp vào INTERNAL để không lẫn vào bảng đối
 * soát ngân hàng.
 */
export const FeeDirection = {
  IN: 'IN',
  OUT: 'OUT',
  INTERNAL: 'INTERNAL'
} as const

export type FeeDirection = (typeof FeeDirection)[keyof typeof FeeDirection]

const DIRECTION_BY_SERVICE_TYPE: Readonly<Record<string, FeeDirection>> = {
  EWALLET_DEPOSIT: FeeDirection.IN,
  MERCHANT_VA_BILL_COLLECTION: FeeDirection.IN,
  EWALLET_WITHDRAWAL: FeeDirection.OUT,
  EWALLET_TRANSFER_EXTERNAL: FeeDirection.OUT,
  PAYOUT_BANK_TRANSFER: FeeDirection.OUT,
  EWALLET_TRANSFER_INTERNAL: FeeDirection.INTERNAL,
  EWALLET_CASHBACK: FeeDirection.INTERNAL
}

export const FEE_DIRECTION_LABEL: Readonly<Record<FeeDirection, string>> = {
  [FeeDirection.IN]: 'Đầu vào',
  [FeeDirection.OUT]: 'Đầu ra',
  [FeeDirection.INTERNAL]: 'Nội bộ'
}

export const FEE_DIRECTION_HINT: Readonly<Record<FeeDirection, string>> = {
  [FeeDirection.IN]: 'Tiền vào ví từ ngân hàng hoặc kênh thu hộ',
  [FeeDirection.OUT]: 'Tiền rời ví ra ngân hàng',
  [FeeDirection.INTERNAL]: 'Luân chuyển trong FlexPay, không qua ngân hàng'
}

export const FEE_DIRECTION_ORDER: readonly FeeDirection[] = [
  FeeDirection.IN,
  FeeDirection.OUT,
  FeeDirection.INTERNAL
]

/** Danh sách `serviceType` hợp lệ của một chiều — dùng để lọc option trong form. */
export const getServiceTypesByDirection = (
  direction: FeeDirection
): readonly string[] =>
  Object.keys(DIRECTION_BY_SERVICE_TYPE).filter(
    (serviceType) => DIRECTION_BY_SERVICE_TYPE[serviceType] === direction
  )

/**
 * `AdminFeePolicyController.search` khai `@RequestParam ServiceType serviceType`
 * — MỘT giá trị enum, không phải danh sách. Gửi chuỗi nhiều giá trị sẽ hỏng ở
 * bước convert enum và trả 400.
 *
 * Nên chiều tiền chỉ nhóm, còn loại dịch vụ mới là thứ lọc. Đổi thành `true`
 * sau khi BE đổi tham số đó sang `List<ServiceType>`.
 */
export const BE_SUPPORTS_SERVICE_TYPE_LIST = false

/** Giá trị `serviceType` gửi lên khi API đã lọc được nhiều loại cùng lúc. */
export const getDirectionServiceTypeParam = (
  direction: FeeDirection | null
): string | undefined =>
  direction && BE_SUPPORTS_SERVICE_TYPE_LIST
    ? getServiceTypesByDirection(direction).join(',')
    : undefined

export const isFeeDirection = (value: unknown): value is FeeDirection =>
  typeof value === 'string' && value in FEE_DIRECTION_LABEL

export const getFeeDirection = (
  serviceType: string | null | undefined
): FeeDirection | null =>
  serviceType ? DIRECTION_BY_SERVICE_TYPE[serviceType] ?? null : null

/**
 * Lọc bảng nhãn `serviceType` xuống còn các mục thuộc một chiều.
 * Trả nguyên bảng khi không chọn chiều nào.
 */
export const filterServiceTypeLabels = <T extends Record<string, string>>(
  labels: T,
  direction: FeeDirection | null
): Record<string, string> => {
  if (!direction) return { ...labels }

  return Object.fromEntries(
    Object.entries(labels).filter(
      ([serviceType]) => getFeeDirection(serviceType) === direction
    )
  )
}
