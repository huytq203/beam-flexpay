import { FeeDomain } from '@components/fee/feeDomain'
import { renderWithProviders } from '@/test/render'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { ComponentProps } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { FEE_BUSINESS_CATEGORY } from '../constants/feeConfigFields'
import { CalculationMethod } from '../schemas/feeConfig.schema'
import { DUPLICATE_FEE_COMPONENT_MESSAGE } from '../schemas/feeConfig.schema'
import { FeeComponentDialog } from '../components/FeeComponentDialog'

const existingComponent = {
  key: 'existing-component',
  feeScope: 'OUTPUT_FEE' as const,
  componentType: 'TRANSACTION_FEE',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType: 'MERCHANT',
  beneficiaryType: 'SYSTEM',
  fixedAmount: 1000,
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
        feeScope='OUTPUT_FEE'
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
      expect(screen.getAllByText(DUPLICATE_FEE_COMPONENT_MESSAGE)).toHaveLength(
        3
      )
    )

    // Người chịu chỉ có đúng payer thực thi, nên chỉ còn đổi loại phí để thoát trùng.
    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByTitle('VAT'))

    await waitFor(() =>
      expect(
        screen.queryAllByText(DUPLICATE_FEE_COMPONENT_MESSAGE)
      ).toHaveLength(0)
    )
  })
})

describe('FeeComponentDialog phí đầu vào (đầu vào)', () => {
  const renderBankDialog = (
    initialValue: ComponentProps<
      typeof FeeComponentDialog
    >['initialValue'] = null,
    onSave = vi.fn()
  ) => {
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={initialValue}
        precedingComponents={[]}
        existingComponents={[]}
        feeDomain={FeeDomain.BANK}
        feeScope='INPUT_COST'
        businessCategory={FEE_BUSINESS_CATEGORY.BANK_PROVIDER}
        serviceType='EWALLET_DEPOSIT'
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )
    return onSave
  }

  it('phí đầu vào mặc định Hệ thống chịu và Ngân hàng hưởng', async () => {
    renderBankDialog()

    expect(
      screen.getByLabelText(/Người chịu/).closest('.ant-select')
    ).toHaveTextContent('Hệ thống/platform')
    expect(
      screen.getByLabelText(/Người hưởng/).closest('.ant-select')
    ).toHaveTextContent('Ngân hàng')
    expect(screen.getByLabelText(/Người chịu/)).toBeDisabled()
    expect(screen.queryByText('Người dùng')).not.toBeInTheDocument()
    expect(screen.queryByText('Merchant')).not.toBeInTheDocument()
    expect(screen.queryByText('Người gửi')).not.toBeInTheDocument()
  })

  it('chuẩn hoá người chịu không còn hợp lệ của chi phí cũ về SYSTEM', () => {
    // SENDER từng là lựa chọn cho miền Bank nhưng backend chưa từng duyệt —
    // component cũ mang giá trị này về chi phí SYSTEM của miền Bank.
    renderBankDialog({
      ...existingComponent,
      payerType: 'SENDER'
    })

    expect(screen.getByText('Hệ thống/platform')).toBeInTheDocument()
    expect(screen.queryByText('Người gửi')).not.toBeInTheDocument()
  })

  it('phí đầu vào mặc định Ngân hàng và cho phép chọn người hưởng khác', () => {
    renderBankDialog()

    expect(screen.getByText('Ngân hàng')).toBeInTheDocument()
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Người hưởng/)).not.toBeDisabled()
  })

  it('chuẩn hoá người hưởng của chi phí Bank cũ thành BANK khi lưu', async () => {
    const onSave = renderBankDialog(existingComponent)

    await userEvent.click(
      screen.getByRole('button', { name: 'Lưu thành phần' })
    )

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]?.[0]?.[0]).toEqual(
      expect.objectContaining({ payerType: 'SYSTEM', beneficiaryType: 'BANK' })
    )
  })

  it('cho cấu hình chi phí SYSTEM → PARTNER riêng với phí đầu ra', async () => {
    const onSave = renderBankDialog()
    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(
      await screen.findByText('Phí nhà cung cấp đối tác/bank')
    )
    expect(screen.getByText(/Mức chi phí dự kiến/)).toBeInTheDocument()
    await userEvent.click(screen.getByLabelText(/Người hưởng/))
    await userEvent.click(await screen.findByText('Đối tác'))
    await userEvent.type(screen.getByLabelText(/Chi phí cố định/), '1000')
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]?.[0]?.[0]).toEqual(
      expect.objectContaining({
        payerType: 'SYSTEM',
        beneficiaryType: 'PARTNER'
      })
    )
  })
})

describe('FeeComponentDialog phí đầu ra (đầu ra)', () => {
  const renderWalletDialog = (onSave = vi.fn()) => {
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={null}
        precedingComponents={[]}
        existingComponents={[]}
        feeDomain={FeeDomain.EWALLET}
        feeScope='OUTPUT_FEE'
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType='EWALLET_DEPOSIT'
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )
    return onSave
  }

  it('nạp tiền: phí đầu ra cố định người gửi (bank chuyển) chịu', () => {
    renderWalletDialog()

    expect(
      screen.getByLabelText(/Người chịu/).closest('.ant-select')
    ).toHaveTextContent('Người gửi')
    expect(screen.getByLabelText(/Người chịu/)).toBeDisabled()
    expect(screen.queryByText('Người dùng')).not.toBeInTheDocument()
    expect(screen.queryByText('Người nhận')).not.toBeInTheDocument()
    expect(screen.queryByText('Hệ thống/platform')).not.toBeInTheDocument()
  })

  it('chỉ cho chọn VAT sau khi đã tạo phí gốc trong cùng phần', async () => {
    renderWalletDialog()

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    expect(screen.queryByTitle('VAT')).not.toBeInTheDocument()
  })

  it('miền Ví lưu mặc định người gửi (USER) chịu và Hệ thống hưởng', async () => {
    const onSave = renderWalletDialog()

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByText('Phí giao dịch cơ bản'))
    await userEvent.type(screen.getByLabelText(/Phí cố định/), '1000')
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]?.[0]?.[0]).toEqual(
      expect.objectContaining({
        payerType: 'USER',
        beneficiaryType: 'SYSTEM'
      })
    )
  })

  it('miền Ví cố định người hưởng là Hệ thống, không có lựa chọn Ngân hàng', async () => {
    renderWalletDialog()

    const beneficiary = screen.getByLabelText(/Người hưởng/)
    expect(beneficiary.closest('.ant-select')).toHaveTextContent('Hệ thống')
    expect(beneficiary).toBeDisabled()
    expect(screen.queryByText('Ngân hàng')).not.toBeInTheDocument()
  })
})
