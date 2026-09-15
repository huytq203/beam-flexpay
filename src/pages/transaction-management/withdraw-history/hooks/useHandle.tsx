import {
    useLazyGetUnifiedByIdQuery,
    useLazyGetWithdrawalByTransactionCodeQuery,
    type WithdrawalDetail
} from '@services/apiJournal'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { useRef, useState } from 'react'

const useHandle = () => {
    const [isDetailOpen, setIsDetailOpen] = useState(false)
    const [loadingId, setLoadingId] = useState<string | null>(null)
    const loadingIdRef = useRef<string | null>(null)
    const [getUnifiedById, journalQuery] = useLazyGetUnifiedByIdQuery()
    const [getWithdrawalByTransactionCode, withdrawalQuery] =
        useLazyGetWithdrawalByTransactionCodeQuery()

    // Đọc trực tiếp từ cache RTK Query để invalidation sau mutation cập nhật
    // ngay nội dung modal, thay vì giữ một snapshot cũ trong local state.
    const detailData: UnifiedContentJournal | undefined = journalQuery.data
    const withdrawalDetail: WithdrawalDetail | undefined = withdrawalQuery.data

    const openDetail = async (id: string): Promise<void> => {
        if (loadingIdRef.current) return

        loadingIdRef.current = id
        setLoadingId(id)
        journalQuery.reset()
        withdrawalQuery.reset()
        setIsDetailOpen(false)

        try {
            const journal = await getUnifiedById(id).unwrap()
            await getWithdrawalByTransactionCode(journal.transactionCode).unwrap()

            setIsDetailOpen(true)
        } catch {
            // Giữ modal đóng khi chưa tải đủ hai nguồn dữ liệu chi tiết.
        } finally {
            loadingIdRef.current = null
            setLoadingId(null)
        }
    }

    const closeDetail = () => {
        setIsDetailOpen(false)
        journalQuery.reset()
        withdrawalQuery.reset()
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
