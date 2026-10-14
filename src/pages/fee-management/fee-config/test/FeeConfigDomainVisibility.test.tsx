import { MessageProvider } from '@/app/hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { SERVICE_TYPE_LABELS } from '@constants/feeLabels'
import FeeConfig from '../FeeConfig'

const MERCHANT_COLLECTION_LABEL =
  SERVICE_TYPE_LABELS.MERCHANT_VA_BILL_COLLECTION
const REFUND_LABEL = SERVICE_TYPE_LABELS.EWALLET_REFUND
const DEPOSIT_LABEL = SERVICE_TYPE_LABELS.EWALLET_DEPOSIT

const mockUseFeeConfigDetail = vi.hoisted(() => vi.fn())

vi.mock('../hooks/useFeeConfigDetail', () => ({
  useFeeConfigDetail: mockUseFeeConfigDetail
}))

const renderCreatePage = () => {
  mockUseFeeConfigDetail.mockReturnValue({
    values: null,
    snapshot: null,
    isEditable: true,
    isLoading: false,
    isError: false
  })
  server.use(
    http.get('*/fee/banks', () =>
      HttpResponse.json({ success: true, data: { content: [] } })
    )
  )

  return renderWithProviders(
    <MessageProvider>
      <Routes>
        <Route
          path='/fee/create'
          element={<FeeConfig />}
        />
      </Routes>
    </MessageProvider>,
    { route: '/fee/create' }
  )
}

describe('trang tạo chính sách', () => {
  it('không còn chọn miền phí; phí đầu ra và phí đầu vào là hai tab', () => {
    renderCreatePage()

    expect(
      screen.queryByRole('tablist', { name: 'Miền phí' })
    ).not.toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: 'Phí Bank/NCC' })
    ).not.toBeInTheDocument()

    const scopeTabs = screen.getByRole('tablist', { name: 'Luồng phí' })
    expect(scopeTabs).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /Phí đầu ra/ })).toHaveAttribute(
      'aria-selected',
      'true'
    )
    expect(screen.getByRole('tab', { name: /Phí đầu vào/ })).toHaveAttribute(
      'aria-selected',
      'false'
    )
  })

  it('mở hộp thoại phí đầu ra ở tab thu, người hưởng là Hệ thống', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.click(screen.getByRole('button', { name: 'Thêm phí đầu ra' }))

    expect(
      within(await screen.findByRole('dialog')).getByText('Thêm phí đầu ra')
    ).toBeInTheDocument()
    expect(screen.getByLabelText(/Người chịu/)).toBeDisabled()
  })

  it('mở hộp thoại chi phí ở tab chi phí, Hệ thống chịu và Ngân hàng hưởng', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.click(screen.getByRole('tab', { name: /Phí đầu vào/ }))
    await user.click(screen.getByRole('button', { name: 'Thêm phí đầu vào' }))

    expect(
      within(await screen.findByRole('dialog')).getByText('Thêm phí đầu vào')
    ).toBeInTheDocument()
    expect(
      screen.getByLabelText(/Người chịu/).closest('.ant-select')
    ).toHaveTextContent('Hệ thống/platform')
    const beneficiary = screen.getByLabelText(/Người hưởng/)
    expect(beneficiary.closest('.ant-select')).toHaveTextContent('Ngân hàng')
    expect(beneficiary).not.toBeDisabled()
  })

  it('tạm ẩn thu hộ VA và chi hộ khỏi danh sách loại giao dịch', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.click(screen.getByLabelText(/Loại giao dịch/))

    expect(await screen.findByText(DEPOSIT_LABEL)).toBeInTheDocument()
    expect(
      screen.queryByText(MERCHANT_COLLECTION_LABEL)
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText('Chi hộ chuyển khoản ngân hàng')
    ).not.toBeInTheDocument()
  })

  // Thu hộ VA và chi hộ đang tạm ẩn (TEMPORARILY_HIDDEN_SERVICE_TYPES nên không chọn được từ
  // form). Bỏ skip khi bật lại hai loại này.
  it.skip('chỉ hiện ô Merchant khi chọn loại giao dịch thu hộ hoặc chi hộ', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    expect(
      screen.queryByText('Đơn vị chấp nhận thanh toán')
    ).not.toBeInTheDocument()

    await user.click(screen.getByLabelText(/Loại giao dịch/))
    await user.click(await screen.findByText(MERCHANT_COLLECTION_LABEL))

    expect(
      await screen.findByText('Đơn vị chấp nhận thanh toán')
    ).toBeInTheDocument()
    // Ngân hàng luôn có mặt để cấu hình ưu đãi riêng cho một cặp merchant + ngân hàng.
    expect(screen.getByLabelText(/Ngân hàng/)).toBeInTheDocument()

    await user.click(screen.getByLabelText(/Loại giao dịch/))
    await user.click(await screen.findByText(DEPOSIT_LABEL))

    expect(
      screen.queryByText('Đơn vị chấp nhận thanh toán')
    ).not.toBeInTheDocument()
  })

  it('chọn Hoàn tiền giao dịch ví: không hiện ô Merchant, người chịu chọn được', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.click(screen.getByLabelText(/Loại giao dịch/))
    await user.click(await screen.findByText(REFUND_LABEL))

    expect(
      screen.queryByText('Đơn vị chấp nhận thanh toán')
    ).not.toBeInTheDocument()
    expect(screen.queryByText('Loại thẻ')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Thêm phí đầu ra' }))
    await within(await screen.findByRole('dialog')).findByText(
      'Thêm phí đầu ra'
    )
    expect(screen.getByLabelText(/Người chịu/)).not.toBeDisabled()
    expect(screen.getByLabelText(/Người hưởng/)).toBeDisabled()
  })
})
