import { FeePolicyListPage } from '@pages/fee-management-v4/fee-management/components/FeePolicyListPage'
import { BANK_FEE_SCOPE } from '@pages/fee-management-v4/fee-management/constants/feePolicyScope'

const BankFeeManagement = () => <FeePolicyListPage scope={BANK_FEE_SCOPE} />

export default BankFeeManagement
