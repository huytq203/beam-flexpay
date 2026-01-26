import usePagination from '@hooks/usePagination'
import { useGetTransactionQuery, useLazyGetTransactionQuery } from '@pages/wallet-administration/transaction-management/services/apiTransactionV2'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormSearchValues } from '../types/Transaction.type'

const useTransaction = () => {
  // state
  const [filter, setFilter] = useState({})
  // hook
  const navigate = useNavigate()

  const { params, page, pageSize, setPage, setPageSize, sortBy } = usePagination({
    defaultSort: 'createdAt',
  })

  // constants

  // api
  const { data: dataTransaction } = useGetTransactionQuery({...params, ...filter})
  const [getSearchTransaction] = useLazyGetTransactionQuery()

  // logic


  const handleSearch = (data: FormSearchValues) => {
    setFilter(data)
    setPage(1)
  }
  const totalElements = dataTransaction?.totalElements
  const dataSource = useMemo(() => (
    dataTransaction?.content?.map((item, idx) => (
      {
        no: (page - 1) * pageSize + idx + 1,
        ...item,
      }

    ))
  ), [dataTransaction])

  return {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,

    navigate,
    handleSearch
  }
}

export default useTransaction