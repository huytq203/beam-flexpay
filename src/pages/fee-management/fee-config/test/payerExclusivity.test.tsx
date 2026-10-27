import { renderWithProviders } from '@/test/render'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeeComponentDialog } from '../components/FeeComponentDialog'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import {
  ONE_SIDE_BEARER_MESSAGE,
  validateTransferBearers
} from '../utils/transferBearers'
import {
  BOTH_BEARERS_OPTION,
  restrictPayerOptions
} from '../utils/payerSelectOptions'

const component = (
  overrides: Partial<FeeComponentFormValues>
): FeeComponentFormValues => ({
  key: crypto.randomUUID(),
  feeScope: 'OUTPUT_FEE',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: 1000,
  percentage: 0,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: [],
  ...overrides
})

const SENDER = { value: 'USER', label: 'Người chuyển' }
const RECEIVER = { value: 'RECEIVER', label: 'Người nhận' }
const ALL = [SENDER, RECEIVER, BOTH_BEARERS_OPTION]

describe('restrictPayerOptions: đã có một bên thì không cấu hình bên còn lại', () => {
  it.each([
    'EWALLET_DEPOSIT',
    'EWALLET_WITHDRAWAL',
    'EWALLET_TRANSFER_INTERNAL'
  ])('%s: đã có phí người chuyển thì chỉ còn người chuyển', (serviceType) => {
    expect(
      restrictPayerOptions(serviceType, ALL, [component({})])
    ).toEqual([SENDER])
  })

  it('đã có phí người nhận thì chỉ còn người nhận', () => {
    expect(
      restrictPayerOptions('EWALLET_DEPOSIT', [SENDER, RECEIVER], [
        component({ payerType: 'RECEIVER' })
      ])
    ).toEqual([RECEIVER])
  })

  it('chưa có phí nào thì chọn đủ', () => {
    expect(restrictPayerOptions('EWALLET_TRANSFER_INTERNAL', ALL, [])).toEqual(
      ALL
    )
  })

  it('đã có cả hai bên (cặp) thì phí mới chỉ được thêm theo cặp', () => {
    const pair = [component({}), component({ payerType: 'RECEIVER' })]
    expect(
      restrictPayerOptions('EWALLET_TRANSFER_INTERNAL', ALL, pair)
    ).toEqual([BOTH_BEARERS_OPTION])
  })

  it('phí phụ thuộc (VAT) và phí đầu vào không tính là một bên', () => {
    const vat = component({
      componentType: 'VAT',
      baseOn: 'FEE_COMPONENT',
      baseComponentType: 'TRANSACTION_FEE',
      payerType: 'RECEIVER'
    })
    const input = component({ feeScope: 'INPUT_COST', payerType: 'SYSTEM' })
    expect(
      restrictPayerOptions('EWALLET_TRANSFER_INTERNAL', ALL, [vat, input])
    ).toEqual(ALL)
  })

  it('dịch vụ khác (hoàn tiền, merchant) không bị hạn chế', () => {
    expect(
      restrictPayerOptions('EWALLET_REFUND', [SENDER, RECEIVER], [
        component({})
      ])
    ).toEqual([SENDER, RECEIVER])
  })
})

describe('FeeComponentDialog: ô Người chịu theo thành phần đã có', () => {
  it('nạp tiền đã có phí người chuyển: thêm phí mới không còn chọn được người nhận', async () => {
    const existing = [component({})]
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={null}
        precedingComponents={existing}
        existingComponents={existing}
        feeScope='OUTPUT_FEE'
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType='EWALLET_DEPOSIT'
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    await userEvent.click(screen.getByLabelText(/Người chịu/))

    expect(screen.queryByTitle('Người nhận')).not.toBeInTheDocument()
  })

  it('nạp tiền đã có phí người nhận: ô Người chịu tự về người nhận', async () => {
    const existing = [component({ payerType: 'RECEIVER' })]
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={null}
        precedingComponents={existing}
        existingComponents={existing}
        feeScope='OUTPUT_FEE'
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType='EWALLET_DEPOSIT'
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    expect(
      screen.getByLabelText(/Người chịu/).closest('.ant-select')
    ).toHaveTextContent('Người nhận')
  })
})

describe('validateTransferBearers: nạp, rút chỉ một bên chịu phí', () => {
  const mixed = [component({}), component({ payerType: 'RECEIVER' })]

  it.each(['EWALLET_DEPOSIT', 'EWALLET_WITHDRAWAL'])(
    '%s: có cả người chuyển và người nhận (ví dụ đổi từ chuyển tiền sang) bị chặn lúc lưu',
    (serviceType) => {
      expect(validateTransferBearers(serviceType, mixed)).toBe(
        ONE_SIDE_BEARER_MESSAGE
      )
    }
  )

  it.each(['EWALLET_DEPOSIT', 'EWALLET_WITHDRAWAL'])(
    '%s: một bên thì hợp lệ',
    (serviceType) => {
      expect(validateTransferBearers(serviceType, [component({})])).toBeNull()
      expect(
        validateTransferBearers(serviceType, [
          component({ payerType: 'RECEIVER' })
        ])
      ).toBeNull()
    }
  )

  it('chuyển tiền cả hai bên cùng loại phí (cặp) vẫn hợp lệ', () => {
    expect(validateTransferBearers('EWALLET_TRANSFER_INTERNAL', mixed)).toBeNull()
  })
})
