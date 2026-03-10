import usePagination from '@hooks/usePagination'
import { useGetFreezesQuery } from '@services/apiFreezes'
import { useMemo, useState } from 'react'

const useFrozenTransactions = () => {
  const [filter, setFilter] = useState({})

  const { params, page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt',
  })

  const payload = {
    page: page,
    size: pageSize,
    ...filter
  }
  const { data, isFetching, isLoading } = useGetFreezesQuery(payload)

  const totalElements = data?.totalElements

  const dataSource = useMemo(
    () =>
      data?.content?.map((item, idx) => ({
        no: (page - 1) * pageSize + idx + 1,
        ...item,
      })),
    [data, page, pageSize]
  )

  const handleSearch = (values: Record<string, unknown>) => {
    setFilter(values)
    setPage(1)
  }

  const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = useState(false)
  const [selectedFreezeItem, setSelectedFreezeItem] = useState<any>(null)

  const handleOpenUnfreezeModal = (item: any) => {
    setSelectedFreezeItem(item)
    setIsUnfreezeModalOpen(true)
  }

  const handleCloseUnfreezeModal = () => {
    setIsUnfreezeModalOpen(false)
    setSelectedFreezeItem(null)
  }

  return {
    dataSource,
    totalElements,
    page,
    pageSize,
    setPage,
    setPageSize,
    isFetching,
    handleSearch,
    isLoading,
    isUnfreezeModalOpen,
    selectedFreezeItem,
    handleOpenUnfreezeModal,
    handleCloseUnfreezeModal,
  }
}

export default useFrozenTransactions
