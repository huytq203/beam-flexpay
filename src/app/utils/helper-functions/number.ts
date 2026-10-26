export const moneyInputFormatter = (value?: string) => {
  if (value !== undefined) {
    return `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  }
  return ''
}

export const convertNumber = (
  amount: string | number,
  suffix?: string | undefined
) => {
  if (!amount && amount !== 0) return '-'

  return (
    amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') + (suffix ?? '')
  )
}

export const convertLocalStringNumber = (number?: number | string) => {
  if (!number) return 0
  return typeof number === 'string' || typeof number === 'number'
    ? Number(number).toLocaleString('vi-VN')
    : 0
}

export const parseNumberFromCommaString = (value?: string): number => {
  return Number((value ?? '').replace(/\./g, '').replace(',', '.'))
}

export const parseNumberFromPercentString = (value?: string): number => {
  return Number((value ?? '').replace('%', ''))
}

export const convertMiniPercentToPercent = (value?: number): string => {
  if (!value) return ''
  return `${(value / 1000).toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')}%`
}

export const convertPercentToMiniPercent = (
  value?: number
): number | undefined => {
  if (value === undefined || value === null) return undefined
  return Math.round(value * 1000)
}

export const convertMiniPercentToPercentNumber = (
  value?: number
): number | undefined => {
  if (value === undefined || value === null) return undefined
  return value / 1000
}

export const isNullOrZero = (value: unknown): boolean => {
  return value === null || value === undefined || value === 0
}
