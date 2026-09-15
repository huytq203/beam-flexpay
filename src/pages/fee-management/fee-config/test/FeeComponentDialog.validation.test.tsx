import { FeeDomain } from '@components/fee/feeDomain'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import { CalculationMethod } from '../schemas/feeConfig.schema'
import { DUPLICATE_FEE_COMPONENT_MESSAGE } from '../schemas/feeConfig.schema'
import { FeeComponentDialog } from '../components/FeeComponentDialog'

const existingComponent = {
  key: 'existing-component',
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'MERCHANT',
  beneficiaryType: 'SYSTEM',
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: []
}

describe('FeeComponentDialog duplicate validation', () => {
  it('xóa lỗi ở cả tổ hợp khi người dùng đổi sang giá trị không trùng', async () => {
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={null}
        precedingComponents={[existingComponent]}
        existingComponents={[existingComponent]}
        feeDomain={FeeDomain.MERCHANT}
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType='MERCHANT_VA_BILL_COLLECTION'
        onSave={vi.fn()}
        onCancel={vi.fn()}
      />
    )

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByText('Phí giao dịch cơ bản'))
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() =>
      expect(
        screen.getAllByText(DUPLICATE_FEE_COMPONENT_MESSAGE)
      ).toHaveLength(3)
    )

    await userEvent.click(screen.getByLabelText(/Người chịu/))
    await userEvent.click(await screen.findByText('Người dùng'))

    await waitFor(() =>
      expect(
        screen.queryAllByText(DUPLICATE_FEE_COMPONENT_MESSAGE)
      ).toHaveLength(0)
    )
  })
})
