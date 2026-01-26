import usePagination from '@hooks/usePagination'
import { AcountItem, FormSearchValues } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { useGetAccountQuery } from '@pages/wallet-administration/e-walletManagement/service/apiWalletAccount.api'
import React, { useEffect, useState } from 'react'
import { Column } from '../columns/Column'

const useEwalletManagement = () => {
  const [data, setData] = useState([])
  const { params, page, size, setPageSize, setPage } = usePagination()
  const [filter, setFilter] = useState({})

  const { data: getAccount } = useGetAccountQuery({ ...params, ...filter })

  const handleSearch = (data: FormSearchValues) => {
    setFilter(data)
    setPage(1)
  }
  const dataSource = getAccount?.data?.content.map((item:AcountItem, index:number) => ({
    ...item,
    no: (page - 1) * size + index + 1
  }))
  
  
  
  
  const column = Column()
  return {
    column,
    dataSource,
    getAccount,
    page,
    size,
    setPageSize,
    setPage,

    handleSearch
  }
}

export default useEwalletManagement
