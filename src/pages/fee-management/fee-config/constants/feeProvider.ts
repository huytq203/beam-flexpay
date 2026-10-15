import type { FeePaymentPartner } from '@type/fee.type'

/** Một nguồn duy nhất ở `feeConfigFields`; giữ re-export để các chỗ import cũ không phải đổi. */
export { allowsProviderCriteria } from './feeConfigFields'

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
