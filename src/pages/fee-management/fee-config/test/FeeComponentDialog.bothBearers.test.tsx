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

  it('không ghép ngoài chuyển tiền, phí đầu vào hay phí tính trên phí khác', () => {
    const pair = [component({}), component({ payerType: 'RECEIVER' })]
    expect(findBearerPartner('EWALLET_DEPOSIT', pair, 0)).toBeNull()

    const vat = [
      component({ componentType: 'VAT', baseOn: 'FEE_COMPONENT' }),
      component({
        componentType: 'VAT',
        baseOn: 'FEE_COMPONENT',
        payerType: 'RECEIVER'
      })
    ]
    expect(findBearerPartner(TRANSFER, vat, 0)).toBeNull()
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
    expect(fixed[0]).toHaveValue('1,000')
    expect(fixed[1]).toHaveValue('2,000')
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
