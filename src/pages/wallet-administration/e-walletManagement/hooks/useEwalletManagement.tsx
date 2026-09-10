import usePagination from '@hooks/usePagination'
import { AcountItem, FormSearchValues } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import {
  useGetAccountQuery,
  useLazyGetAccountByIdQuery,
  usePostLockMutation,
  usePostUnlockMutation
} from '@services/apiWalletAccount.api'
import { useCallback, useMemo, useState } from 'react'
import { getColumn } from '../columns/Column'
import { useNavigate } from 'react-router-dom'
import { useScreenAccess } from '@/app/permissions'
import type { WalletModalType } from '../columns/wallet-row-actions'
import { preloadWalletDetailAndNavigate } from '../columns/wallet-row-actions'

const useEwalletManagement = () => {
  const { page, size, setPageSize, setPage } = usePagination()
  const [filter, setFilter] = useState<FormSearchValues>({})
  const [modalType, setModalType] = useState<WalletModalType>(null)
  const [selectedAccount, setSelectedAccount] = useState<AcountItem | null>(null)
  const navigate = useNavigate()
  const { can } = useScreenAccess('EWALLET_MANAGEMENT')

  const payload={
    page,
    size,
    ...filter
  }

  const [_postLockAccount] = usePostLockMutation()
  const [_postUnlockAccount] = usePostUnlockMutation()
  const [getAccountById, { isFetching: isOpeningDetail }] =
    useLazyGetAccountByIdQuery()
  const {
    data: getAccount,
    isLoading: loadingGetAccount,
    isFetching,
    refetch
  } = useGetAccountQuery(payload)

  const handleSearch = (data: FormSearchValues) => {
    setFilter(data)
    setPage(1)
  }


  const openModal = useCallback((type: WalletModalType, account: AcountItem) => {
    setSelectedAccount(account)
    setModalType(type)
  }, [])

  const closeModal = () => {
    setModalType(null)
    setSelectedAccount(null)
  }

  const handleViewDetail = useCallback(async (account: AcountItem) => {
    try {
      // Tải đúng dữ liệu ví vào RTK Query cache trước khi render route chi tiết.
      await preloadWalletDetailAndNavigate(account, {
        loadAccountById: getAccountById,
        navigate
      })
    } catch {
      // Base query đã hiển thị thông báo lỗi; giữ người dùng tại danh sách.
    }
  }, [getAccountById, navigate])

  const dataSource = useMemo<AcountItem[] | undefined>(() => getAccount?.content.map((item, index) => ({
    ...item,
    no: (page - 1) * size + index + 1,
  })), [getAccount, page, size])

  const column = useMemo(
    () => getColumn({ openModal, onViewDetail: handleViewDetail, can }),
    [can, handleViewDetail, openModal]
  )

  return {
    column,
    dataSource,
    getAccount,
    page,
    size,
    setPageSize,
    setPage,
    handleSearch,
    modalType,
    selectedAccount,
    closeModal,
    loadingGetAccount,
    isFetching,
    isOpeningDetail,
    refetch,
  
    
  }
}

export default useEwalletManagement
