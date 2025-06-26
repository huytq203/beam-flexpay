import { useDebounce } from 'ahooks'
import { Select } from 'antd'
import { useCallback, useEffect, useState } from 'react'

import { useLazyGetListWalletsQuery } from '@services/apiInternalWallet'
import { IInternalWalletQuery, InternalWallet } from '@type/internalWallet'
import { Pagination } from '@type/table'

interface IWalletSelection {
  onClear?: (field: string) => void
  placeholder?: string
  disabled?: boolean
  setWalletNumber?: (value: any, field: string) => void
  setWalletId?: (value: any, field: string) => void
  field?: string
  value?: { value: string; label: string };
}

export const DepositRequestSelection = (props: IWalletSelection) => {
  const { onClear, placeholder, disabled, setWalletNumber, field, setWalletId, value} = props

  const [WalletList, setWalletList] = useState<InternalWallet[]>([])
  const [pagination, setPagination] = useState<Pagination | undefined>()
  const [string, setString] = useState<string>('')
  const [search, setSearch] = useState<IInternalWalletQuery>({
    page: 1,
    take: 10,
    orderBy: 'createdAt'
  })

  const [getWallets] = useLazyGetListWalletsQuery()

  const debouncedSearchTerm = useDebounce(string, {
    wait: 300
  })

  const onSearchWallet = async (newValue: string) => {
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
        const { data } = (await getWallets(query)) as { data: any }
        if (data) {
          setWalletList((pre) => pre.concat(data?.data))
          setPagination(data?.meta)
        }
      }
    }
  }

  const getData = useCallback(async (value: string) => {
    if (value) {
      const { data } = (await getWallets({
        name: value,
        ...search
      })) as { data: any }
      console.log('data', data)
      if (data) {
        setWalletList(data?.data)

        setPagination(data?.meta)
      }
    } else {
      setWalletList([])
    }
  }, [])

  useEffect(() => {
    if (debouncedSearchTerm) {
      getData(debouncedSearchTerm)
    } else {
      setWalletList([])
    }
  }, [debouncedSearchTerm])

  const handleChange = (value: string, option: any) => {

    if (!setWalletNumber || !field) return;

    const selectedWallet = WalletList.find(wallet => wallet.id.toString() == value);

    if (!selectedWallet) return;

    setWalletNumber(selectedWallet.walletNumber, field);

    if (setWalletId) {
      setWalletId(selectedWallet.id, field);
    }
  };
  return (
    <Select
      allowClear
      placeholder={placeholder}
      showSearch
      filterOption={false}
      maxTagCount={2}
      onPopupScroll={onScroll}
      onSearch={onSearchWallet}
      onChange={handleChange}
      labelInValue
      value = { value }
      
      // {...rest}
      onClear={() => {
        return onClear && field ? onClear(field) : undefined
      }}
      disabled={disabled}
    >
      {WalletList?.map((el) => {
        return (
          <Select.Option
            value={el.id}
            key={el.id}
          >
            {el.name}
          </Select.Option>
        );
      })}
    </Select>
  )
}