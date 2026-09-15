import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useUnfreezeApproval } from '@hooks/useUnfreezeApproval'
import {
  useExportFreezesMutation,
  type ExportFreezesQuery
} from '@services/apiExportCsv'
import { useGetFreezesQuery, type FreezeSearchParams } from '@services/apiFreezes'
import { FreezeItem } from '@type/freeze.type'
import { useMemo, useState } from 'react'

const useFrozenTransactions = () => {
  const [filter, setFilter] = useState<FreezeSearchParams>({})

  const { page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt',
  })

  const payload: FreezeSearchParams = {
    page: page,
    size: pageSize,
    ...filter,
    includeSummary: true
  }
  const { data, isFetching, isLoading, refetch } =
    useGetFreezesQuery(payload)

  const totalElements = data?.totalElements

  const dataSource = useMemo(
    () =>
      data?.content?.map((item, idx) => ({
        no: (page - 1) * pageSize + idx + 1,
        ...item,
      })),
    [data, page, pageSize]
  )

  const handleSearch = (values: FreezeSearchParams) => {
    setFilter(values)
    setPage(1)
  }

  const [triggerExport, { reset: resetExport }] = useExportFreezesMutation()
  const { exportFile, isExporting } = useExportCsv({
    trigger: triggerExport,
    reset: resetExport,
    filenamePrefix: 'giao-dich-dong-bang'
  })

  /** Endpoint xuất không nhận page/size — file lấy trọn bộ lọc đang áp, không theo trang. */
  const handleExport = () => {
    const exportParams: ExportFreezesQuery = filter
    void exportFile(exportParams)
  }

  const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = useState(false)
  const [selectedFreezeItem, setSelectedFreezeItem] = useState<FreezeItem | null>(null)

  const handleOpenUnfreezeModal = (item: FreezeItem) => {
    setSelectedFreezeItem(item)
    setIsUnfreezeModalOpen(true)
  }

  const handleCloseUnfreezeModal = () => {
    setIsUnfreezeModalOpen(false)
    setSelectedFreezeItem(null)
  }

  const { canApprove, openDecision, dialogState } = useUnfreezeApproval()

  return {
    dataSource,
    totalElements,
    page,
    pageSize,
    setPage,
    setPageSize,
    refetch,
    isFetching,
    handleSearch,
    isLoading,
    isUnfreezeModalOpen,
    selectedFreezeItem,
    handleOpenUnfreezeModal,
    handleCloseUnfreezeModal,
    canApprove,
    openDecision,
    decisionDialogState: dialogState,
    handleExport,
    isExporting,
  }
}

export default useFrozenTransactions
