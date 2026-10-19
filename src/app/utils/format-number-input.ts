/**
 * Định dạng hiển thị cho ô nhập số: dấu phẩy phân cách hàng nghìn ở phần nguyên,
 * dấu chấm là phần thập phân. Chỉ đổi cách hiển thị, giá trị lưu trong form vẫn là số.
 */
export const formatThousands = (value: string | number | undefined): string => {
  if (value === undefined || value === '') return ''
  const text = String(value)
  const negative = text.startsWith('-')
  const [integer, ...decimal] = (negative ? text.slice(1) : text).split('.')
  const grouped = integer.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  const fraction = decimal.length > 0 ? `.${decimal.join('')}` : ''
  return `${negative ? '-' : ''}${grouped}${fraction}`
}

/** Ngược lại với `formatThousands`: bỏ dấu phẩy để ô số đọc lại được giá trị. */
export const parseThousands = (value: string | undefined): string =>
  value ? value.replace(/,/g, '') : ''
