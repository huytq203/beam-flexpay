import { PATHS } from '@constants/pathConstant'
import {
  allowsMerchantCriteria,
  withoutHiddenServiceTypes
} from '@utils/fee-execution'
import { POLICY_KIND, type PolicyKind } from './feeConfigFields'
import { HIDDEN_SERVICE_TYPES_BY_POLICY_KIND } from './policyKindServiceTypes'

/**
 * Ba màn cấu hình phí dùng chung một bộ màn danh sách / biểu mẫu. `policyKind` gửi xuống BE chỉ có hai
 * giá trị; màn ĐVCNTT là phí đầu ra (`CUSTOMER_FEE`) cố định miền `MERCHANT`, nên không đổi hợp đồng API.
 */
export const FEE_SCREEN = {
  CUSTOMER_FEE: 'CUSTOMER_FEE',
  INPUT_COST: 'INPUT_COST',
  MERCHANT_FEE: 'MERCHANT_FEE'
} as const

export type FeeScreen = (typeof FEE_SCREEN)[keyof typeof FEE_SCREEN]

export interface FeeScreenConfig {
  policyKind: PolicyKind
  /** Khóa màn trong `SCREENS` của registry quyền. */
  permissionScreen: 'FEE_CONFIG' | 'FEE_INPUT_COST' | 'MERCHANT_FEE_CONFIG'
  listPath: string
  createPath: string
  editPath: (id: string) => string
  /** Bộ lọc miền cố định của danh sách; để trống thì danh sách không ép miền. */
  feeDomain?: 'MERCHANT'
  /** Tiền tố tên file CSV xuất ra. */
  csvPrefix: string
  title: string
}

export const FEE_SCREEN_CONFIG: Readonly<Record<FeeScreen, FeeScreenConfig>> = {
  [FEE_SCREEN.CUSTOMER_FEE]: {
    policyKind: POLICY_KIND.CUSTOMER_FEE,
    permissionScreen: 'FEE_CONFIG',
    listPath: PATHS.FEE_V4.POLICY_LIST,
    createPath: PATHS.FEE_V4.POLICY_CREATE,
    editPath: PATHS.FEE_V4.POLICY_EDIT,
    csvPrefix: 'cau-hinh-phi',
    title: 'Cấu hình phí đầu ra'
  },
  [FEE_SCREEN.INPUT_COST]: {
    policyKind: POLICY_KIND.INPUT_COST,
    permissionScreen: 'FEE_INPUT_COST',
    listPath: PATHS.FEE_V4.INPUT_COST_LIST,
    createPath: PATHS.FEE_V4.INPUT_COST_CREATE,
    editPath: PATHS.FEE_V4.INPUT_COST_EDIT,
    csvPrefix: 'cau-hinh-phi',
    title: 'Cấu hình phí đầu vào'
  },
  [FEE_SCREEN.MERCHANT_FEE]: {
    policyKind: POLICY_KIND.CUSTOMER_FEE,
    permissionScreen: 'MERCHANT_FEE_CONFIG',
    listPath: PATHS.MERCHANT_FEE.LIST,
    createPath: PATHS.MERCHANT_FEE.CREATE,
    editPath: PATHS.MERCHANT_FEE.EDIT,
    feeDomain: 'MERCHANT',
    csvPrefix: 'cau-hinh-phi-dvcntt',
    title: 'Cấu hình phí ĐVCNTT'
  }
}

/**
 * Chính sách thuộc màn nào: chỉ phí đầu ra miền `MERCHANT` thuộc màn ĐVCNTT, còn lại ở màn theo loại
 * chính sách. Dùng để đưa người dùng về đúng màn khi mở một chính sách qua đường dẫn của màn khác.
 */
export const feeScreenOfPolicy = (
  policyKind: PolicyKind,
  feeDomain: string | null | undefined
): FeeScreen => {
  if (policyKind === POLICY_KIND.INPUT_COST) return FEE_SCREEN.INPUT_COST
  return feeDomain === 'MERCHANT'
    ? FEE_SCREEN.MERCHANT_FEE
    : FEE_SCREEN.CUSTOMER_FEE
}

/**
 * Loại giao dịch hiện trong ô chọn / tab lọc của từng màn. Màn ĐVCNTT chỉ hiện loại có người chịu phí là
 * merchant (thu hộ, chi hộ); màn chung vẫn ẩn như trước. `current` luôn được giữ để chính sách lạc màn
 * vẫn hiện đúng nhãn khi mở sửa.
 */
export const visibleServiceTypesFor = (
  screen: FeeScreen,
  serviceTypes: readonly string[],
  current?: string | null
): readonly string[] => {
  if (screen === FEE_SCREEN.MERCHANT_FEE) {
    return serviceTypes.filter(
      (serviceType) =>
        serviceType === current || allowsMerchantCriteria(serviceType)
    )
  }
  return withoutHiddenServiceTypes(
    serviceTypes,
    current,
    HIDDEN_SERVICE_TYPES_BY_POLICY_KIND[FEE_SCREEN_CONFIG[screen].policyKind]
  )
}
