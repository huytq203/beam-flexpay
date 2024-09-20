import { IPolicyTable, pageEnum, viewMode } from '@type/policyManagement'
import { Divider, Modal } from 'antd'
import { useTranslation } from 'react-i18next'
import { HistoryTable } from './HistoryTable/HistoryTable'
import { SetupDirectDepositPolicyContent } from '@pages/policy-management/payment-policy/payment-policy-modal/SetupDirectDepositPolicyContent'
import { SetupEWalletTransferMoneyContent } from '@pages/policy-management/e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'
import { DeletePolicyModal } from '@pages/policy-management/policy-management-modal/delete-modal/DeletePolicyModal'
import { CreateLimitAndRegulationsContent } from '@pages/policy-management/limit-management/limit-management-modal-content/CreateModalContent'
import { DeleteModalContent } from '@pages/policy-management/limit-management/limit-management-modal-content/DeleteModalContent'
import { CreateNotificationModal } from '@pages/system-management/notification-management/notification-modal/CreateNotificationModal'
import BankDeleteModal from '@pages/system-management/bank-management/bank-delete/BankDeleteModal'
import BankConfiguration from '@pages/system-management/bank-management/bank-configuration/BankConfiguration'
import BankDetail from '@pages/system-management/bank-management/bank-detail/BankDetail'

type AuditLogModalType = {
  open: boolean
  mode: viewMode
  onCancel: () => void
  page: pageEnum
  refetch?: () => void
  record?: IPolicyTable
  createPolicy?: any
  updatePolicy?: any
  isLoadingUpdate?: boolean
  isLoadingCreate?: boolean
  recordId?: number
  visibleConfirmModal?: boolean
  setVisibleConfirmModal?: React.Dispatch<React.SetStateAction<boolean>>
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>
  onCloseConfirmModal?: () => void
  entityType: string
}

export const AuditLogManagementModal = ({
  open,
  isLoadingUpdate,
  isLoadingCreate,
  mode,
  onCancel,
  page,
  refetch,
  record,
  createPolicy,
  updatePolicy,
  recordId,
  visibleConfirmModal,
  onCloseConfirmModal,
  setOpen,
  setVisibleConfirmModal,
  entityType
}: AuditLogModalType) => {
  const { t } = useTranslation()

  const getTitle = () => {
    const value =
      mode === viewMode.history ? `${viewMode.history}` : `${mode}-${page}`
    switch (value) {
      case `${viewMode.create}-${pageEnum.directDeposit}`:
        return t`policy-management.depositManagement.setUpModalTitle`
      case `${viewMode.update}-${pageEnum.directDeposit}`:
        return t`policy-management.depositManagement.updateTitle`
      case `${viewMode.create}-${pageEnum.eWalletTransferMoney}`:
        return t`policy-management.eWalletTransferMoneyManagement.setUpModalTitle`
      case `${viewMode.update}-${pageEnum.eWalletTransferMoney}`:
        return t`policy-management.eWalletTransferMoneyManagement.updatePolicyModalTitle`
      case `${viewMode.create}-${pageEnum.omipayPayment}`:
        return t`policy-management.omipayPaymentManagement.setUpModalTitle`
      case `${viewMode.update}-${pageEnum.omipayPayment}`:
        return t`policy-management.omipayPaymentManagement.updateModalTitle`
      case `${viewMode.delete}-${pageEnum.omipayPayment}`:
        return t`policy-management.omipayPaymentManagement.modalContent.deleteModalTitle`
      case `${viewMode.delete}-${pageEnum.eWalletTransferMoney}`:
        return t`policy-management.eWalletTransferMoneyManagement.modalContent.deleteModalTitle`
      case `${viewMode.create}-${pageEnum.limitAndRegulations}`:
        return t`policy-management.limitAndRegulations.modalContent.title.createModalTitle`
      case `${viewMode.update}-${pageEnum.limitAndRegulations}`:
        return t`policy-management.limitAndRegulations.modalContent.title.updateModalTitle`
      case `${viewMode.delete}-${pageEnum.limitAndRegulations}`:
        return t`policy-management.limitAndRegulations.modalContent.title.deleteModalTitle`
      case `${viewMode.view}-${pageEnum.limitAndRegulations}`:
        return t`policy-management.limitAndRegulations.modalContent.title.viewDetailModalTitle`
      case `${viewMode.create}-${pageEnum.withdrawMoney}`:
        return t`policy-management.payment.title.setting-withdraw`
      case `${viewMode.update}-${pageEnum.withdrawMoney}`:
        return t`policy-management.payment.title.update-setting-withdraw`
      case `${viewMode.create}-${pageEnum.accountBankPayment}`:
        return t`policy-management.payment.title.setting-account-bank`
      case `${viewMode.update}-${pageEnum.accountBankPayment}`:
        return t`policy-management.payment.title.update-setting-account-bank`
      case `${viewMode.view}-${pageEnum.bankManagement}`:
        return t`system-management.bank.modal.title`
      case `${viewMode.configuration}-${pageEnum.bankManagement}`:
        return t`system-management.bank.modal.configuration`
      case `${viewMode.update}-${pageEnum.bankManagement}`:
        return t`system-management.bank.modal.update`
      case `${viewMode.delete}-${pageEnum.bankManagement}`:
        return t`system-management.bank.modal.delete`
      case `${viewMode.create}-${pageEnum.notificationManagement}`:
        return t`notification-management.modal.create-title`
      case `${viewMode.update}-${pageEnum.notificationManagement}`:
        return t`notification-management.modal.update-title`
      case `${viewMode.view}-${pageEnum.notificationManagement}`:
        return t`notification-management.modal.view-title`
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
    const value =
      mode === viewMode.history ? viewMode.history : `${mode}-${page}`
    switch (value) {
      case `${viewMode.history}`:
        if (recordId) {
          return (
            <HistoryTable
              module={page}
              id={recordId}
              onCancel={onCancel}
              entityType={entityType}
            />
          )
        } else {
          return (
            <HistoryTable
              module={page}
              onCancel={onCancel}
              entityType={entityType}
            />
          )
        }
        break
      case `${viewMode.create}-${pageEnum.directDeposit}`:
        return (
          <SetupDirectDepositPolicyContent
            onCancel={onCancel}
            module={pageEnum.directDeposit}
            mode={mode}
            refetch={refetch}
          />
        )
      case `${viewMode.update}-${pageEnum.directDeposit}`:
        return (
          <SetupDirectDepositPolicyContent
            onCancel={onCancel}
            module={pageEnum.directDeposit}
            mode={mode}
            refetch={refetch}
            recordId={recordId}
          />
        )
      case `${viewMode.create}-${pageEnum.eWalletTransferMoney}`:
        return (
          <SetupEWalletTransferMoneyContent
            refetch={refetch}
            onCancel={onCancel}
            mode={mode}
            createPolicy={createPolicy}
            updatePolicy={updatePolicy}
            isLoadingUpdate={isLoadingUpdate ? isLoadingUpdate : false}
            isLoadingCreate={isLoadingCreate ? isLoadingCreate : false}
          />
        )
      case `${viewMode.update}-${pageEnum.eWalletTransferMoney}`:
        return (
          <SetupEWalletTransferMoneyContent
            refetch={refetch}
            onCancel={onCancel}
            record={record}
            mode={mode}
            createPolicy={createPolicy}
            updatePolicy={updatePolicy}
            isLoadingUpdate={isLoadingUpdate ? isLoadingUpdate : false}
            isLoadingCreate={isLoadingCreate ? isLoadingCreate : false}
          />
        )
      case `${viewMode.create}-${pageEnum.omipayPayment}`:
        return (
          <SetupEWalletTransferMoneyContent
            createPolicy={createPolicy}
            updatePolicy={updatePolicy}
            refetch={refetch}
            onCancel={onCancel}
            mode={mode}
            isLoadingUpdate={isLoadingUpdate ? isLoadingUpdate : false}
            isLoadingCreate={isLoadingCreate ? isLoadingCreate : false}
          />
        )
      case `${viewMode.update}-${pageEnum.omipayPayment}`:
        return (
          <SetupEWalletTransferMoneyContent
            createPolicy={createPolicy}
            updatePolicy={updatePolicy}
            refetch={refetch}
            onCancel={onCancel}
            mode={mode}
            record={record}
            isLoadingUpdate={isLoadingUpdate ? isLoadingUpdate : false}
            isLoadingCreate={isLoadingCreate ? isLoadingCreate : false}
          />
        )
      case `${viewMode.delete}-${pageEnum.omipayPayment}`:
        return (
          <DeletePolicyModal
            refetch={refetch}
            onCancel={onCancel}
            policyId={record?.id}
          />
        )
      case `${viewMode.delete}-${pageEnum.eWalletTransferMoney}`:
        return (
          <DeletePolicyModal
            refetch={refetch}
            onCancel={onCancel}
            policyId={record?.id}
          />
        )
      case `${viewMode.create}-${pageEnum.limitAndRegulations}`:
        return (
          <CreateLimitAndRegulationsContent
            onCloseConfirmModal={onCloseConfirmModal}
            setVisibleConfirmModal={setVisibleConfirmModal}
            visibleConfirmModal={visibleConfirmModal}
            refetch={refetch}
            onCancel={onCancel}
            mode={mode}
            id={recordId}
            setOpen={setOpen}
          />
        )
      case `${viewMode.update}-${pageEnum.limitAndRegulations}`:
        return (
          <CreateLimitAndRegulationsContent
            onCloseConfirmModal={onCloseConfirmModal}
            setVisibleConfirmModal={setVisibleConfirmModal}
            visibleConfirmModal={visibleConfirmModal}
            refetch={refetch}
            onCancel={onCancel}
            mode={mode}
            id={recordId}
            setOpen={setOpen}
          />
        )
      case `${viewMode.delete}-${pageEnum.limitAndRegulations}`:
        return (
          <DeleteModalContent
            id={recordId}
            onCancel={onCancel}
            refetch={refetch}
          />
        )
      case `${viewMode.create}-${pageEnum.withdrawMoney}`:
        return (
          <SetupDirectDepositPolicyContent
            onCancel={onCancel}
            module={pageEnum.withdrawMoney}
            mode={mode}
            refetch={refetch}
          />
        )
      case `${viewMode.update}-${pageEnum.withdrawMoney}`:
        return (
          <SetupDirectDepositPolicyContent
            onCancel={onCancel}
            module={pageEnum.withdrawMoney}
            mode={mode}
            refetch={refetch}
            recordId={recordId}
          />
        )
      case `${viewMode.create}-${pageEnum.accountBankPayment}`:
        return (
          <SetupDirectDepositPolicyContent
            onCancel={onCancel}
            module={pageEnum.accountBankPayment}
            mode={mode}
            refetch={refetch}
          />
        )
      case `${viewMode.update}-${pageEnum.accountBankPayment}`:
        return (
          <SetupDirectDepositPolicyContent
            onCancel={onCancel}
            module={pageEnum.accountBankPayment}
            mode={mode}
            refetch={refetch}
            recordId={recordId}
          />
        )
      case `${viewMode.view}-${pageEnum.bankManagement}`:
        return (
          <BankDetail
            onCancel={onCancel}
            bank={record}
          />
        )
      case `${viewMode.configuration}-${pageEnum.bankManagement}`:
        return (
          <BankConfiguration
            onCancel={onCancel}
            mode={mode}
            refetch={refetch}
          />
        )
      case `${viewMode.update}-${pageEnum.bankManagement}`:
        return (
          <BankConfiguration
            onCancel={onCancel}
            mode={mode}
            bank={record}
            refetch={refetch}
          />
        )
      case `${viewMode.delete}-${pageEnum.bankManagement}`:
        return (
          <BankDeleteModal
            onCancel={onCancel}
            refetch={refetch}
            bankId={recordId}
          />
        )
      case `${viewMode.create}-${pageEnum.notificationManagement}`:
        return (
          <CreateNotificationModal
            mode={mode}
            onCancel={onCancel}
            refetch={refetch}
          />
        )
      case `${viewMode.update}-${pageEnum.notificationManagement}`:
        return (
          <CreateNotificationModal
            mode={mode}
            onCancel={onCancel}
            refetch={refetch}
            id={recordId?.toString()}
          />
        )
      case `${viewMode.view}-${pageEnum.notificationManagement}`:
        return (
          <CreateNotificationModal
            mode={mode}
            onCancel={onCancel}
            refetch={refetch}
            id={recordId?.toString()}
          />
        )
      default:
        break
    }
  }

  return (
    <Modal
      open={open}
      maskClosable={false}
      onCancel={onCancel}
      title={getTitle()}
      width={
        mode === viewMode.delete ? 500 : mode === viewMode.history ? 1500 : 1300
      }
      footer={null}
      destroyOnClose
      centered
    >
      {mode === viewMode.delete ? null : <Divider className='mt-20' />}
      {render()}
    </Modal>
  )
}
