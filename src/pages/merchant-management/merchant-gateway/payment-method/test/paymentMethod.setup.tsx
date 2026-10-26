import { http, HttpResponse } from 'msw'
import { PERMISSION } from '@/app/permissions'
import type { PaymentMethod } from '@/app/services/merchantGatewayApi'
import type {
  PaymentMethodListRow,
  ScopedPaymentMethodConfig
} from '@/app/services/merchantPaymentMethodApi'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import PaymentMethodPage from '../pages/PaymentMethodPage'

export const MANAGER = [
  PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW,
  PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE
]

export const ALL_METHODS: PaymentMethod[] = [
  'QR',
  'DOMESTIC_CARD',
  'INTERNATIONAL_CARD',
  'LINKED_WALLET',
  'VIRTUAL_ACCOUNT'
]

export const masterRow: PaymentMethodListRow = {
  merchantId: 'merchant-1',
  merchantCode: 'M001',
  merchantName: 'Merchant A',
  subMerchantId: null,
  appliedLevel: 'MASTER',
  enabledMethods: ['QR'],
  configured: true,
  isDefault: false,
  active: true
}

export const subRow: PaymentMethodListRow = {
  ...masterRow,
  subMerchantId: 'sub-1',
  subMerchantCode: 'S001',
  subMerchantName: 'Chi nhánh Cầu Giấy',
  appliedLevel: 'SUB'
}

type ConfigOverrides = Partial<
  Omit<ScopedPaymentMethodConfig, 'enabledMethods'>
> & {
  methods?: PaymentMethod[]
  source?: 'SYSTEM_DEFAULT' | 'MASTER' | 'SUB'
}

/** Cấu hình theo đúng dạng GET/PATCH mới (có `version`, `capabilities`). */
export const scopedConfig = ({
  methods = ['QR'],
  source = 'MASTER',
  level = 'MASTER',
  ...rest
}: ConfigOverrides = {}): ScopedPaymentMethodConfig => ({
  merchantId: level === 'SUB' ? 'sub-1' : 'merchant-1',
  level,
  enabledMethods: {
    value: methods,
    source,
    inherited: source !== level,
    suspended: false
  },
  methodLimits: { value: [], inherited: true },
  configured: true,
  active: true,
  masterMerchantId: 'merchant-1',
  subMerchantId: level === 'SUB' ? 'sub-1' : null,
  version: 3,
  capabilities: ALL_METHODS.map((method) => ({
    method,
    supported: true,
    eligible: method !== 'INTERNATIONAL_CARD',
    reasonCode:
      method === 'INTERNATIONAL_CARD'
        ? 'INTERNATIONAL_CARD_CONTRACT_REQUIRED'
        : null,
    reason:
      method === 'INTERNATIONAL_CARD'
        ? 'ĐVCNTT chưa có hợp đồng thẻ quốc tế'
        : null
  })),
  ...rest
})

export const mockList = (rows: PaymentMethodListRow[] = [masterRow]) =>
  server.use(
    http.get('*/merchants/payment-methods', () =>
      HttpResponse.json({
        data: { content: rows, totalElements: rows.length, number: 0, size: 20 }
      })
    )
  )

export const mockConfig = (path: string, config: ScopedPaymentMethodConfig) =>
  server.use(
    http.get(`*/merchants/${path}`, () => HttpResponse.json({ data: config }))
  )

export const SUB_PATH = 'merchant-1/sub-merchants/sub-1/payment-methods'
export const MASTER_PATH = 'merchant-1/payment-methods'

export const renderPage = (permissions: string[] = MANAGER) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<PaymentMethodPage />, { store })
}
