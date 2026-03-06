import usePagination from '@hooks/usePagination'
import { AcountItem, FormSearchValues } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { useGetAccountQuery } from '@services/apiWalletAccount.api'
import { useState } from 'react'
import { Column } from '../columns/Column'
import { useLazyGetFreezesQuery } from '@services/apiFreezes'

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

  const payload={
    page,
    size,
    ...filter
  }
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

  const dataSource = getAccount?.data?.content.map((item: AcountItem, index: number) => ({
    ...item,
    no: (page - 1) * size + index + 1,
  }))

  const column = Column({ openModal})

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
    isFetching
    
  }
}

export default useEwalletManagement
