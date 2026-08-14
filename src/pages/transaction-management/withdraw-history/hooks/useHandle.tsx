import {
    useLazyGetUnifiedByIdQuery,
    useLazyGetWithdrawalByTransactionCodeQuery,
    type WithdrawalDetail
} from '@services/apiJournal'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { useRef, useState } from 'react'

const useHandle = () => {
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [detailData, setDetailData] = useState<UnifiedContentJournal>()
    const [withdrawalDetail, setWithdrawalDetail] = useState<WithdrawalDetail>()
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const loadingIdRef = useRef<string | null>(null)
    const [getUnifiedById] = useLazyGetUnifiedByIdQuery()
    const [getWithdrawalByTransactionCode] = useLazyGetWithdrawalByTransactionCodeQuery()

    const openDetail = async (id: string): Promise<void> => {
        if (loadingIdRef.current) return

        loadingIdRef.current = id
        setLoadingId(id)
        setDetailData(undefined)
        setWithdrawalDetail(undefined)
        setIsDetailOpen(false)

        try {
            const journalResult = await getUnifiedById(id)
            if (!journalResult.data) return

            const journal = journalResult.data
            const withdrawalResult = await getWithdrawalByTransactionCode(
                journal.transactionCode
            )
            if (!withdrawalResult.data) return

            setDetailData(journal)
            setWithdrawalDetail(withdrawalResult.data)
            setIsDetailOpen(true)
        } finally {
            loadingIdRef.current = null
            setLoadingId(null)
        }
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        setDetailData(undefined)
        setWithdrawalDetail(undefined)
    }

    return {
        isDetailOpen,
        detailData,
        withdrawalDetail,
        isDetailLoading: loadingId !== null,
        loadingId,
        openDetail,
        closeDetail,
    }
}

export default useHandle
