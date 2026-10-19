import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type { FeeComponentFormValues } from '@pages/fee-management/fee-config/schemas/feeConfig.schema'
import { FeeComponentList } from '../components/FeeComponentList'

const base: FeeComponentFormValues = {
  key: 'refund',
  feeScope: 'OUTPUT_FEE',
  componentType: 'REFUND_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: 'DIRECT',
  payerType: 'SENDER',
  beneficiaryType: 'SYSTEM',
  fixedAmount: null,
  percentage: 1,
  minFee: null,
  maxFee: null,
  roundMode: 'HALF_UP',
  tiers: []
}
const vat: FeeComponentFormValues = {
  ...base,
  key: 'vat',
  componentType: 'VAT',
  baseOn: 'FEE_COMPONENT',
  baseComponentType: 'REFUND_FEE',
  percentage: 2
}

const renderList = () =>
  render(
    <FeeComponentList
      components={[vat, base]}
      feeScope='OUTPUT_FEE'
      policyId='p1'
    />
  )

describe('FeeComponentList — cơ sở tính', () => {
  it('thẻ VAT đọc như phép tính: VAT = 2% × Phí hoàn tiền, có liên kết tới mục 2', () => {
    renderList()
    const card = screen.getByRole('article', { name: /1\. VAT/ })
    const formula = within(card).getByRole('group', { name: 'Cách tính VAT' })
    expect(formula).toHaveTextContent('VAT=2%×2Phí hoàn tiền')
    const link = within(formula).getByRole('link', {
      name: 'Tới thành phần 2: Phí hoàn tiền'
    })
    expect(link).toHaveAttribute('href', '#fee-p1-OUTPUT_FEE-2')
    expect(card).toHaveTextContent(
      'Tính trên số tiền của Phí hoàn tiền, không tính trên số tiền giao dịch.'
    )
  })

  it('thẻ Phí hoàn tiền tính trên số tiền giao dịch và báo là cơ sở của VAT', () => {
    renderList()
    const card = screen.getByRole('article', { name: /2\. Phí hoàn tiền/ })
    expect(card).toHaveAttribute('id', 'fee-p1-OUTPUT_FEE-2')
    expect(
      within(card).getByRole('group', { name: 'Cách tính Phí hoàn tiền' })
    ).toHaveTextContent('Phí hoàn tiền=1%×Số tiền giao dịch')
    expect(card).toHaveTextContent('Là cơ sở tính của')
    expect(
      within(card).getByRole('link', { name: 'Tới thành phần 1: VAT' })
    ).toBeInTheDocument()
  })

  it('không lặp ô "Tính trên" cũ trong thẻ', () => {
    renderList()
    expect(screen.queryByText('Tính trên')).toBeNull()
  })
})
