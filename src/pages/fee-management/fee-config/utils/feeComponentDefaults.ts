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

export const CALCULATION_METHOD_VALUES = [
  CalculationMethod.DIRECT,
  CalculationMethod.FREE,
  CalculationMethod.PROGRESSIVE_TIER,
  CalculationMethod.FLAT_TIER
]
