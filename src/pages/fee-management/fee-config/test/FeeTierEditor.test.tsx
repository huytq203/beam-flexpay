import { renderWithProviders } from '@/test/render'
import { zodResolver } from '@hookform/resolvers/zod'
import { screen, waitFor, within } from '@testing-library/react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { describe, expect, it } from 'vitest'
import { FeeTierEditor } from '../components/FeeTierEditor'
import {
  CalculationMethod,
  TIER_RATE_MISSING_MESSAGE,
  feeComponentFormSchema,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'

const tier = (overrides = {}) => ({
  maxValue: null,
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  ...overrides
})

const Harness = ({ tiers }: { tiers: ReturnType<typeof tier>[] }) => {
  const { control, trigger } = useForm<FeeComponentFormValues>({
    resolver: zodResolver(feeComponentFormSchema),
    defaultValues: {
      key: 'c',
      feeScope: 'OUTPUT_FEE',
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
      tiers
    }
  })
  useEffect(() => {
    void trigger()
  }, [trigger])
  return <FeeTierEditor control={control} />
}

describe('FeeTierEditor — lỗi của bậc phí', () => {
  it('đưa lỗi của hàng ra một dòng riêng, không in vào ô nhập', async () => {
    renderWithProviders(<Harness tiers={[tier()]} />)

    const alert = await screen.findByRole('alert')
    expect(alert).toHaveTextContent(TIER_RATE_MISSING_MESSAGE)

    // Lỗi nằm ở dòng trải hết bề ngang, ngoài các ô nhập, nên hàng không bị kéo cao.
    const errorCell = alert.closest('td')
    expect(errorCell).toHaveAttribute('colspan', '7')
    const dataRow = screen.getAllByRole('row')[1]
    expect(within(dataRow).queryByRole('alert')).not.toBeInTheDocument()
    expect(within(dataRow).getAllByRole('cell')).toHaveLength(7)
  })

  it('đánh dấu cả Phí % lẫn Phí cố định khi thiếu mức phí', async () => {
    renderWithProviders(<Harness tiers={[tier()]} />)
    await screen.findByRole('alert')

    const dataRow = screen.getAllByRole('row')[1]
    const inputs = within(dataRow).getAllByRole('spinbutton')
    const [maxValue, percentage, fixedAmount, minFee] = inputs

    expect(percentage).toHaveAttribute('aria-invalid', 'true')
    expect(fixedAmount).toHaveAttribute('aria-invalid', 'true')
    expect(maxValue).not.toHaveAttribute('aria-invalid', 'true')
    expect(minFee).not.toHaveAttribute('aria-invalid', 'true')
  })

  it('ẩn câu gợi ý trên bảng khi hàng đã báo đúng lỗi đó', async () => {
    renderWithProviders(<Harness tiers={[tier()]} />)
    await screen.findByRole('alert')

    expect(
      screen.queryByText(/Bậc không thu phí: nhập 0/)
    ).not.toBeInTheDocument()
  })

  it('không có dòng lỗi khi bậc hợp lệ và vẫn hiện câu gợi ý', async () => {
    renderWithProviders(<Harness tiers={[tier({ percentage: 0 })]} />)

    await waitFor(() =>
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    )
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    expect(screen.getByText(/Bậc không thu phí: nhập 0/)).toBeInTheDocument()
  })
})
