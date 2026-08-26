import usePagination from '@hooks/usePagination'
import { useUnfreezeApproval } from '@hooks/useUnfreezeApproval'
import { useGetFreezesQuery } from '@services/apiFreezes'
import { FreezeItem } from '@type/freeze.type'
import React from 'react'
import { useParams } from 'react-router-dom'

const useFetchFreeze = () => {
    const { id } = useParams()
    const { params, page, size, setPage, setPageSize } = usePagination()
    const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = React.useState(false)
    const [selectedFreezeItem, setSelectedFreezeItem] = React.useState<FreezeItem | null>(null)

    const payload = React.useMemo(() => {
        return {
            ...params,
            accountId: id
        }
    }, [params, id])

    const { data: dataFreeze, isLoading: isLoadingGetFreeze } = useGetFreezesQuery(payload)

    const dataSource = React.useMemo(() => {
        return dataFreeze?.content?.map((item, index) => ({
            no: (page - 1) * size + index + 1,
            ...item,
            key: item.id,
        }))
    }, [dataFreeze, page, size])

    const handleOpenUnfreezeModal = (item: FreezeItem) => {
        setIsUnfreezeModalOpen(true)
        setSelectedFreezeItem(item)
    }

    const handleCloseUnfreezeModal = () => {
        setIsUnfreezeModalOpen(false)
        setSelectedFreezeItem(null)
    }

    const { canApprove, openDecision, dialogState } = useUnfreezeApproval()

    return {
        dataFreeze,
        isLoadingGetFreeze,
        dataSource,
        page,
        size,
        setPage,
        setPageSize,
        isUnfreezeModalOpen,
        selectedFreezeItem,
        handleOpenUnfreezeModal,
        handleCloseUnfreezeModal,
        canApprove,
        openDecision,
        decisionDialogState: dialogState
    }
}

export default useFetchFreeze
