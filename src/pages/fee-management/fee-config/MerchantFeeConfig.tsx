import { FeeConfigPage } from './FeeConfig'
import { FEE_SCREEN } from './constants/feeScreen'

/** Màn tạo và sửa chính sách phí ĐVCNTT: phí đầu ra cố định miền `MERCHANT`. */
const MerchantFeeConfig = () => (
  <FeeConfigPage screen={FEE_SCREEN.MERCHANT_FEE} />
)

export default MerchantFeeConfig
