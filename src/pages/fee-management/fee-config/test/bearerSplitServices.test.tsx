import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { supportsBearerSplit } from '@utils/fee-execution'
import { describe, expect, it, vi } from 'vitest'
import { FeeComponentDialog } from '../components/FeeComponentDialog'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import {
  CalculationMethod,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import { findBearerPartner } from '../utils/bearerPairs'

const BOTH_LABEL = 'Cả hai bên cùng chịu'

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

const renderDialog = (
  serviceType: string,
  originalTransactionType?: string
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
      serviceType={serviceType}
      originalTransactionType={originalTransactionType}
      onSave={onSave}
      onCancel={vi.fn()}
    />
  )
  return onSave
}

// Hoàn tiền thu bằng Phí hoàn tiền, không có Phí giao dịch cơ bản.
const openPayerSelect = async (serviceType: string) => {
  await userEvent.click(screen.getByLabelText(/Loại phí/))
  await userEvent.click(
    await screen.findByText(
      serviceType === 'EWALLET_REFUND'
        ? 'Phí hoàn tiền'
        : 'Phí giao dịch cơ bản'
    )
  )
  await userEvent.click(screen.getByLabelText(/Người chịu/))
}

describe('cả hai bên cùng chịu theo loại giao dịch', () => {
  it('bật cho chuyển, nạp, rút và hoàn nạp / hoàn chuyển tiền', () => {
    expect(supportsBearerSplit('EWALLET_TRANSFER_INTERNAL')).toBe(true)
    expect(supportsBearerSplit('EWALLET_DEPOSIT')).toBe(true)
    expect(supportsBearerSplit('EWALLET_WITHDRAWAL')).toBe(true)
    expect(supportsBearerSplit('EWALLET_REFUND', 'CASH_IN')).toBe(true)
    expect(supportsBearerSplit('EWALLET_REFUND', 'P2P_TRANSFER')).toBe(true)
  })

  it('tắt ở hoàn rút tiền, hoàn chưa chọn loại gốc và luồng merchant', () => {
    expect(supportsBearerSplit('EWALLET_REFUND', 'CASH_OUT')).toBe(false)
    expect(supportsBearerSplit('EWALLET_REFUND', '')).toBe(false)
    expect(supportsBearerSplit('EWALLET_REFUND')).toBe(false)
    expect(supportsBearerSplit('PAYOUT_BANK_TRANSFER')).toBe(false)
    expect(supportsBearerSplit(null)).toBe(false)
  })

  it('ghép cặp người chuyển / người nhận ở nạp và hoàn nạp tiền', () => {
    const pair = [component({}), component({ payerType: 'RECEIVER' })]
    expect(findBearerPartner('EWALLET_DEPOSIT', pair, 0)).toBe(1)
    expect(findBearerPartner('EWALLET_REFUND', pair, 0, 'CASH_IN')).toBe(1)
    expect(findBearerPartner('EWALLET_REFUND', pair, 0)).toBeNull()
  })
})

describe('FeeComponentDialog ô Người chịu', () => {
  it.each([
    ['EWALLET_DEPOSIT', undefined],
    ['EWALLET_WITHDRAWAL', undefined],
    ['EWALLET_REFUND', 'CASH_IN'],
    ['EWALLET_REFUND', 'P2P_TRANSFER']
  ])('%s %s có lựa chọn cả hai bên', async (serviceType, originalType) => {
    renderDialog(serviceType, originalType)
    await openPayerSelect(serviceType)
    expect(await screen.findByTitle(BOTH_LABEL)).toBeInTheDocument()
  })

  it('hoàn rút tiền không có lựa chọn cả hai bên', async () => {
    renderDialog('EWALLET_REFUND', 'CASH_OUT')
    await openPayerSelect('EWALLET_REFUND')
    expect(
      await screen.findAllByTitle('Người chuyển gốc (được hoàn tiền)')
    ).not.toHaveLength(0)
    expect(screen.queryByTitle(BOTH_LABEL)).toBeNull()
  })

  it('nạp tiền cả hai bên lưu thành hai thành phần USER + RECEIVER', async () => {
    const onSave = renderDialog('EWALLET_DEPOSIT')
    await openPayerSelect('EWALLET_DEPOSIT')
    await userEvent.click(await screen.findByTitle(BOTH_LABEL))
    const fixed = screen.getAllByLabelText(/Phí cố định/)
    await userEvent.type(fixed[0], '1000')
    await userEvent.type(fixed[1], '2000')
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    const [sender, receiver] = onSave.mock.calls[0][0]
    expect(sender).toEqual(
      expect.objectContaining({ payerType: 'USER', fixedAmount: 1000 })
    )
    expect(receiver).toEqual(
      expect.objectContaining({ payerType: 'RECEIVER', fixedAmount: 2000 })
    )
  })
})
