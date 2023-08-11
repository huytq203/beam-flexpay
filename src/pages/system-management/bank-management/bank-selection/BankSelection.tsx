import { Select, SelectProps } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { useDebounce } from 'ahooks'

import { Pagination } from '@type/table'
import { BankInformation, BankResponse, IBankQuery } from '@type/bank'
import { useLazyGetBanksQuery } from '@services/apiBankService'

interface IBankSelection {
  onClear?: (field: string) => void
  placeholder?: string
}

export const BankSelection = (props: IBankSelection) => {
  const { onClear, placeholder } = props

  const [bankList, setBankList] = useState<BankInformation[]>([])
  const [pagination, setPagination] = useState<Pagination | undefined>()
  const [string, setString] = useState<string>('')
  const [search, setSearch] = useState<IBankQuery>({
    page: 1,
    take: 10,
    orderBy: 'createdAt',
    isLoading: false
  })

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
        setBankList(data?.data)
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
      showArrow={false}
      filterOption={false}
      maxTagCount={2}
      onPopupScroll={onScroll}
      onSearch={onSearchBank}
      {...props}
      onClear={() => onClear?.('name')}
    >
      {bankList?.map((el) => (
        <Select.Option
          value={el.name}
          key={el.id}
        >
          {el.name}
        </Select.Option>
      ))}
    </Select>
  )
}
