import { AccountPayload, CustomerTable, accountStatus } from '@type/customer'
import { useDebounce } from 'ahooks'
import { Select, SelectProps } from 'antd'
import { useCallback, useEffect, useState } from 'react'
import { SearchValueType } from '../e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'

interface SelectPrivateAccountType extends SelectProps {
  triggerFunction: any
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValueType>>
  searchInput: SearchValueType
  listAccount: AccountPayload | undefined
  onClearSearch?: (field: string) => void
  readonly?: boolean
}

type SearchType = {
  page: number
  take: number
  status: accountStatus[]
  readonly?: boolean
}

export const CustomPrivateAccountSelect = (props: SelectPrivateAccountType) => {
  const {
    triggerFunction,
    setSearchValue,
    searchInput,
    listAccount,
    mode = undefined,
    onClearSearch,
    readonly
  } = props

  const [data, setData] = useState<CustomerTable[]>([])
  const [accountSearchValue, setAccountSearchValue] = useState<string>('')
  const [search, setSearch] = useState<SearchType>({
    page: 1,
    take: 10,
    status: [accountStatus.VERIFIED, accountStatus.LINKED]
  })

  const debouncedSearchTerm = useDebounce(accountSearchValue, {
    wait: 300
  })

  const onSearchAccountGroup = async (newValue: string) => {
    setAccountSearchValue(newValue)
    setSearchValue({ ...searchInput, privateAccountSearch: newValue })
  }

  const getData = useCallback(
    async (value: string) => {
      if (value) {
        const data = await triggerFunction({
          phoneNumber: value,
          ...search
        })
        setData(data?.data?.data as CustomerTable[])
      } else {
        setData([])
      }
    },
    [data]
  )

  useEffect(() => {
    if (searchInput.privateAccountSearch) {
      getData(searchInput.privateAccountSearch)
    }
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      getData(debouncedSearchTerm)
    } else {
      setData([])
    }
  }, [debouncedSearchTerm])

  const onScroll = async (e: any) => {
    const target = e.target
    let dupDataAccount = [...data]
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (listAccount && listAccount?.meta.hasNextPage) {
        setSearch({ ...search, page: search.page + 1 })
        const data = await triggerFunction({
          page: search.page + 1,
          take: 10
        })
        if (data.isSuccess && !data.isLoading) {
          data?.data?.data.map((el: CustomerTable) => {
            dupDataAccount.push(el)
          })
        }
        setData(dupDataAccount)
      }
    }
  }

  return (
    <Select
      // getPopupContainer={(trigger) => trigger.parentNode}
      allowClear
      mode={mode}
      showSearch
      onPopupScroll={onScroll}
      onSearch={onSearchAccountGroup}
      showArrow={false}
      filterOption={false}
      style={{ minWidth: 220 }}
      labelInValue
      {...props}
      onClear={() => onClearSearch && onClearSearch('applicableObjectId')}
      className={readonly ? 'readonly-class' : ''}
    >
      {data.map((el) => (
        <Select.Option
          value={el.id}
          key={el.id}
        >
          {el.accountNumber}
        </Select.Option>
      ))}
    </Select>
  )
}
