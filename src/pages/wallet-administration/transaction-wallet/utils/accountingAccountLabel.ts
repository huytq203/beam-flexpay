const ACCOUNT_LABELS: Readonly<Record<string, string>> = {
  SYS_BANK_SETTLEMENT_VND: 'Tài khoản thanh toán ngân hàng',
  REV_USER_FEE: 'Doanh thu phí người dùng',
  USER_WALLET_VND: 'Ví người dùng'
}

/** Backend trả `GL_CODE` hoặc `GL_CODE (định danh)`; chỉ dịch phần mã, giữ nguyên định danh. */
export const formatAccountingAccount = (value?: string | null): string => {
  if (!value) return '--'
  const [code, ...rest] = value.split(' ')
  const label = ACCOUNT_LABELS[code]
  return label ? [label, ...rest].join(' ') : value
}
