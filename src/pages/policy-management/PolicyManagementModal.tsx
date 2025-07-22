import { pageEnum, POLICY_MANAGEMENT_TYPE, viewMode } from "@type/policyManagement"
import { Divider, Modal } from "antd"
import { useTranslation } from "react-i18next"
import SetupDirectPolicyContent from "./SetupDirectPolicyContent"


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