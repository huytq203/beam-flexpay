import usePagination from '@hooks/usePagination'
import { useGetFreezesQuery } from '@services/apiFreezes'
import { FreezeItem } from '@type/freeze.type'
import React from 'react'
import { useParams } from 'react-router-dom'

const useFetchFreeze = () => {
    const { id } = useParams()
    const { params, page, size, setPage, setPageSize } = usePagination()
    const [isUnfreezeModalOpen, setIsUnfreezeModalOpen] = React.useState(false)
    const [selectedFreezeItem, setSelectedFreezeItem] = React.useState<FreezeItem | undefined>(undefined)


    const payload = React.useMemo(() => {
        return {
            page: page,
            size: size,
            accountId: id
        }
    }, [page, size, id])

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
        setSelectedFreezeItem(undefined)
    }

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
        handleCloseUnfreezeModal
    }
}

export default useFetchFreeze
