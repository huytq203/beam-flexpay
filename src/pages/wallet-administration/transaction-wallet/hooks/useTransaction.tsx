import usePagination from '@hooks/usePagination'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormSearchValues } from '../types/Transaction.type'
import { useGetUnifiedQuery } from '../../../../app/services/apiJournal'

const useTransaction = () => {
  const [filter, setFilter] = useState({})

  const navigate = useNavigate()

  const { page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt',
  })
  const payload={
    page:page,
    size:pageSize,
    ...filter 
  }

  const { data: dataTransaction, isFetching, isLoading: isLoadingGetTransaction } = useGetUnifiedQuery(payload)

  const handleSearch = (data: Partial<FormSearchValues>) => {
    setFilter(data)
    setPage(1)
  }

  const totalElements = dataTransaction?.totalElements
  const dataSource = useMemo(() => (
    dataTransaction?.content?.map((item, idx) => ({
      no: (page - 1) * pageSize + idx + 1,
      ...item,
    }))
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
    isLoadingGetTransaction,
    isFetching
  }
}

export default useTransaction
