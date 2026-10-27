import { FEE_SCREEN } from '@pages/fee-management/fee-config/constants/feeScreen'
import { FeePolicyListPage } from './FeePolicyList'

/** Màn Cấu hình phí ĐVCNTT: chính sách phí đầu ra miền `MERCHANT` (thu hộ VA, chi hộ chuyển khoản). */
const MerchantFeePolicyList = () => (
  <FeePolicyListPage screen={FEE_SCREEN.MERCHANT_FEE} />
)

export default MerchantFeePolicyList
