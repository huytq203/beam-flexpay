import type { FeeScope } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'

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
