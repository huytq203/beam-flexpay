import { useState } from 'react'

import { useUrlFilters } from '@hooks/useUrlFilters'
import type {
  ApiTerminalType,
  HierarchyStatus
} from '@/app/services/merchantHierarchyApi'
import type { PickedEntity } from '@components/index'

import { statusOptions, typeOptions } from '../columns/terminalApi.columns'

const TERMINAL_FILTER_KEYS = [
  'name',
  'merchantId',
  'merchantCode',
  'merchantName',
  'subId',
  'subCode',
  'subName',
  'terminalType',
  'status'
] as const
type TerminalFilterKey = (typeof TERMINAL_FILTER_KEYS)[number]
type UrlValues = Partial<Record<TerminalFilterKey, string>>

// Mã + tên lưu cùng id để hiện lại ô chọn mà không phải gọi thêm API.
const toPicked = (
  id?: string,
  code?: string,
  name?: string
): PickedEntity | undefined =>
  id ? { id, code: code ?? '', name: name ?? id } : undefined

export const useTerminalListFilters = () => {
  const url = useUrlFilters<TerminalFilterKey>({ keys: TERMINAL_FILTER_KEYS })
  const { filters, size } = url
  // Ô tên đang gõ, chỉ áp dụng khi bấm Tìm kiếm.
  const [name, setName] = useState(filters.name ?? '')
  const apply = (next: UrlValues): void =>
    url.applyFilters({ ...filters, ...next })

  return {
    page: url.page,
    size,
    name,
    searchName: filters.name,
    merchant: toPicked(
      filters.merchantId,
      filters.merchantCode,
      filters.merchantName
    ),
    subMerchant: toPicked(filters.subId, filters.subCode, filters.subName),
    // Giá trị trên URL người dùng sửa được, chỉ nhận đúng giá trị có trong danh sách.
    terminalType: typeOptions.find(
      (item) => item.value === filters.terminalType
    )?.value,
    status: statusOptions.find((item) => item.value === filters.status)?.value,
    setName,
    setMerchant: (value?: PickedEntity) =>
      apply({
        merchantId: value?.id,
        merchantCode: value?.code,
        merchantName: value?.name
      }),
    setSubMerchant: (value?: PickedEntity) =>
      apply({ subId: value?.id, subCode: value?.code, subName: value?.name }),
    setTerminalType: (value?: ApiTerminalType) =>
      apply({ terminalType: value }),
    setStatus: (value?: HierarchyStatus) => apply({ status: value }),
    search: () => apply({ name: name.trim() }),
    clear: () => {
      setName('')
      url.clearFilters()
    },
    // Gọi cả setPage lẫn setPageSize trong cùng một lần đổi sẽ ghi đè lẫn nhau.
    changePage: (nextPage: number, nextSize: number) => {
      if (nextSize !== size) url.setPageSize(nextSize)
      else url.setPage(nextPage)
    }
  }
}
