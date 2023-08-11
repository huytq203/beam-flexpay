import { Select, SelectProps } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { useDebounce } from 'ahooks'
import { useLazyGetListAccountAdminQuery } from '@services/apiAdminAccountService'
import {
  AdminAccountData,
  AdminAccountPayload,
  AdminSearchParams
} from '@type/admin'
import { Pagination } from '@type/table'

interface SelectAdminAccount {
  onClear?: (field: string) => void
  placeholder?: string
}

export const SelectAdminAccount = (props: SelectAdminAccount) => {
  const { onClear, placeholder } = props

  const [adminList, setAdminList] = useState<AdminAccountData[]>([])
  const [pagination, setPagination] = useState<Pagination | undefined>()
  const [string, setString] = useState<string | undefined>()
  const [search, setSearch] = useState<AdminSearchParams>({
    page: 1,
    take: 10
  })

  const [getListAccountAdmin] = useLazyGetListAccountAdminQuery()

  const debouncedSearchTerm = useDebounce(string, {
    wait: 300
  })

  const onSearchAccountGroup = async (newValue: string) => {
    if (newValue) {
      setString(newValue)
      setSearch({ ...search, fullName: newValue })
    }
  }

  const onScroll = async (e: any) => {
    const target = e.target
    let newAdminList = [...adminList]
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (
        search.page &&
        pagination &&
        pagination?.page < pagination?.pageCount
      ) {
        const query = { ...search, page: search?.page + 1 }
        setSearch(query)
        const { data } = (await getListAccountAdmin(query)) as {
          data: AdminAccountPayload
        }
        if (data) {
          setAdminList((pre) => pre.concat(data.data))
          setPagination(data.meta)
        }
      }
    }
  }

  const getData = useCallback(async (value: string) => {
    if (value) {
      const { data } = (await getListAccountAdmin({
        fullName: value,
        ...search
      })) as { data: AdminAccountPayload }

      if (data) {
        setAdminList(data?.data)
        setPagination(data?.meta)
      }
    } else {
      setAdminList([])
    }
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      getData(debouncedSearchTerm)
    } else {
      setAdminList([])
    }
  }, [debouncedSearchTerm])

  return (
    <Select
      allowClear
      placeholder={placeholder}
      showSearch
      showArrow={false}
      filterOption={false}
      style={{ minWidth: 220 }}
      maxTagCount={2}
      onPopupScroll={onScroll}
      onSearch={onSearchAccountGroup}
      {...props}
      onClear={() => onClear?.('updater_id')}
    >
      {adminList?.map((el) => (
        <Select.Option
          value={el.id}
          key={el.id}
        >
          {el.fullName}
        </Select.Option>
      ))}
    </Select>
  )
}
