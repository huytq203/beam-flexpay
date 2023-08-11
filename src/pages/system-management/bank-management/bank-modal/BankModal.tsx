import BankConfiguration from '@pages/system-management/bank-management/bank-configuration/BankConfiguration'
import { viewMode } from '@type/customer'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import BankDeleteModal from '../bank-delete/BankDeleteModal'
import BankDetail from '../bank-detail/BankDetail'

interface IProps {
  open: boolean
  mode: viewMode
  bank?: any
  onCancel: () => void
  refetch: () => void
}

function BankModal({ open, mode, bank, onCancel, refetch }: IProps) {
  const { t } = useTranslation()

  const render = () => {
    switch (mode) {
      case viewMode.view:
        return (
          <BankDetail
            onCancel={onCancel}
            bank={bank}
          />
        )
      case viewMode.configuration:
        return (
          <BankConfiguration
            onCancel={onCancel}
            mode={mode}
            refetch={refetch}
          />
        )
      case viewMode.update:
        return (
          <BankConfiguration
            onCancel={onCancel}
            mode={mode}
            bank={bank}
            refetch={refetch}
          />
        )
      case viewMode.delete:
        return (
          <BankDeleteModal
            onCancel={onCancel}
            refetch={refetch}
            bankId={bank.id}
          />
        )
      default:
        return
    }
  }

  /**
   * get title of modal
   * @param mode
   * @returns
   */
  const getTitle = (mode: viewMode) => {
    switch (mode) {
      case viewMode.view:
        return t`system-management.bank.modal.title`
      case viewMode.configuration:
        return t`system-management.bank.modal.configuration`
      case viewMode.update:
        return t`system-management.bank.modal.update`
      case viewMode.delete:
        return t`system-management.bank.modal.delete`
      default:
        return
    }
  }

  return (
    <Modal
      maskClosable={false}
      centered
      open={open}
      onCancel={onCancel}
      title={getTitle(mode)}
      width={
        mode === viewMode.view ? 950 : mode === viewMode.delete ? 600 : 1000
      }
      footer={null}
    >
      <Divider className='mt-10 mb-10' />
      {render()}
    </Modal>
  )
}
export default BankModal
