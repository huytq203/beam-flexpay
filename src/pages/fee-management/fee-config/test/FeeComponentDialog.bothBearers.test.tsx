import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { FeeComponentDialog } from '../components/FeeComponentDialog'
import {
  BOTH_BEARERS_DUPLICATE_MESSAGE,
  findBearerPartner,
  groupBearerPairs
} from '../utils/bearerPairs'

const TRANSFER = 'EWALLET_TRANSFER_INTERNAL'

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

const renderTransferDialog = (
  props: Partial<React.ComponentProps<typeof FeeComponentDialog>> = {}
) => {
  const onSave = vi.fn()
  renderWithProviders(
    <FeeComponentDialog
      open
      initialValue={null}
      precedingComponents={[]}
      existingComponents={[]}
      feeScope='OUTPUT_FEE'
      businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
      serviceType={TRANSFER}
      onSave={onSave}
      onCancel={vi.fn()}
      {...props}
    />
  )
  return onSave
}

describe('ghép cặp người chuyển / người nhận', () => {
  it('ghép hai thành phần cùng loại phí khác bên chịu, người chuyển đứng đầu', () => {
    const list = [
      component({ payerType: 'RECEIVER', fixedAmount: 2000 }),
      component({ componentType: 'PLATFORM_FEE' }),
      component({ payerType: 'USER' })
    ]

    expect(findBearerPartner(TRANSFER, list, 0)).toBe(2)
    expect(findBearerPartner(TRANSFER, list, 1)).toBeNull()
    expect(groupBearerPairs(TRANSFER, list, [0, 1, 2])).toEqual([
      { primary: 2, partner: 0 },
      { primary: 1, partner: null }
    ])
  })

  it('không ghép ở hoàn rút tiền, phí đầu vào hay phí phụ thuộc không phải VAT', () => {
    const pair = [component({}), component({ payerType: 'RECEIVER' })]
    expect(findBearerPartner('EWALLET_REFUND', pair, 0, 'CASH_OUT')).toBeNull()

    const dependent = [
      component({ componentType: 'PLATFORM_FEE', baseOn: 'FEE_COMPONENT' }),
      component({
        componentType: 'PLATFORM_FEE',
        baseOn: 'FEE_COMPONENT',
        payerType: 'RECEIVER'
      })
    ]
    expect(findBearerPartner(TRANSFER, dependent, 0)).toBeNull()
  })

  it('ghép hai dòng VAT mỗi bên một dòng thành một thẻ', () => {
    const vat = [
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        payerType: 'RECEIVER'
      }),
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE'
      })
    ]
    expect(findBearerPartner(TRANSFER, vat, 0)).toBe(1)
    expect(groupBearerPairs(TRANSFER, vat, [0, 1])).toEqual([
      { primary: 1, partner: 0 }
    ])
  })
})

describe('FeeComponentDialog cả hai bên cùng chịu', () => {
  it('lưu thành hai thành phần cùng loại phí, mỗi bên một mức phí', async () => {
    const onSave = renderTransferDialog()

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByText('Phí giao dịch cơ bản'))
    await userEvent.click(screen.getByLabelText(/Người chịu/))
    await userEvent.click(await screen.findByTitle('Cả hai bên cùng chịu'))

    const fixed = screen.getAllByLabelText(/Phí cố định/)
    expect(fixed).toHaveLength(2)
    await userEvent.type(fixed[0], '1000')
    await userEvent.type(fixed[1], '2000')
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const [sender, receiver] = onSave.mock.calls[0][0]
    expect(sender).toEqual(
      expect.objectContaining({
        componentType: 'TRANSACTION_FEE',
        payerType: 'USER',
        beneficiaryType: 'SYSTEM',
        fixedAmount: 1000
      })
    )
    expect(receiver).toEqual(
      expect.objectContaining({
        componentType: 'TRANSACTION_FEE',
        payerType: 'RECEIVER',
        beneficiaryType: 'SYSTEM',
        fixedAmount: 2000
      })
    )
    expect(receiver.key).not.toBe(sender.key)
  })

  it('sửa một cặp mở sẵn chế độ hai bên với mức phí của từng bên', () => {
    const sender = component({ fixedAmount: 1000 })
    const receiver = component({ payerType: 'RECEIVER', fixedAmount: 2000 })
    renderTransferDialog({
      initialValue: sender,
      initialPartner: receiver,
      existingComponents: [sender, receiver]
    })

    expect(
      screen.getByLabelText(/Người chịu/).closest('.ant-select')
    ).toHaveTextContent('Cả hai bên cùng chịu')
    const fixed = screen.getAllByLabelText(/Phí cố định/)
    expect(fixed[0]).toHaveValue('1.000')
    expect(fixed[1]).toHaveValue('2.000')
  })

  it('báo trùng khi bên người nhận đã có thành phần cùng loại phí', async () => {
    const onSave = renderTransferDialog({
      existingComponents: [component({ payerType: 'RECEIVER' })]
    })

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByText('Phí giao dịch cơ bản'))
    await userEvent.click(screen.getByLabelText(/Người chịu/))
    await userEvent.click(await screen.findByTitle('Cả hai bên cùng chịu'))
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    expect(
      await screen.findByText(BOTH_BEARERS_DUPLICATE_MESSAGE)
    ).toBeInTheDocument()
    expect(onSave).not.toHaveBeenCalled()
  })
})

describe('FeeComponentDialog VAT cả hai bên cùng chịu', () => {
  const bases = [
    component({ payerType: 'USER', fixedAmount: 1000 }),
    component({ payerType: 'RECEIVER', fixedAmount: 2000 })
  ]

  it('phí gốc ở cả hai bên: VAT chọn được "Cả hai bên", lưu hai dòng mỗi bên một mức', async () => {
    const onSave = renderTransferDialog({
      precedingComponents: bases,
      existingComponents: bases
    })

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByTitle('VAT'))
    await userEvent.click(screen.getByLabelText(/Người chịu/))
    await userEvent.click(await screen.findByTitle('Cả hai bên cùng chịu'))

    const rates = screen.getAllByLabelText(/Phí linh hoạt/)
    expect(rates).toHaveLength(2)
    await userEvent.type(rates[0], '8')
    await userEvent.type(rates[1], '10')
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const [sender, receiver] = onSave.mock.calls[0][0]
    expect(sender).toEqual(
      expect.objectContaining({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        payerType: 'USER',
        percentage: 8
      })
    )
    expect(receiver).toEqual(
      expect.objectContaining({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        baseComponentType: 'TRANSACTION_FEE',
        payerType: 'RECEIVER',
        percentage: 10
      })
    )
  })

  it('phí gốc chỉ một bên: VAT khoá theo bên đó, không có "Cả hai bên"', async () => {
    const onlyReceiver = [component({ payerType: 'RECEIVER' })]
    renderTransferDialog({
      precedingComponents: onlyReceiver,
      existingComponents: onlyReceiver
    })

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByTitle('VAT'))
    await userEvent.click(screen.getByLabelText(/Người chịu/))

    expect(screen.queryByTitle('Cả hai bên cùng chịu')).not.toBeInTheDocument()
  })
})
