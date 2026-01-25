import usePagination from '@hooks/usePagination'
import { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { useGetAccountQuery } from '@pages/wallet-administration/service/apiWalletAccount.api'
import React, { useEffect, useState } from 'react'
import { Column } from '../columns/Column'

const useEwalletManagement = () => {
  const column = Column()
  const [data, setData] = useState([])
  const { params, page, size, setPageSize, setPage } = usePagination()

  const { data: getAccount } = useGetAccountQuery(params)
  const dataSource = getAccount?.data?.content.map((item:AcountItem, index:number) => ({
    ...item,
    no: (page - 1) * size + index + 1
  }))

  return {
    column,
    dataSource,
    getAccount,
    page,
    size,
    setPageSize,
    setPage
  }
}

export default useEwalletManagement
