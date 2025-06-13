import { viewMode } from '@type/customer'
import { Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import CreateModal from './CreateModal'

interface IProps {
  open: boolean
  onCancel: () => void
  mode: viewMode
  selectedId?: number | undefined
  refetch: () => void
}
const DepositRequestModal: React.FC<IProps> = ({
  refetch,
  mode,
  open,
  onCancel,
  selectedId
}) => {
  const { t } = useTranslation()

  const renderModal = () => {
    if (mode === viewMode.create) {
      return (
        <CreateModal
          onCancel={onCancel}
          mode={mode}
          refetch={refetch}
        />
      )
    } else if (mode === viewMode.update) {
      return (
        <CreateModal
          onCancel={onCancel}
          mode={mode}
          selectedId={selectedId}
          refetch={refetch}
        />
      )
    } else if (mode === viewMode.view) {
      return (
        <CreateModal
          onCancel={onCancel}
          mode={mode}
          selectedId={selectedId}
          refetch={refetch}
        />
      )
    }
  }

  const titleModal = () => {
    if (mode === viewMode.create) {
      return t`internal-wallet.modal.accounting-request-add`
    } else if (mode === viewMode.update) {
      return t`internal-wallet.modal.accounting-request-update`
    } else if (mode === viewMode.view) {
      return t`internal-wallet.modal.accounting-request-view`
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
      width={800}
      footer={null}
    >
      {renderModal()}
    </Modal>
  )
}

export default DepositRequestModal
