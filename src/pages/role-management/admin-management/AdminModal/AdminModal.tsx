import { Modal, ModalProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { viewMode } from '@type/admin'
import { CreateAdminModalForm } from './CreateAdminModalForm'
import { DeleteAdminModal } from './DeleteAdminModal'
import { LockAndUnlockAdminModal } from './LockAndUnlockAdminModal'
import { PermissionGroupModal } from './PermissionGroupModal'
import { UpdateAdminModalForm } from './UpdateAdminModalForm'
import { ViewAdminModal } from './ViewAdminModal'

interface AdminModalType extends ModalProps {
  mode: viewMode
  visible: boolean
  id: string
  onCancel: () => void
  refetch: () => void
}

export const AdminModal = ({
  onCancel,
  visible,
  refetch,
  id,
  mode,
  ...props
}: AdminModalType) => {
  const { t: trans } = useTranslation()

  const render = () => {
    switch (mode) {
      case viewMode.update:
        return (
          <UpdateAdminModalForm
            onCancel={onCancel}
            id={id}
          />
        )
      case viewMode.view:
        return (
          <ViewAdminModal
            onCancel={onCancel}
            id={id}
          />
        )
      case viewMode.delete:
        return (
          <DeleteAdminModal
            onCancel={onCancel}
            id={id}
            refetch={refetch}
          />
        )
      case viewMode.permission:
        return (
          <PermissionGroupModal
            onCancel={onCancel}
            id={id}
            refetch={refetch}
          />
        )
      case viewMode.lock:
      case viewMode.unlock:
        return (
          <LockAndUnlockAdminModal
            mode={mode}
            id={id}
            onCancel={onCancel}
            refetch={refetch}
          />
        )
      default:
        return (
          <CreateAdminModalForm
            onCancel={onCancel}
            refetch={refetch}
          />
        )
    }
  }

  return (
    <Modal
      title={trans(`admin-management.title.${mode.toString()}`)}
      open={visible}
      footer={false}
      onCancel={onCancel}
      centered
      destroyOnClose={true}
      width={
        mode === viewMode.delete ||
        mode === viewMode.update ||
        mode === viewMode.lock ||
        mode === viewMode.unlock
          ? 500
          : 1000
      }
      maskClosable={false}
      mask
      {...props}
    >
      {render()}
    </Modal>
  )
}
