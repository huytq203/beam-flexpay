import { FeeConfigPage } from './FeeConfig'
import { POLICY_KIND } from './constants/feeConfigFields'

/** Màn tạo và sửa chính sách phí đầu vào (`INPUT_COST`). */
const InputCostConfig = () => (
  <FeeConfigPage policyKind={POLICY_KIND.INPUT_COST} />
)

export default InputCostConfig
