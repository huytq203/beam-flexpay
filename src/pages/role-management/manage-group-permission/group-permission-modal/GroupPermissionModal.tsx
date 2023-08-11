import { GroupPermissionCheckbox } from '@pages/role-management/Component/GroupPermissionCheckbox/GroupPermissionCheckbox'
import { viewMode } from '@type/permission'
import { Modal, ModalProps } from 'antd'
import { useTranslation } from 'react-i18next'
import { DeleteConfirmModal } from '../delete-confirm/DeleteConfirmModal'
import { EditGroupPermission } from '../update-group-permission/UpdateGroupPermission'

interface GroupPermissionType extends ModalProps {
  onCancel: () => void
  mode?: viewMode
  id: string
  visible: boolean
  refetch: () => void
}
function GroupPermissionModal({
  mode,
  visible,
  onCancel,
  refetch,
  id,
  ...props
}: GroupPermissionType) {
  const { t } = useTranslation()

  const getTitle = () => {
    switch (mode) {
      case viewMode.create:
        return t`manage-group-permissions.form.create-title`
      case viewMode.update:
        return t`manage-group-permissions.form.edit-title`
      case viewMode.delete:
        return t`manage-group-permissions.popupAndModal.deleteConfirmTitle`
    }
  }

  const render = () => {
    switch (mode) {
      case viewMode.create:
        return (
          <GroupPermissionCheckbox
            refetch={refetch}
            onCancel={onCancel}
          />
        )
      case viewMode.update:
        return (
          <EditGroupPermission
            id={id}
            onCancel={onCancel}
            refetch={refetch}
          />
        )
      case viewMode.delete:
        return (
          <DeleteConfirmModal
            id={id}
            onCancel={onCancel}
            refetch={refetch}
          />
        )
    }
  }
  return (
    <Modal
      open={visible}
      onCancel={onCancel}
      centered
      title={getTitle()}
      footer={null}
      width={mode === viewMode.delete ? 500 : 1000}
      destroyOnClose={true}
      className='modal-group-permissions'
      maskClosable={false}
      mask
      {...props}
    >
      {render()}
    </Modal>
  )
}
export default GroupPermissionModal
