import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import type {
  TransactionFeeDetail,
  UnifiedContentJournal
} from '@type/apiResponseJournal'
import FeeNCC from '../components/FeeNCC'

const withdrawal = {
  transactionType: 'CASH_OUT',
  bankCode: 'VCB',
  providerCode: 'NAPAS',
  currency: 'VND'
} as UnifiedContentJournal

const fee = (over: Partial<TransactionFeeDetail> = {}): TransactionFeeDetail => ({
  feeCalculationId: 'f1',
  policyName: null,
  totalFee: 486,
  formula: 'Phí 0,5% + 200 đ + VAT 8%',
  sides: [],
  components: [],
  totalInputCost: null,
  inputCosts: [],
  ...over
})

describe('FeeNCC', () => {
  it('phí NCC từ fee service: từng khoản và tổng phải trả', () => {
    render(
      <FeeNCC
        data={withdrawal}
        fee={fee({
          totalInputCost: 1000,
          inputCosts: [
            {
              componentType: 'BANK_FEE',
              label: 'Phí NCC',
              payerType: 'SYSTEM',
              percentage: null,
              fixedAmount: 1000,
              baseValue: 50000,
              amount: 1000,
              formula: 'Phí 1.000 đ'
            }
          ]
        })}
      />
    )

    expect(screen.getByText('NAPAS')).toBeInTheDocument()
    expect(screen.getByText('Phí NCC')).toBeInTheDocument()
    expect(screen.getByText('Phí 1.000 đ')).toBeInTheDocument()
    expect(screen.getAllByText('1.000 VND')).toHaveLength(2)
  })

  it('fee service không trả phí đầu vào thì để trống, không ghi 0', () => {
    render(<FeeNCC data={withdrawal} fee={fee()} />)

    expect(screen.getByText('--')).toBeInTheDocument()
  })

  it('không có providerCode thì để trống nhà cung cấp, không lấy bankCode', () => {
    render(<FeeNCC data={{ ...withdrawal, providerCode: null }} fee={fee()} />)

    expect(screen.queryByText('VCB')).not.toBeInTheDocument()
    expect(screen.queryByText('NAPAS')).not.toBeInTheDocument()
    expect(screen.queryByText('Ngân hàng:')).not.toBeInTheDocument()
  })

  it('NCC và ngân hàng theo báo giá: hiện tên kèm mã, chưa có tên thì chỉ hiện mã', () => {
    render(
      <FeeNCC
        data={{ ...withdrawal, providerCode: null }}
        fee={fee({
          providerCode: 'NAPAS',
          providerName: 'Công ty Cổ phần Thanh toán Quốc gia Việt Nam',
          bankCode: 'VCB',
          bankName: null
        })}
      />
    )

    expect(
      screen.getByText('Công ty Cổ phần Thanh toán Quốc gia Việt Nam (NAPAS)')
    ).toBeInTheDocument()
    expect(screen.getByText('Ngân hàng:')).toBeInTheDocument()
    expect(screen.getByText('VCB')).toBeInTheDocument()
  })

  it('không có khối fee thì dùng profit cũ', () => {
    render(
      <FeeNCC
        data={withdrawal}
        profit={{
          userFeeTotal: 0,
          userFeeBreakdown: [],
          feeBreakdownAvailable: false,
          feePolicyName: null,
          feePolicyValidFrom: null,
          providerCost: 250,
          providerCostAvailable: true,
          grossProfit: 0,
          grossProfitLabel: ''
        }}
      />
    )

    expect(screen.getByText('250 VND')).toBeInTheDocument()
  })

  it('có inputCostPolicyName thì hiện chính sách phí đầu vào đã khớp', () => {
    render(
      <FeeNCC
        data={withdrawal}
        fee={fee({
          inputCostPolicyId: 'p1',
          inputCostPolicyName: 'Phí NAPAS nạp ví'
        })}
      />
    )

    expect(screen.getByText('Chính sách phí đầu vào:')).toBeInTheDocument()
    expect(screen.getByText('Phí NAPAS nạp ví')).toBeInTheDocument()
  })

  it('không có inputCostPolicyName thì không hiện dòng chính sách', () => {
    render(<FeeNCC data={withdrawal} fee={fee()} />)

    expect(
      screen.queryByText('Chính sách phí đầu vào:')
    ).not.toBeInTheDocument()
  })
})
