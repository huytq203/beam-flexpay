import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeeComponentDialog } from '../components/FeeComponentDialog'
import {
  getBearerSideTitles,
  getOutputPayerOptions,
  getPayerLabel,
  getPayerTypeOptions,
  MERCHANT_CUSTOMER_PAYER
} from '../constants/feeComponentParties'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  feeConfigFormSchema,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { toSetupRequest } from '../utils/feeConfigPayload'
import {
  buildPayerSelectOptions,
  dependentPayerFor
} from '../utils/payerSelectOptions'
import { baseForm } from './feeConfigPayload.fixtures'
import walletBaseline from './merchantPayerOptions.walletBaseline.json'

const MERCHANT_SERVICES = [
  'MERCHANT_VA_BILL_COLLECTION',
  'MERCHANT_DISBURSEMENT',
  'PAYOUT_BANK_TRANSFER'
] as const

const COLLECTION_OPTIONS = [
  { value: 'MERCHANT', label: 'Merchant' },
  {
    value: 'MERCHANT_CUSTOMER',
    label: 'Người nộp tiền · Sắp hỗ trợ',
    disabled: true
  }
]

const MERCHANT_OPTIONS = [
  { value: 'MERCHANT', label: 'Merchant' },
  {
    value: 'MERCHANT_CUSTOMER',
    label: 'Người nhận tiền · Sắp hỗ trợ',
    disabled: true
  },
  { value: 'BOTH', label: 'Cả hai bên cùng chịu · Sắp hỗ trợ', disabled: true }
]

const COUNTERPARTY = {
  MERCHANT_VA_BILL_COLLECTION: 'Người nộp tiền',
  MERCHANT_DISBURSEMENT: 'Người nhận tiền',
  PAYOUT_BANK_TRANSFER: 'Người nhận tiền'
} as const

const component = (
  overrides: Partial<FeeComponentFormValues> = {}
): FeeComponentFormValues => ({
  key: 'c1',
  feeScope: 'OUTPUT_FEE',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'MERCHANT',
  beneficiaryType: 'SYSTEM',
  fixedAmount: 1000,
  percentage: 0,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const merchantForm = (payerType: string) =>
  baseForm({
    feeDomain: 'MERCHANT',
    serviceType: 'MERCHANT_VA_BILL_COLLECTION',
    paymentMethod: 'VA',
    components: [component({ payerType })]
  })

describe('người chịu phí của thu hộ / chi hộ', () => {
  it('thu hộ: Merchant chọn được, Người nộp tiền bị khóa, không có Cả hai bên', () => {
    expect(getOutputPayerOptions('MERCHANT_VA_BILL_COLLECTION')).toEqual(
      COLLECTION_OPTIONS
    )
    expect(MERCHANT_CUSTOMER_PAYER).toBe('MERCHANT_CUSTOMER')
  })

  it('chi hộ: Merchant chọn được, Người nhận tiền và Cả hai bên bị khóa', () => {
    expect(getOutputPayerOptions('MERCHANT_DISBURSEMENT')).toEqual(
      MERCHANT_OPTIONS
    )
  })

  it('rút tiền: chỉ Merchant chịu phí', () => {
    expect(getOutputPayerOptions('PAYOUT_BANK_TRANSFER')).toEqual([
      { value: 'MERCHANT', label: 'Merchant' }
    ])
  })

  it('tiêu đề hai khối khi cả hai bên chịu chi hộ là Merchant / Người nhận tiền', () => {
    expect(getBearerSideTitles('MERCHANT_DISBURSEMENT')).toEqual({
      sender: 'Merchant chịu',
      receiver: 'Người nhận tiền chịu'
    })
  })

  it.each(MERCHANT_SERVICES)(
    '%s: nhãn payer là Merchant / bên đối diện, dữ liệu cũ hiện đúng nhãn',
    (serviceType) => {
      const counterparty = COUNTERPARTY[serviceType]
      expect(getPayerLabel('MERCHANT', serviceType)).toBe('Merchant')
      expect(getPayerLabel('USER', serviceType)).toBe(counterparty)
      expect(getPayerLabel('SENDER', serviceType)).toBe(counterparty)
      expect(getPayerLabel('RECEIVER', serviceType)).toBe(counterparty)
      expect(getPayerTypeOptions(serviceType)[0]).toEqual({
        value: 'MERCHANT',
        label: 'Merchant'
      })
    }
  )

  it('luồng ví giữ nguyên lựa chọn, nhãn và tiêu đề so với trước khi sửa', () => {
    const services = [
      'EWALLET_DEPOSIT',
      'EWALLET_WITHDRAWAL',
      'EWALLET_TRANSFER_INTERNAL',
      'EWALLET_REFUND',
      'undefined',
      'null'
    ]
    const lookup: Record<string, string | null | undefined> = {
      undefined: undefined,
      null: null
    }
    const after = Object.fromEntries(
      services.map((key) => {
        const service = key in lookup ? lookup[key] : key
        return [
          key,
          {
            o: getOutputPayerOptions(service),
            t: getBearerSideTitles(service),
            p: getPayerTypeOptions(service),
            l: ['USER', 'SENDER', 'RECEIVER', 'MERCHANT', 'SYSTEM'].map(
              (payer) => getPayerLabel(payer, service)
            )
          }
        ]
      })
    )
    expect(after).toEqual(walletBaseline)
  })

  it('hộp chọn người chịu của merchant không thêm "Cả hai bên cùng chịu" thường', () => {
    const options = buildPayerSelectOptions(MERCHANT_OPTIONS, false, null)
    expect(options.filter(({ value }) => value === 'BOTH')).toHaveLength(1)
    expect(options.find(({ value }) => value === 'BOTH')?.disabled).toBe(true)
  })

  it('VAT của thu hộ khóa theo Merchant', () => {
    const base = component({ componentType: 'TRANSACTION_FEE' })
    expect(dependentPayerFor('TRANSACTION_FEE', [base])).toBe('MERCHANT')
    expect(
      buildPayerSelectOptions(MERCHANT_OPTIONS, false, 'MERCHANT')
    ).toEqual([MERCHANT_OPTIONS[0]])
  })
})

describe('schema chặn payer khác Merchant của thu hộ / chi hộ', () => {
  const issuePaths = (form: unknown) => {
    const result = feeConfigFormSchema.safeParse(form)
    return result.success
      ? []
      : result.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message
        }))
  }

  it('thành phần RECEIVER của thu hộ báo lỗi ở payerType của chính nó', () => {
    expect(issuePaths(merchantForm('RECEIVER'))).toContainEqual({
      path: 'components.0.payerType',
      message: 'Thu hộ / chi hộ hiện chỉ hỗ trợ Merchant chịu phí'
    })
  })

  it('thu hộ cũ mang RECEIVER còn có lỗi gốc ở components để màn hiển thị', () => {
    expect(issuePaths(merchantForm('RECEIVER'))).toContainEqual({
      path: 'components',
      message: 'Thu hộ / chi hộ hiện chỉ hỗ trợ Merchant chịu phí'
    })
  })

  it('Merchant hợp lệ, không có lỗi payerType', () => {
    expect(
      issuePaths(merchantForm('MERCHANT')).filter(({ path }) =>
        path.endsWith('payerType')
      )
    ).toEqual([])
  })

  it('luồng ví không bị luật này chặn', () => {
    expect(
      issuePaths(baseForm()).filter(({ path }) => path.endsWith('payerType'))
    ).toEqual([])
  })
})

describe('payload không âm thầm đổi payer của thu hộ / chi hộ', () => {
  it('RECEIVER của luồng merchant được giữ nguyên để schema chặn từ trước', () => {
    const request = toSetupRequest(merchantForm('RECEIVER'))
    expect(request.components[0].payerType).toBe('RECEIVER')
  })

  it('MERCHANT vẫn gửi MERCHANT', () => {
    expect(toSetupRequest(merchantForm('MERCHANT')).components[0].payerType).toBe(
      'MERCHANT'
    )
  })
})

describe('FeeComponentDialog của thu hộ', () => {
  const renderDialog = (serviceType = 'MERCHANT_VA_BILL_COLLECTION') =>
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={null}
        precedingComponents={[]}
        existingComponents={[]}
        feeScope='OUTPUT_FEE'
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType={serviceType}
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

  it('Người nộp tiền · Sắp hỗ trợ bị khóa, bấm vào vẫn giữ Merchant', async () => {
    renderDialog()

    await userEvent.click(screen.getByLabelText(/Người chịu/))
    const locked = await screen.findAllByText('Người nộp tiền · Sắp hỗ trợ')
    // antd bản này đánh dấu option khóa bằng class `ant-select-item-option-disabled` (không có
    // aria-disabled trên dòng hiển thị); list ảo trong jsdom cũng chỉ dựng hai dòng đầu.
    const option = locked
      .map((node) => node.closest('.ant-select-item-option'))
      .find((node) => node !== null)
    expect(option).toHaveClass('ant-select-item-option-disabled')

    await userEvent.click(locked[0])

    await waitFor(() =>
      expect(
        document.querySelector('#payerType')
          ?.closest('.ant-select')
          ?.querySelector('.ant-select-selection-item')
      ).toHaveTextContent(/^Merchant$/)
    )
  })

  it('chi hộ không hiện "Người chuyển" hay "Người nhận" của ví trong dialog', async () => {
    renderDialog('MERCHANT_DISBURSEMENT')

    await userEvent.click(screen.getByLabelText(/Người chịu/))
    await screen.findAllByText('Người nhận tiền · Sắp hỗ trợ')

    expect(document.body.textContent).not.toContain('Người chuyển')
    expect(document.body.textContent).not.toMatch(/Người nhận(?! tiền)/)
  })
})
