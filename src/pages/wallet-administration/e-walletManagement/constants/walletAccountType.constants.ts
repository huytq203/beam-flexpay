export const OWNER_TYPE_LABELS: Readonly<Record<string, string>> = {
  USER: 'Ví cá nhân',
  MERCHANT: 'Ví thu hộ merchant',
  ENTERPRISE: 'Ví doanh nghiệp',
  SYSTEM: 'Tài khoản hệ thống'
}

/** Nhãn chi tiết cho từng GL code của tài khoản hệ thống. */
export const SYSTEM_GL_LABELS: Readonly<Record<string, string>> = {
  REV_USER_FEE: 'Tài khoản doanh thu phí',
  REV_MERCHANT_MDR: 'Tài khoản doanh thu phí merchant',
  SYS_BANK_SETTLEMENT_VND: 'Tài khoản thanh toán ngân hàng',
  SYS_CASH_IN_SUSPENSE_VND: 'Tài khoản treo nạp tiền'
}
