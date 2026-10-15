/** Số tiền VND nguyên, không rút gọn (The Full Digit Rule). */
export const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN').format(value)
