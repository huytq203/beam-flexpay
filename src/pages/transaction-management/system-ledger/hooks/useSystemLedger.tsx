import usePagination from '@hooks/usePagination'
import { useGetLedgerEntriesQuery } from '../services/apiSystemLedger'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormSearchValues } from '../types/SystemLedger.type'

const useSystemLedger = () => {
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
  const { data: dataLedger, isFetching, refetch } =
    useGetLedgerEntriesQuery(payload)

  const handleSearch = (data: FormSearchValues) => {
    const trimmedData = Object.entries(data).reduce((acc, [key, value]) => {
      acc[key as keyof FormSearchValues] = typeof value === 'string' ? value.trim() : value
      return acc
    }, {} as FormSearchValues)
    setFilter(trimmedData)
    setPage(1)
  }
  const totalElements = dataLedger?.totalElements
  const dataSource = useMemo(() => (
    dataLedger?.content?.map((item, idx) => ({
      no: (page - 1) * pageSize + idx + 1,
      ...item,
    }))
  ), [dataLedger, page, pageSize])

  return {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,
    navigate,
    handleSearch,
    refetch,
    isFetching
  }
}

export default useSystemLedger
