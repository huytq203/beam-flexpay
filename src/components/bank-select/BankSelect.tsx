import { ENV } from '@configs/env'
import { getAccessTokenCookie } from '@configs/fetchBaseQuery.types'
import { PageMeta, ResponseType } from '@type/api'
import { IBank } from '@type/napasToken'
import { Select, Spin } from 'antd'
import type { BaseSelectRef } from 'rc-select'
import { createRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface IProps {
  onSelect: (data: any) => void
}

export function BankSelect({ onSelect }: IProps) {
  const { t } = useTranslation()
  const [visible, setVisible] = useState(false)
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [bankSearch, setBankSearch] = useState({
    page: 1,
    take: 10,
    bankName: ''
  })
  const [banks, setBanks] = useState<IBank[]>([])
  const [paginationInfo, setPaginationInfo] = useState<PageMeta>()
  const ref = createRef<BaseSelectRef>()
  /**
   * function that store and arrange data
   * @param data
   */
  const storeData = (data: { data: IBank[]; meta: PageMeta }) => {
    if (
      data.data &&
      data.data.length > 0 &&
      data.meta &&
      data.meta.page === 1
    ) {
      setBanks(data.data)
      setPaginationInfo(data.meta)
    } else {
      setBanks((pre) => pre.concat(data.data))
      setPaginationInfo(data.meta)
    }
    setLoading(false)
  }

  /**
   * fetch bank data
   * @param query
   */
  const fetchBanks = async (query: any) => {
    const endpoint =
      `${ENV.API_URL}/bank?` + new URLSearchParams(query)
    const accessToken = getAccessTokenCookie()
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`
      }
    })
    const { data } = (await response.json()) as ResponseType<{
      data: IBank[]
      meta: any
    }>
    storeData(data)
  }

  /**
   * this function handle action when blur select
   */
  const handleBlur = () => {
    setVisible(false)
  }

  /**
   * this function handle action when select option in select
   * @param _
   * @param option
   */
  const handleSelect = (_: string, option: { value: string }) => {
    setVisible(false)
    if (option.value) {
      onSelect(option)
      setLoadingMore(false)
    }
  }

  /**
   * function that handle scroll inside select popup
   * @param event
   */
  const handleScroll = (event: any) => {
    const target = event.target
    if (
      !loading &&
      target.scrollTop + target.offsetHeight === target.scrollHeight
    ) {
      if (paginationInfo && paginationInfo?.page < paginationInfo?.pageCount) {
        target.scrollTo(0, target.scrollHeight)
        setLoadingMore(true)
        const data = { ...bankSearch, page: bankSearch.page + 1 }
        setBankSearch(data)
        fetchBanks(data)
      } else {
        setLoadingMore(false)
      }
    }
  }

  /**
   * handle select option select
   * @param open
   */
  const handleOpenSelect = (open: boolean) => {
    if (open) {
      setVisible(true)
      if (banks.length == 0) {
        setLoading(true)
        fetchBanks(bankSearch)
      }
    } else {
      ref.current?.scrollTo(0)
      setLoading(false)
    }
  }

  /**
   * render bank list
   * @returns
   */
  const bankOptions = () => (
    <>
      {loading ? (
        <div style={{ height: 35, alignItems: 'center', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : (
        <>
          {banks.map((item, index) => (
            <Select.Option
              value={item.tradingName}
              key={`bank-${index}-${item.id}`}
            >
              {item.name}
            </Select.Option>
          ))}
          {loadingMore && (
            <div
              style={{ height: 10, alignItems: 'center', textAlign: 'center' }}
            >
              <Spin />
            </div>
          )}
        </>
      )}
    </>
  )

  const onClear = () => {
    onSelect(undefined)
  }

  return (
    <Select
      placeholder={t`napasToken.placeholders.bank`.toString()}
      open={visible}
      popupClassName='bank-list'
      allowClear={true}
      onBlur={handleBlur}
      onSelect={handleSelect}
      onPopupScroll={handleScroll}
      onDropdownVisibleChange={(open) => handleOpenSelect(open)}
      onClear={onClear}
    >
      {bankOptions()}
    </Select>
  )
}
