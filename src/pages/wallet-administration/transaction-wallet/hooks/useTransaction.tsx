import usePagination from '@hooks/usePagination'
import { useCallback, useMemo, useState } from 'react'
import {
  FormSearchValues,
  TransactionFreezeTarget
} from '../types/Transaction.type'
import { useGetUnifiedQuery } from '../../../../app/services/apiJournal'
import { useLazyGetAccountQuery } from '@services/apiWalletAccount.api'
import type { UnifiedContentJournal } from '@type/apiResponseJournal'
import { useLazyGetFreezesQuery } from '@services/apiFreezes'
import type { FreezeItem } from '@type/freeze.type'
import { ACTION, buildPermissionCode, MODULE, useAccess } from '@/app/permissions'
import { useMessage } from '@hooks/useMessage'
import {
  canShowFreezeTransactionAction,
  getFreezeTargetParties
} from '../columns/transaction-row-actions'

const useTransaction = () => {
  const [filter, setFilter] = useState<Partial<FormSearchValues>>({})
  const [selectedTransaction, setSelectedTransaction] =
    useState<UnifiedContentJournal | null>(null)
  const [selectedUnfreezeTransaction, setSelectedUnfreezeTransaction] =
    useState<UnifiedContentJournal | null>(null)
  const [unfreezeOrders, setUnfreezeOrders] = useState<FreezeItem[]>([])
  const [freezeTargets, setFreezeTargets] = useState<TransactionFreezeTarget[]>([])
  const [openingFreezeTransactionId, setOpeningFreezeTransactionId] =
    useState<string>()
  const [openingUnfreezeTransactionId, setOpeningUnfreezeTransactionId] =
    useState<string>()
  const { hasAny } = useAccess()
  const { errorMess } = useMessage()
  const [getAccounts] = useLazyGetAccountQuery()
  const [getFreezes] = useLazyGetFreezesQuery()
  const canFreeze = hasAny([
    buildPermissionCode(MODULE.FREEZE, ACTION.UPDATE),
    buildPermissionCode(MODULE.EWALLET, ACTION.FULL)
  ])

  const { page, pageSize, setPage, setPageSize } = usePagination({
    defaultSort: 'createdAt',
  })
  const payload={
    page:page,
    size:pageSize,
    ...filter 
  }

  const {
    data: dataTransaction,
    isFetching,
    isLoading: isLoadingGetTransaction,
    refetch
  } = useGetUnifiedQuery(payload)

  const handleSearch = (data: Partial<FormSearchValues>) => {
    setFilter(data)
    setPage(1)
  }

  const handleOpenFreeze = useCallback(async (
    transaction: UnifiedContentJournal
  ) => {
    if (!canShowFreezeTransactionAction(transaction) || !transaction.transactionId) return

    const parties = getFreezeTargetParties(transaction)
    if (parties.length === 0) {
      errorMess('Giao dịch không có ví nội bộ hợp lệ để đóng băng')
      return
    }

    setOpeningFreezeTransactionId(transaction.transactionId)
    try {
      const resolvedTargets = await Promise.all(parties.map(async (party) => {
        const glCode = party.ownerType === 'MERCHANT'
          ? 'MERCHANT_WALLET_VND'
          : 'USER_WALLET_VND'
        const accounts = await getAccounts({
          ownerId: party.ownerId,
          ownerType: party.ownerType,
          glCode,
          currency: transaction.currency,
          page: 1,
          size: 1
        }, true).unwrap()
        const account = accounts.content[0]

        return account ? {
          accountId: account.id,
          ownerId: party.ownerId,
          ownerName: account.ownerUsername || party.ownerName,
          ownerType: account.ownerType,
          availableBalance: account.availableBalance,
          currency: account.currency,
          roleLabel: party.roleLabel
        } satisfies TransactionFreezeTarget : null
      }))

      const validTargets = resolvedTargets.filter(
        (target): target is TransactionFreezeTarget => target !== null
      )
      if (validTargets.length === 0) {
        errorMess('Không tìm thấy ví phù hợp để đóng băng giao dịch')
        return
      }

      setFreezeTargets(validTargets)
      setSelectedTransaction(transaction)
    } catch {
      // Lỗi API đã được errorMiddleware hiển thị tập trung.
    } finally {
      setOpeningFreezeTransactionId(undefined)
    }
  }, [errorMess, getAccounts])

  const handleCloseFreeze = useCallback(() => {
    setSelectedTransaction(null)
    setFreezeTargets([])
  }, [])

  const handleOpenUnfreeze = useCallback(async (transaction: UnifiedContentJournal) => {
    if (!transaction.frozen || !transaction.transactionId) return

    setOpeningUnfreezeTransactionId(transaction.transactionId)
    try {
      const result = await getFreezes({
        sourceTransactionId: transaction.transactionId,
        status: 'ACTIVE',
        page: 1,
        size: 1000,
        sort: 'createdAt,asc'
      }).unwrap()
      const orders = result.content.filter((freeze) =>
        freeze.sourceTransactionId === transaction.transactionId &&
        (freeze.remainingAmount > 0 || freeze.shortfallAmount > 0)
      )

      if ((transaction.freeze?.heldAmount ?? 0) > 0 &&
          !orders.some((freeze) => freeze.remainingAmount > 0)) {
        errorMess('Không tải được chi tiết khoản đóng băng. Vui lòng làm mới và thử lại')
        return
      }

      setUnfreezeOrders(orders)
      setSelectedUnfreezeTransaction(transaction)
    } catch {
      // Lỗi API đã được errorMiddleware hiển thị tập trung.
    } finally {
      setOpeningUnfreezeTransactionId(undefined)
    }
  }, [errorMess, getFreezes])

  const handleCloseUnfreeze = useCallback(() => {
    setSelectedUnfreezeTransaction(null)
    setUnfreezeOrders([])
  }, [])

  const totalElements = dataTransaction?.totalElements
  const dataSource = useMemo(() => (
    dataTransaction?.content?.map((item, idx) => ({
      no: (page - 1) * pageSize + idx + 1,
      ...item,
    }))
  ), [dataTransaction, page, pageSize])
  
  return {
    dataSource,
    totalElements,
    page,
    setPage,
    pageSize,
    setPageSize,
    handleSearch,
    canFreeze,
    selectedTransaction,
    selectedUnfreezeTransaction,
    unfreezeOrders,
    freezeTargets,
    openingFreezeTransactionId,
    openingUnfreezeTransactionId,
    handleOpenFreeze,
    handleCloseFreeze,
    handleOpenUnfreeze,
    handleCloseUnfreeze,
    refetch,
    isLoadingGetTransaction,
    isFetching
  }
}

export default useTransaction
