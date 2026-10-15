import type { FeePaymentPartner } from '@type/fee.type'

/**
 * Nạp, rút và hoàn tiền (hoàn một lệnh nạp/rút đã đi qua nhà cung cấp) mới có nhà cung cấp;
 * backend từ chối nhà cung cấp ở loại giao dịch khác.
 */
export const PROVIDER_SERVICE_TYPES: readonly string[] = [
  'EWALLET_DEPOSIT',
  'EWALLET_WITHDRAWAL',
  'EWALLET_REFUND'
]

export const allowsProviderCriteria = (
  serviceType: string | null | undefined
): boolean => PROVIDER_SERVICE_TYPES.includes(serviceType ?? '')

/**
 * Nhà cung cấp chọn được: cổng thuần (NAPAS, VIETQR). Ngân hàng liên kết trực tiếp là
 * nhà cung cấp kiêm phát hành nên cấu hình ở ô Ngân hàng phát hành; backend từ chối ở đây.
 * Đối tác chưa tích hợp (INACTIVE) vẫn chọn được để cấu hình sẵn.
 */
export const toProviderOptions = (
  partners: readonly FeePaymentPartner[] | undefined
) =>
  (partners ?? [])
    .filter((partner) => partner.provider && !partner.issuer)
    .map((partner) => ({
      value: partner.code,
      label: `${partner.name} (${partner.code})${partner.status === 'INACTIVE' ? ' · chưa tích hợp' : ''}`
    }))

export const PROVIDER_HINT =
  'Cổng thanh toán trung gian (NAPAS, VietQR). Để trống là mọi nhà cung cấp. Ngân hàng liên kết trực tiếp (VCB, VPBank) chọn ở ô Ngân hàng phát hành.'
