import { viewMode } from '@type/permission'
import { Button, Divider, Modal, Typography } from 'antd'
import { useTranslation } from 'react-i18next'
import CreateGroup from './CreateGroup'
import DeleteModal from './DeleteModal'

interface IProps {
  open: boolean
  onCancel: () => void
  mode: viewMode
  selectedId?: number | undefined
  refetch: () => void
}
function GroupModal({ refetch, mode, open, onCancel, selectedId }: IProps) {
  const { t } = useTranslation()

  const renderModal = () => {
    if (mode === viewMode.create) {
      return (
        <CreateGroup
          onCancel={onCancel}
          mode={mode}
          refetch={refetch}
        />
      )
    } else if (mode === viewMode.update) {
      return (
        <CreateGroup
          onCancel={onCancel}
          mode={mode}
          selectedId={selectedId}
          refetch={refetch}
        />
      )
    } else {
      return (
        <DeleteModal
          onCancel={onCancel}
          selectedId={selectedId}
          refetch={refetch}
        />
      )
    }
  }

  const titleModal = () => {
    if (mode === viewMode.create) {
      return t`customer-group.modal.add`
    } else if (mode === viewMode.update) {
      return t`customer-group.modal.update`
    } else {
      return t`customer-group.modal.delete`
    }
  }

  return (
    <Modal
      maskClosable={false}
      destroyOnClose
      centered
      title={titleModal()}
      open={open}
      onCancel={onCancel}
      width={mode === viewMode.delete ? 500 : 800}
      footer={null}
    >
      {renderModal()}
    </Modal>
  )
}

export default GroupModal
