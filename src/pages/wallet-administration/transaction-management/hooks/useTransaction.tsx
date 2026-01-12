import usePagination from '@hooks/usePagination'
import { useGetTransactionQuery } from '@services/apiTransactionV2'
import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const useTransaction = () => {
  // state

  // hook
const navigate=useNavigate()

  const { params: Pagination, page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt'
  })

  // constants

  // api
  const { data: dataTransaction } = useGetTransactionQuery(Pagination)
  const dataSource = useMemo(() => (
    dataTransaction?.content?.map((item, idx) => (
      {
        no: (page - 1) * pageSize + idx + 1,
        ...item,
      }

    ))
  ), [dataTransaction])
  const totalElements = dataTransaction?.totalElements
  // logic



  return {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,

    navigate
  }
}

export default useTransaction