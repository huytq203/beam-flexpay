import { FEE_SCREEN } from '@pages/fee-management/fee-config/constants/feeScreen'
import { FeePolicyListPage } from './FeePolicyList'

/** Màn Cấu hình phí đầu vào: chính sách chi phí đầu vào (`INPUT_COST`) theo tuyến thanh toán. */
const InputCostPolicyList = () => (
  <FeePolicyListPage screen={FEE_SCREEN.INPUT_COST} />
)

export default InputCostPolicyList
