import usePagination from '@hooks/usePagination'
import { useGetLedgerEntriesQuery, useLazyGetLedgerEntriesQuery } from '../services/apiSystemLedger'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FormSearchValues } from '../types/SystemLedger.type'

const useSystemLedger = () => {
  const [filter, setFilter] = useState({})
  const navigate = useNavigate()

  const { params, page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt',
  })

  const payload={
    page:page,
    size:pageSize,
    ...filter
  }
  const { data: dataLedger } = useGetLedgerEntriesQuery(payload)
  const [getSearchLedger] = useLazyGetLedgerEntriesQuery()

  const handleSearch = (data: FormSearchValues) => {
    setFilter(data)
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
    handleSearch
  }
}

export default useSystemLedger
