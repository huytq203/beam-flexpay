import { useState, useCallback, useMemo } from 'react'
import { ModalType, SelectedUser } from '../types/UserManagement.type'
import { UserManagementColumn } from '../columns/UserManagement.column'

const useHandleUser = () => {
  const [modalType, setModalType] = useState<ModalType>(null)
  const [selectedUser, setSelectedUser] = useState<SelectedUser | null>(null)

  const openModal = useCallback((type: ModalType, user?: SelectedUser | null) => {
    setSelectedUser(user ?? null)
    setModalType(type)
  }, [])

  const closeModal = useCallback(() => {
    setModalType(null)
    setSelectedUser(null)
  }, [])

  const column = useMemo(
    () => UserManagementColumn({ openModal }),
    [openModal]
  )

  return {
    modalType,
    selectedUser,
    openModal,
    closeModal,
    column
  }
}

export default useHandleUser
