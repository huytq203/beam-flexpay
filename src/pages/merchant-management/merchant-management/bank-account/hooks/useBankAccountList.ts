import { useState } from 'react'
import { useUrlFilters } from '@hooks/useUrlFilters'
import {
  useListBankAccountsQuery,
  type BankAccountDto
} from '@/app/services/merchantBankAccountApi'
import { useGetMerchantQuery } from '@services/apiMerchant'
import { toPickedEntity, type PickedEntity } from '@components/index'
import {
  BANK_ACCOUNT_FILTER_KEYS,
  BANK_ACCOUNT_SENSITIVE_KEYS,
  LEVEL_OPTIONS,
  STATUS_OPTIONS,
  type BankAccountFilterKey
} from '../constants/bankAccount.constants'

type Filters = Partial<Record<BankAccountFilterKey, string>>

// Giá trị trên URL người dùng sửa được, chỉ nhận đúng giá trị có trong danh sách.
const toLevel = (value?: string): BankAccountDto['level'] | undefined =>
  LEVEL_OPTIONS.find((option) => option.value === value)?.value
const toStatus = (value?: string): BankAccountDto['status'] | undefined =>
  STATUS_OPTIONS.find((option) => option.value === value)?.value

// Mã + tên lưu cùng id để hiện lại ô Merchant mà không phải gọi thêm API.
const toMerchant = (filters: Filters): PickedEntity | undefined =>
  filters.merchantId
    ? {
        id: filters.merchantId,
        code: filters.merchantCode ?? '',
        name: filters.merchantName ?? filters.merchantId
      }
    : undefined

export const useBankAccountList = () => {
  const url = useUrlFilters<BankAccountFilterKey>({
    keys: BANK_ACCOUNT_FILTER_KEYS,
    sensitiveKeys: BANK_ACCOUNT_SENSITIVE_KEYS
  })
  const { filters, page, size } = url
  const merchant = toMerchant(filters)
  const level = toLevel(filters.level)
  const status = toStatus(filters.status)
  // Ô nhập đang gõ, chỉ áp dụng khi bấm Tìm kiếm.
  const [keyword, setKeyword] = useState(filters.query ?? '')
  // Chỉ để tra tên Merchant cho cột bảng; chọn Merchant đi qua dialog phân trang.
  const merchants = useGetMerchantQuery({ page: 1, size: 100 })
  const query = useListBankAccountsQuery({
    page,
    size,
    merchantId: merchant?.id,
    level,
    status,
    query: filters.query
  })
  const apply = (next: Filters): void =>
    url.applyFilters({ ...filters, ...next })

  return {
    page,
    size,
    query,
    filters: { keyword, merchant, level, status },
    // Tài khoản chỉ quản lý 1 Merchant thì form tạo điền sẵn Merchant đó.
    defaultMerchant:
      merchant ??
      (merchants.data?.content.length === 1
        ? toPickedEntity(merchants.data.content[0])
        : undefined),
    merchantName: (id?: string) =>
      merchants.data?.content.find((item) => item.id === id)?.name ?? id ?? '—',
    setKeyword,
    setMerchant: (value?: PickedEntity) =>
      apply({
        merchantId: value?.id,
        merchantCode: value?.code,
        merchantName: value?.name
      }),
    setLevel: (value?: BankAccountDto['level']) => apply({ level: value }),
    setStatus: (value?: BankAccountDto['status']) => apply({ status: value }),
    search: () => apply({ query: keyword.trim() }),
    clear: () => {
      setKeyword('')
      url.clearFilters()
    },
    changePage: (nextPage: number, nextSize: number) => {
      if (nextSize !== size) url.setPageSize(nextSize)
      else url.setPage(nextPage)
    }
  }
}
