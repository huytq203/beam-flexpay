import usePagination from '@hooks/usePagination'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormSearchValues } from '../types/Transaction.type'
import { useGetTransactionQuery, useLazyGetTransactionQuery } from '../../../../app/services/apiTransactionV2'

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
  const { data: dataTransaction, isLoading: isLoadingGetTransaction } = useGetTransactionQuery({ ...params, ...filter })
  const [getSearchTransaction] = useLazyGetTransactionQuery()

  // logic


  const handleSearch = (data: Partial<FormSearchValues>) => {
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
    handleSearch,
    isLoadingGetTransaction
  }
}

export default useTransaction