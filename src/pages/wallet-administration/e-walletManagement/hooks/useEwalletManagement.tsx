import usePagination from '@hooks/usePagination'
import { AcountItem, FormSearchValues } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { useGetAccountQuery, usePostLockMutation, usePostUnlockMutation } from '@services/apiWalletAccount.api'
import { useMemo, useState } from 'react'
import { getColumn } from '../columns/Column'
import { useLazyGetFreezesQuery } from '@services/apiFreezes'
import { useNavigate } from 'react-router-dom'
import { dataLockAccount } from '../types/WalletAccount.type'

type ModalType = 'freeze' | 'unfreeze' | 'lock' | 'unlock' | null

interface SelectedAccount {
  id: string
  ownerId?: string
  ownerName?: string
  balance?: number
  holdBalance?: number
  currency?: string
}

const useEwalletManagement = () => {
  const { params, page, size, setPageSize, setPage } = usePagination()
  const [filter, setFilter] = useState({})
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedAccount, setSelectedAccount] = useState<SelectedAccount | null>(null)
  const navigate = useNavigate()

  const payload={
    page,
    size,
    ...filter
  }

  const [postLockAccount] = usePostLockMutation()
  const [postUnlockAccount] = usePostUnlockMutation()
  const { data: getAccount,isLoading:loadingGetAccount, isFetching } = useGetAccountQuery(payload)

  const handleSearch = (data: FormSearchValues) => {
    setFilter(data)
    setPage(1)
  }


  const openModal = (type: ModalType, account: SelectedAccount) => {
    setSelectedAccount(account)
    setModalType(type)
  }

  const closeModal = () => {
    setModalType(null)
    setSelectedAccount(null)
  }

  const dataSource = useMemo(() => getAccount?.content.map((item: AcountItem, index: number) => ({
    ...item,
    no: (page - 1) * size + index + 1,
  })), [getAccount])

  const column = getColumn({ openModal, navigate })

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
  
    
  }
}

export default useEwalletManagement
