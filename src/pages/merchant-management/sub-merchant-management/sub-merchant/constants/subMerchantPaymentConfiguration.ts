import type { SubMerchantRow } from '../types/subMerchant.type'

interface PaymentConfiguration {
  readonly methods: readonly string[]
  readonly limitLabel: string
}

const MASTER_PAYMENT_CONFIGURATIONS: Readonly<Record<string, PaymentConfiguration>> = {
  'merchant-0142': {
    methods: ['QR động', 'Ví điện tử', 'Thẻ nội địa', 'Visa', 'Mastercard'],
    limitLabel: 'Tối đa 50.000.000 VND/giao dịch'
  },
  'merchant-0220': {
    methods: ['QR động', 'Ví điện tử'],
    limitLabel: 'Tối đa 30.000.000 VND/giao dịch'
  },
  'merchant-0160': {
    methods: ['Thẻ nội địa', 'Ví điện tử'],
    limitLabel: 'Tối đa 20.000.000 VND/giao dịch'
  },
  'merchant-0301': {
    methods: ['QR động', 'Ví điện tử', 'Thẻ nội địa'],
    limitLabel: 'Tối đa 25.000.000 VND/giao dịch'
  }
}

const SUB_PAYMENT_OVERRIDES: Readonly<Record<string, PaymentConfiguration>> = {
  'sub-locked': {
    methods: ['QR động', 'Thẻ nội địa'],
    limitLabel: 'Tối đa 20.000.000 VND/giao dịch'
  }
}

export const getSubMerchantPaymentConfiguration = (sub: SubMerchantRow): PaymentConfiguration => {
  const configuration = sub.configurationSources.payment === 'OVERRIDDEN'
    ? SUB_PAYMENT_OVERRIDES[sub.id]
    : MASTER_PAYMENT_CONFIGURATIONS[sub.parentMerchantId]
  if (!configuration) throw new Error('Không tìm thấy cấu hình thanh toán của Sub-merchant')
  return configuration
}
