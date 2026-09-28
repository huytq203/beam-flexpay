import { useState } from 'react'
import {
  useListBankAccountsQuery,
  type BankAccountDto
} from '@/app/services/merchantBankAccountApi'
import { useGetMerchantQuery } from '@services/apiMerchant'
import { toPickedEntity, type PickedEntity } from '@components/index'

export const useBankAccountList = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(10)
  const [merchant, setMerchant] = useState<PickedEntity>()
  const [level, setLevel] = useState<BankAccountDto['level']>()
  const [status, setStatus] = useState<BankAccountDto['status']>()
  const [keyword, setKeyword] = useState('')
  const [queryText, setQueryText] = useState('')
  // Chỉ để tra tên Merchant cho cột bảng; chọn Merchant đi qua dialog phân trang.
  const merchants = useGetMerchantQuery({ page: 1, size: 100 })
  const query = useListBankAccountsQuery({
    page,
    size,
    merchantId: merchant?.id,
    level,
    status,
    query: queryText || undefined
  })
  const applyImmediately =
    <T>(setter: (value: T) => void) =>
    (value: T) => {
      setter(value)
      setPage(1)
    }

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
    setMerchant: applyImmediately(setMerchant),
    setLevel: applyImmediately(setLevel),
    setStatus: applyImmediately(setStatus),
    search: () => {
      setQueryText(keyword.trim())
      setPage(1)
    },
    clear: () => {
      setKeyword('')
      setQueryText('')
      setMerchant(undefined)
      setLevel(undefined)
      setStatus(undefined)
      setPage(1)
    },
    changePage: (nextPage: number, nextSize: number) => {
      setPage(nextSize !== size ? 1 : nextPage)
      setSize(nextSize)
    }
  }
}
