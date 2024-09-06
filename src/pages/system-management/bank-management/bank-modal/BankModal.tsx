import BankConfiguration from '@pages/system-management/bank-management/bank-configuration/BankConfiguration'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import BankDeleteModal from '../bank-delete/BankDeleteModal'
import BankDetail from '../bank-detail/BankDetail'
import { pageEnum, viewMode } from '@type/policyManagement'
import { HistoryPolicy } from '@pages/policy-management/policy-management-modal/history-policy-modal/HistoryPolicy'

interface IProps {
  open: boolean
  mode: viewMode
  bank?: any
  onCancel: () => void
  refetch: () => void
  entityType: string
  page: pageEnum
  recordId?: number
  visibleConfirmModal?: boolean
  setVisibleConfirmModal?: React.Dispatch<React.SetStateAction<boolean>>
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onCloseConfirmModal?: () => void
}

function BankModal({
  open,
  mode,
  bank,
  onCancel,
  refetch,
  page,
  recordId,
  visibleConfirmModal,
  onCloseConfirmModal,
  setOpen,
  setVisibleConfirmModal,
  entityType
}: IProps) {
  const { t } = useTranslation()

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
      case `${viewMode.history}`:
        switch (entityType) {
          case 'SYSTEM_FEE_MANAGEMENT':
            return 'Lịch sử chỉnh sửa hạn mức'
          case 'CUSTOMER_MANAGEMENT':
            return 'Lịch sử hủy tài khoản'
          case 'SYSTEM_SETTING':
            return 'Lịch sử chỉnh sửa cấu hình'
          case 'NOTIFICATION_CONTEXT_SETTING':
            return 'Lịch sử chỉnh sửa cấu hình thông báo'
          case 'INTERNAL_WALLET_GROUP':
            return 'Lịch sử chỉnh sửa nhóm ví'
          case 'INTERNAL_WALLET':
            return 'Lịch sử chỉnh sửa ví'
          case 'ACCOUNTING':
            return 'Lịch sử chỉnh sửa hạch toán'
          case 'TRANSACTION_LIMIT':
            return 'Lịch sử chỉnh sửa hạn mức giao dịch'
          case 'BANK_MANAGEMENT':
            return 'Lịch sử chỉnh sửa ngân hàng'
          default:
            break
        }
      default:
        break
    }
  }

  const render = () => {
    switch (mode) {
      case viewMode.history:
        if (recordId) {
          return (
            <HistoryPolicy
              module={page}
              policyId={recordId}
              onCancel={onCancel}
              entityType={entityType}
            />
          )
        }
        else{
          return (
            <HistoryPolicy
              module={page}
              onCancel={onCancel}
              entityType={entityType}
            />
          )
        }
        break
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

  return (
    <Modal
      maskClosable={false}
      centered
      open={open}
      onCancel={onCancel}
      title={getTitle(mode)}
      width={
        mode === viewMode.delete ? 500 : mode === viewMode.history ? 1500 : 1300
      }
      footer={null}
      destroyOnClose
    >
      {mode === viewMode.delete ? null : <Divider className='mt-20' />}
      {render()}
    </Modal>
  )
}
export default BankModal
