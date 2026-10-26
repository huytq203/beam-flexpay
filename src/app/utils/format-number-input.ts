/**
 * Định dạng hiển thị cho ô nhập số theo chuẩn Việt Nam (1.234.567,89): dấu chấm
 * phân cách hàng nghìn ở phần nguyên, dấu phẩy là phần thập phân. Giá trị đưa vào
 * là chuỗi số chuẩn (dấu chấm thập phân) như antd truyền; chỉ đổi cách hiển thị,
 * giá trị lưu trong form vẫn là số.
 */
export const formatThousands = (value: string | number | undefined): string => {
  if (value === undefined || value === '') return ''
  const text = String(value)
  const negative = text.startsWith('-')
  const [integer, ...decimal] = (negative ? text.slice(1) : text).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const fraction = decimal.length > 0 ? `,${decimal.join('')}` : ''
  return `${negative ? '-' : ''}${grouped}${fraction}`
}

/** Ngược lại với `formatThousands`: bỏ dấu chấm nghìn, đổi dấu phẩy về dấu chấm thập phân. */
export const parseThousands = (value: string | undefined): string =>
  value ? value.replace(/\./g, '').replace(',', '.') : ''
