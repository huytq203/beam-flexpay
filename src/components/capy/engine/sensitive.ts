const MONEY = /\d{1,3}([.,]\d{3})+|VND|VNĐ|₫/i
const LONG_DIGITS = /\d{9,}/
const MAX_CANDIDATES = 600
const MAX_TEXT = 80

/** Ô chứa dữ liệu nhạy cảm đoán theo ô thường gặp trong bảng và thẻ thống kê. */
export const SENSITIVE_CANDIDATES = [
  'td',
  '.ant-table-cell',
  '.ant-statistic-content',
  '.ant-descriptions-item-content',
  '[class*="amount"]',
  '[class*="balance"]'
].join(',')

const CELL = 'td, .ant-table-cell'
const ACTION = 'button, [role="button"], a.ant-btn'

/** Số tiền (có phân cách nghìn hoặc đơn vị VND), hoặc dãy từ 9 chữ số (tài khoản, điện thoại, giấy tờ). */
export function isSensitiveText(text: string): boolean {
  const value = text.trim()
  if (!value || value.length > MAX_TEXT) return false
  return MONEY.test(value) || LONG_DIGITS.test(value.replace(/[\s.-]/g, ''))
}

/** Tự nhận biết các phần tử Capy không được che: ô có số tiền, số dài, hoặc ô chứa nút thao tác. */
export function findSensitiveElements(doc: Document = document): Element[] {
  return Array.from(doc.querySelectorAll(SENSITIVE_CANDIDATES))
    .slice(0, MAX_CANDIDATES)
    .filter(
      (el) =>
        isSensitiveText(el.textContent ?? '') ||
        (el.matches(CELL) && el.querySelector(ACTION) !== null)
    )
}
