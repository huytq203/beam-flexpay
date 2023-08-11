import { GroupAccountInterface, ResponseGroupData } from '@type/accountGroup'
import { Select, SelectProps } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { useDebounce } from 'ahooks'
import { SearchValueType } from '../e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'

interface SelectAccountgroupType extends SelectProps {
  triggerFunction: any
  setSearchValue: React.Dispatch<React.SetStateAction<SearchValueType>>
  searchInput: SearchValueType
  listAccountGroup: ResponseGroupData | undefined
  onClearSearch?: (field: string) => void
  disabled?: boolean
  readonly?: boolean
}

type SearchType = {
  page: number
  take: number
}

export const CustomAccountGroupSelect = (props: SelectAccountgroupType) => {
  const {
    triggerFunction,
    setSearchValue,
    searchInput,
    listAccountGroup,
    disabled = false,
    mode = undefined,
    onClearSearch,
    readonly
  } = props

  const [dataAccountGroup, setDataAccountGroup] = useState<
    GroupAccountInterface[]
  >([])
  const [accountGroupSearchValue, setAccountGroupSearchValue] =
    useState<string>('')
  const [search, setSearch] = useState<SearchType>({
    page: 1,
    take: 10
  })
  const debouncedSearchTerm = useDebounce(accountGroupSearchValue, {
    wait: 300
  })

  const onSearchAccountGroup = async (newValue: string) => {
    setAccountGroupSearchValue(newValue)
    setSearchValue({ ...searchInput, accountGroupSearch: newValue })
  }

  const onScroll = async (e: any) => {
    const target = e.target
    let dupDataAccountGroup = [...dataAccountGroup]
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      target.scrollTo(0, target.scrollHeight)
      if (listAccountGroup && listAccountGroup?.meta.hasNextPage) {
        setSearch({ ...search, page: search.page + 1 })
        const data = await triggerFunction({
          page: search.page + 1,
          take: 10
        })
        if (data.isSuccess && !data.isLoading) {
          data?.data?.data.map((el: GroupAccountInterface) => {
            dupDataAccountGroup.push(el)
          })
        }
        setDataAccountGroup(dupDataAccountGroup)
      }
    }
  }

  const getData = useCallback(
    async (value: string) => {
      if (value) {
        const data = await triggerFunction({
          name: value,
          ...search
        })
        setDataAccountGroup(data?.data?.data as GroupAccountInterface[])
      } else {
        setDataAccountGroup([])
      }
    },
    [dataAccountGroup]
  )

  useEffect(() => {
    if (searchInput.accountGroupSearch) {
      getData(searchInput.accountGroupSearch)
    }
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      getData(debouncedSearchTerm)
    } else {
      setDataAccountGroup([])
    }
  }, [debouncedSearchTerm])

  return (
    <Select
      // getPopupContainer={(trigger) => trigger.parentNode}
      allowClear
      disabled={disabled}
      mode={mode}
      showSearch
      showArrow={false}
      filterOption={false}
      style={{ minWidth: 220 }}
      labelInValue
      maxTagCount={2}
      onPopupScroll={onScroll}
      onSearch={onSearchAccountGroup}
      onClear={() => onClearSearch && onClearSearch('applicableObjectId')}
      {...props}
      className={readonly ? 'readonly-class' : ''}
    >
      {dataAccountGroup?.map((el) => (
        <Select.Option
          value={el.id}
          key={el.id}
        >
          {el.name}
        </Select.Option>
      ))}
    </Select>
  )
}
