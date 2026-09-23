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

describe('FeeComponentDialog payer options', () => {
  const renderBankDialog = (
    initialValue: ComponentProps<typeof FeeComponentDialog>['initialValue'] =
      null,
    onSave = vi.fn()
  ) => {
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={initialValue}
        precedingComponents={[]}
        existingComponents={[]}
        feeDomain={FeeDomain.BANK}
        businessCategory={FEE_BUSINESS_CATEGORY.BANK_PROVIDER}
        serviceType='EWALLET_DEPOSIT'
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )
    return onSave
  }

  it('miền Bank chỉ cho chọn đúng payer thực thi của serviceType', async () => {
    renderBankDialog()

    // EWALLET_DEPOSIT chỉ thực thi được payer=USER (executablePayerFor ở BE).
    await userEvent.click(screen.getByLabelText(/Người chịu/))

    expect(await screen.findAllByText('Người dùng')).toHaveLength(2)
    expect(screen.queryByText('Merchant')).not.toBeInTheDocument()
    expect(screen.queryByText('Người gửi')).not.toBeInTheDocument()
  })

  it('chuẩn hoá người chịu không còn hợp lệ của thành phần Bank cũ về payer thực thi', () => {
    // SENDER từng là lựa chọn cho miền Bank nhưng backend chưa từng duyệt —
    // component cũ mang giá trị này phải chuẩn hoá về payer thực thi (USER).
    renderBankDialog({
      ...existingComponent,
      payerType: 'SENDER'
    })

    expect(screen.getByText('Người dùng')).toBeInTheDocument()
    expect(screen.queryByText('Người gửi')).not.toBeInTheDocument()
  })

  it('miền Bank chỉ hiển thị người hưởng Ngân hàng và khoá lựa chọn', () => {
    renderBankDialog()

    expect(screen.getByText('Ngân hàng')).toBeInTheDocument()
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument()
    expect(screen.getByLabelText(/Người hưởng/)).toBeDisabled()
  })

  it('chuẩn hoá người hưởng SYSTEM của thành phần Bank cũ thành BANK khi lưu', async () => {
    const onSave = renderBankDialog(existingComponent)

    await userEvent.click(screen.getByRole('button', { name: 'Lưu thành phần' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ beneficiaryType: 'BANK' })
    )
  })
})

describe('FeeComponentDialog beneficiary defaults', () => {
  const renderWalletDialog = (onSave = vi.fn()) => {
    renderWithProviders(
      <FeeComponentDialog
        open
        initialValue={null}
        precedingComponents={[]}
        existingComponents={[]}
        feeDomain={FeeDomain.EWALLET}
        businessCategory={FEE_BUSINESS_CATEGORY.TRANSACTION_PROCESSING}
        serviceType='EWALLET_DEPOSIT'
        onSave={onSave}
        onCancel={vi.fn()}
      />
    )
    return onSave
  }

  it('miền Ví chỉ cho chọn Người dùng chịu phí, không bày payer chưa hỗ trợ', async () => {
    renderWalletDialog()

    await userEvent.click(screen.getByLabelText(/Người chịu/))

    expect(await screen.findAllByText('Người dùng')).toHaveLength(2)
    expect(screen.queryByText('Người gửi')).not.toBeInTheDocument()
    expect(screen.queryByText('Người nhận')).not.toBeInTheDocument()
    expect(screen.queryByText('Hệ thống/platform')).not.toBeInTheDocument()
  })

  it('miền Ví lưu mặc định Người dùng chịu và Hệ thống hưởng', async () => {
    const onSave = renderWalletDialog()

    await userEvent.click(screen.getByLabelText(/Loại phí/))
    await userEvent.click(await screen.findByText('Phí giao dịch cơ bản'))
    await userEvent.click(screen.getByRole('button', { name: 'Thêm' }))

    await waitFor(() => expect(onSave).toHaveBeenCalled())
    expect(onSave.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({
        payerType: 'USER',
        beneficiaryType: 'SYSTEM'
      })
    )
  })
})
