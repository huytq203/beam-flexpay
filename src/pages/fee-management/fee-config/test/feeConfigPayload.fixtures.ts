import { CalculationMethod } from '../schemas/feeConfig.schema'
import type { FeeConfigFormValues } from '../schemas/feeConfig.schema'

export const baseForm = (
  overrides: Partial<FeeConfigFormValues> = {}
): FeeConfigFormValues => ({
  feeDomain: 'EWALLET',
  name: '  Phí rút tiền ví  ',
  description: '  ',
  priority: 2,
  serviceType: 'EWALLET_WITHDRAWAL',
  bankCode: '',
  providerCode: '',
  paymentMethod: 'ATM',
  merchantId: '',
  subjectId: '',
  customerGroup: '',
  assignmentScope: 'ALL',
  validFrom: '2026-10-01T08:30:00.000',
  validTo: '',
  components: [
    {
      key: 'c1',
      feeScope: 'OUTPUT_FEE',
      componentType: 'TRANSACTION_FEE',
      baseOn: 'AMOUNT',
      baseComponentType: null,
      calculationMethod: CalculationMethod.DIRECT,
      payerType: 'USER',
      beneficiaryType: 'SYSTEM',
      fixedAmount: 2000,
      percentage: 1,
      minFee: 2000,
      maxFee: 0,
      roundMode: 'UP',
      tiers: []
    }
  ],
  ...overrides
})
