import { useDebounce } from 'ahooks'
import { Select } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import { useLazyGetBanksQuery } from '@services/apiBankService'
import { BankInformation, BankResponse, IBankQuery } from '@type/bank'
import { Pagination } from '@type/table'

interface IBankSelection {
  onClear?: (field: string) => void
  placeholder?: string
  type?: '' | 'LINK' | 'DEPOSIT' | 'WITHDRAW' | 'GATEWAY'
  isId?: boolean
  disabled?: boolean
}

export const BankSelection = (props: IBankSelection) => {
  const { onClear, placeholder, type, isId, disabled } = props

  const [bankList, setBankList] = useState<BankInformation[]>([])
  const [pagination, setPagination] = useState<Pagination | undefined>()
  const [string, setString] = useState<string>('')
  const [search, setSearch] = useState<IBankQuery>(
    type
      ? { page: 1, type: type, orderBy: 'createdAt' }
      : { page: 1, take: 10, orderBy: 'createdAt', isLoading: false }
  )

  const [getBanks] = useLazyGetBanksQuery()

  const debouncedSearchTerm = useDebounce(string, {
    wait: 300
  })

  const onSearchBank = async (newValue: string) => {
    if (newValue) {
      setString(newValue)
      setSearch({ ...search, name: newValue })
    }
  }

  const onScroll = async (e: any) => {
    const target = e.target
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (pagination && pagination?.page < pagination?.pageCount) {
        const query = { ...search, page: search.page + 1 }
        setSearch(query)
        const { data } = (await getBanks(query)) as { data: BankResponse }
        if (data) {
          setBankList((pre) => pre.concat(data?.data))
          setPagination(data?.meta)
        }
      }
    }
  }

  const getData = useCallback(async (value: string) => {
    if (value) {
      const { data } = (await getBanks({
        name: value,
        ...search
      })) as { data: BankResponse }
      if (data) {
        if (type) {
          setBankList(data?.data.filter((el) => el.type === type))
        } else {
          setBankList(data?.data)
        }
        setPagination(data?.meta)
      }
    } else {
      setBankList([])
    }
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      getData(debouncedSearchTerm)
    } else {
      setBankList([])
    }
  }, [debouncedSearchTerm])

  return (
    <Select
      allowClear
      placeholder={placeholder}
      showSearch
      suffixIcon={null}
      filterOption={false}
      maxTagCount={2}
      onPopupScroll={onScroll}
      onSearch={onSearchBank}
      {...props}
      onClear={() => onClear?.('name')}
      disabled={disabled}
    >
      {bankList?.map((el) => (
        <Select.Option
          value={isId ? el.id : el.tradingName}
          key={el.id}
        >
          {el.tradingName}
        </Select.Option>
      ))}
    </Select>
  )
}
