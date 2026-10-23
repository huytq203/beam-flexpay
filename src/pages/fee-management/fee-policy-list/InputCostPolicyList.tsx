import { POLICY_KIND } from '@pages/fee-management/fee-config/constants/feeConfigFields'
import { FeePolicyListPage } from './FeePolicyList'

/** Màn Cấu hình phí đầu vào: chính sách chi phí đầu vào (`INPUT_COST`) theo tuyến thanh toán. */
const InputCostPolicyList = () => (
  <FeePolicyListPage policyKind={POLICY_KIND.INPUT_COST} />
)

export default InputCostPolicyList
