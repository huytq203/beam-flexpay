import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeeComponentDialog } from '../components/FeeComponentDialog'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import { CalculationMethod } from '../schemas/feeConfig.schema'
import { TIER_LAST_MUST_BE_EMPTY_MESSAGE } from '../schemas/feeTierRange'

const tieredComponent = {
  key: 'tiered-component',
  feeScope: 'OUTPUT_FEE' as const,
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.FLAT_TIER,
  payerType: 'USER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: [
    {
      maxValue: null,
      fixedAmount: 1000,
      percentage: null,
      minFee: null,
      maxFee: null
    }
  ]
}

const maxValueInputs = () => screen.getAllByPlaceholderText('Trống = vô cùng')

describe('FeeComponentDialog — kiểm bậc cuối khi lưu', () => {
  it('nhập Đến rồi thêm bậc không làm hàng nào báo lỗi; chỉ báo ở bậc cuối khi bấm lưu', async () => {
    const onSave = vi.fn()
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={tieredComponent}
        precedingComponents={[]}
        existingComponents={[tieredComponent]}
        feeScope='OUTPUT_FEE'
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType='EWALLET_DEPOSIT'
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )

    await userEvent.type(maxValueInputs()[0], '100000')
    await userEvent.tab()
    await userEvent.click(screen.getByRole('button', { name: /Thêm bậc phí/ }))
    await userEvent.type(maxValueInputs()[1], '200000')
    await userEvent.tab()

    expect(
      screen.queryByText(TIER_LAST_MUST_BE_EMPTY_MESSAGE)
    ).not.toBeInTheDocument()

    await userEvent.click(
      screen.getByRole('button', { name: 'Lưu thành phần' })
    )

    await waitFor(() =>
      expect(screen.getAllByText(TIER_LAST_MUST_BE_EMPTY_MESSAGE)).toHaveLength(
        1
      )
    )
    expect(maxValueInputs()[0]).not.toHaveAttribute('aria-invalid')
    expect(maxValueInputs()[1]).toHaveAttribute('aria-invalid', 'true')
    expect(onSave).not.toHaveBeenCalled()

    // Thêm bậc mới sau khi báo lỗi: bậc cũ thôi là bậc cuối nên lỗi phải tự hết.
    await userEvent.click(screen.getByRole('button', { name: /Thêm bậc phí/ }))
    await waitFor(() =>
      expect(
        screen.queryByText(TIER_LAST_MUST_BE_EMPTY_MESSAGE)
      ).not.toBeInTheDocument()
    )
    expect(maxValueInputs()[1]).not.toHaveAttribute('aria-invalid')
  })
})
