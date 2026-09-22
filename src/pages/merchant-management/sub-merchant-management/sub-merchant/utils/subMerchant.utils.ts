import dayjs from 'dayjs'

import type { SubMerchantRow } from '../types/subMerchant.type'
import type { SubMerchantFiltersValue } from '../hooks/useSubMerchants'

export const SUB_MERCHANT_PAGE_SIZE = 10

const normalizeText = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .toLocaleLowerCase('vi-VN')
    .trim()

const parseCreatedDate = (value: string) => {
  const [date, month, year] = value.split('/')
  return dayjs(`${year}-${month}-${date}`)
}

export const filterSubMerchants = (
  rows: readonly SubMerchantRow[],
  filters: SubMerchantFiltersValue
): SubMerchantRow[] => {
  const query = normalizeText(filters.query)
  const start = filters.createdRange?.[0]
  const end = filters.createdRange?.[1]

  return rows.filter((row) => {
    const searchable = normalizeText(
      [row.code, row.name, row.parentMerchantCode, row.parentMerchantName, row.phone].join(' ')
    )
    const createdAt = parseCreatedDate(row.createdAt)
    const matchesDate =
      (!start || !createdAt.isBefore(dayjs(start).startOf('day'))) &&
      (!end || !createdAt.isAfter(dayjs(end).endOf('day')))

    return (
      (!query || searchable.includes(query)) &&
      (!filters.parentMerchantId || row.parentMerchantId === filters.parentMerchantId) &&
      (!filters.status || row.status === filters.status) &&
      matchesDate
    )
  })
}

export const paginateSubMerchants = (
  rows: readonly SubMerchantRow[],
  page: number
): SubMerchantRow[] => {
  const start = (page - 1) * SUB_MERCHANT_PAGE_SIZE
  return rows.slice(start, start + SUB_MERCHANT_PAGE_SIZE)
}

export const formatVnd = (value: number): string =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
