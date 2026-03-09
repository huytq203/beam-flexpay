import { POLICY_MANAGEMENT_TYPE, viewMode } from "@type/policyManagement"
import { Divider, Modal } from "antd"
import { useTranslation } from "react-i18next"
import SetupDirectPolicyContent from "./SetupDirectPolicyContent"
import { HistoryPolicy } from "./policy-management-modal/history-policy-modal/HistoryPolicy"


type PolicyManagementModalType = {
    onCancel: () => void
    open: boolean
    mode: viewMode
    refetch: () => void
    recordId: number
    entityType: string
    policyManagementType: POLICY_MANAGEMENT_TYPE
}

const PolicyManagementModal = ({
    open,
    onCancel,
    mode,
    refetch,
    recordId,
    entityType,
    policyManagementType
}: PolicyManagementModalType) => {
    const { t } = useTranslation()
    const getTitle = () => {
        const value = mode === viewMode.history ? `${viewMode.history}` : `${mode}-${policyManagementType}`
        switch (value) {
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.WITHDRAW}`:
                return t`policy-management.payment.title.setting-withdraw`
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.WITHDRAW}`:
                return t`policy-management.payment.title.update-setting-withdraw`
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY}`:
                return t`policy-management.depositManagement.setUpModalTitle`
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY}`:
                return t`policy-management.depositManagement.updateTitle`
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM}`:
                return t`policy-management.payment.title.setting-account-bank`
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM}`:
                return t`policy-management.payment.title.update-setting-account-bank`
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL}`:
                return t`policy-management.eWalletTransferMoneyManagement.setUpModalTitle`
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL}`:
                return t`policy-management.eWalletTransferMoneyManagement.updatePolicyModalTitle`
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY}`:
                return t`policy-management.eWalletTransferMoneyManagement.setUpModalTitle`
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY}`:
                return t`policy-management.eWalletTransferMoneyManagement.updatePolicyModalTitle`
            // case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.LIMIT_AND_REGULATIONS}`:
            //     return t`policy-management.limitAndRegulations.modalContent.title.createModalTitle`
            // case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.LIMIT_AND_REGULATIONS}`:
            //     return t`policy-management.limitAndRegulations.modalContent.title.updateModalTitle`
            // case `${viewMode.delete}-${POLICY_MANAGEMENT_TYPE.LIMIT_AND_REGULATIONS}`:
            //     return t`policy-management.limitAndRegulations.modalContent.title.deleteModalTitle`
            // case `${viewMode.view}-${POLICY_MANAGEMENT_TYPE.LIMIT_AND_REGULATIONS}`:
            //     return t`policy-management.limitAndRegulations.modalContent.title.viewDetailModalTitle`
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
        const value = mode === viewMode.history ? viewMode.history : `${mode}-${policyManagementType}`
        switch (value) {
            case `${viewMode.history}`:
                if (recordId) {
                return (
                    <HistoryPolicy
                    module={policyManagementType}
                    policyId={recordId}
                    onCancel={onCancel}
                    entityType={entityType}
                    />
                )
                }
                else{
                return (
                    <HistoryPolicy
                    module={policyManagementType}
                    onCancel={onCancel}
                    entityType={entityType}
                    />
                )
                }
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.WITHDRAW}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.WITHDRAW}
                        mode={mode}
                        refetch={refetch}
                    />
                )
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.WITHDRAW}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.WITHDRAW}
                        mode={mode}
                        refetch={refetch}
                        recordId={recordId}
                    />
                )
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY}
                        mode={mode}
                        refetch={refetch}
                    />
                )
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.DEPOSIT_FLEXPAY}
                        mode={mode}
                        refetch={refetch}
                        recordId={recordId}
                    />
                )
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM}
                        mode={mode}
                        refetch={refetch}
                    />
                )
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.PAYMENT_BANK_OR_ATM}
                        mode={mode}
                        refetch={refetch}
                        recordId={recordId}
                    />
                )
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL}
                        mode={mode}
                        refetch={refetch}
                    />
                )
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.TRANSFER_INTERNAL}
                        mode={mode}
                        refetch={refetch}
                        recordId={recordId}
                    />
                )
            case `${viewMode.create}-${POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY}
                        mode={mode}
                        refetch={refetch}
                    />
                )
            case `${viewMode.update}-${POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY}`:
                return (
                    <SetupDirectPolicyContent
                        onCancel={onCancel}
                        module={POLICY_MANAGEMENT_TYPE.PAYMENT_FLEXPAY}
                        mode={mode}
                        refetch={refetch}
                        recordId={recordId}
                    />
                )
            default:
                return null
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

export default PolicyManagementModal
