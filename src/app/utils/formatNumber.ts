interface FormatNumberOptions {
  decimals?: number
  locale?: string
  currency?: string
}

interface CurrencyOptions {
  symbol?: string // Ký hiệu hiển thị: '₫', '$', '€', '£', ...
  locale?: string // 'vi-VN', 'en-US', ...
  position?: 'before' | 'after' // Vị trí ký hiệu: '$100' vs '100 ₫'
}

export function formatNumber(
  value: number | string,
  options: FormatNumberOptions = {}
): string {
  const { decimals, locale = 'vi-VN', currency } = options

  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return '0'

  if (currency) {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: decimals ?? 0,
      maximumFractionDigits: decimals ?? 0
    }).format(num)
  }

  const formatted = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 2
  }).format(num)

  return formatted
}

/**
 * Format số kèm ký hiệu tiền tệ tùy chọn
 * @example formatCurrency(1000000) => "1.000.000 ₫"
 * @example formatCurrency(1000000, { symbol: '$', position: 'before' }) => "$1.000.000"
 * @example formatCurrency(1000000, { symbol: '€', position: 'after' }) => "1.000.000 €"
 */
export function formatCurrency(
  value: number | string,
  options: CurrencyOptions = {}
): string {
  const { symbol = '₫', locale = 'vi-VN', position = 'after' } = options
  const num = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(num)) return position === 'before' ? `${symbol}0` : `0 ${symbol}`

  const formatted = num.toLocaleString(locale)

  return position === 'before'
    ? `${symbol}${formatted}`
    : `${formatted} ${symbol}`
}

/**
 * Format số rút gọn (K, M, B) kèm ký hiệu tiền tệ tùy chọn
 * @example formatCurrencyShort(1000000) => "1,0M ₫"
 * @example formatCurrencyShort(1000000, { symbol: '$', position: 'before' }) => "$1,0M"
 */
export function formatCurrencyShort(
  value: number | string,
  options: CurrencyOptions = {}
): string {
  const { symbol = '₫', locale = 'vi-VN', position = 'after' } = options
  const num = typeof value === 'string' ? parseFloat(value) : value

  const attachSymbol = (str: string) =>
    position === 'before' ? `${symbol}${str}` : `${str} ${symbol}`

  if (isNaN(num)) return attachSymbol('0')

  const billion = 1_000_000_000
  const million = 1_000_000
  const thousand = 1_000

  const short = (n: number, unit: string) =>
    attachSymbol(`${n.toFixed(1).replace('.', ',')}${unit}`)

  if (num >= billion) return short(num / billion, 'B')
  if (num >= million) return short(num / million, 'M')
  if (num >= thousand) return short(num / thousand, 'K')

  return attachSymbol(num.toLocaleString(locale))
}

/**
 * Parse formatted number về number
 * @example parseNumber("1.000.000,5") => 1000000.5
 */
export function parseNumber(value: string): number {
  const cleaned = value.replace(/\./g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}
