import type { FeeScope } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'

/**
 * Cách tính mặc định: ô Phí % và Phí cố định để trống được điền 0 khi lưu. Hai ô cùng bằng 0 là
 * miễn phí, nên không cần công thức riêng và không có lỗi "chưa nhập mức phí".
 */
export const withZeroRates = (
  component: FeeComponentFormValues
): FeeComponentFormValues =>
  usesTiers(component.calculationMethod)
    ? component
    : {
        ...component,
        percentage: component.percentage ?? 0,
        fixedAmount: component.fixedAmount ?? 0
      }

export const emptyComponent = (
  feeScope: FeeScope,
  payerType: string,
  beneficiaryType: string
): FeeComponentFormValues => ({
  key: crypto.randomUUID(),
  feeScope,
  componentType: '',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType,
  beneficiaryType,
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: []
})

/** Miễn phí không còn là lựa chọn riêng: nhập 0 ở Phí (%) hoặc Phí cố định. */
export const CALCULATION_METHOD_VALUES = [
  CalculationMethod.DIRECT,
  CalculationMethod.PROGRESSIVE_TIER,
  CalculationMethod.FLAT_TIER
]
