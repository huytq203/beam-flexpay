import { useGetUnifiedByIdQuery } from '@services/apiJournal'
import { useState } from 'react'

const useHandle = () => {
    const [selectedId, setSelectedId] = useState<string | undefined>(undefined)
    const [isDetailOpen, setIsDetailOpen] = useState(false)

    const { data: detailData, isLoading: isDetailLoading } = useGetUnifiedByIdQuery(selectedId, {
        skip: !selectedId,
    })

    const openDetail = (id: string) => {
        setSelectedId(id)
        setIsDetailOpen(true)
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        setSelectedId(undefined)
    }

    return {
        selectedId,
        isDetailOpen,
        detailData,
        isDetailLoading,
        openDetail,
        closeDetail,
    }
}

export default useHandle