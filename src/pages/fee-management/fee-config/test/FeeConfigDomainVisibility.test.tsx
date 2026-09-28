import { MessageProvider } from '@/app/hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import FeeConfig from '../FeeConfig'

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
        <Route path='/fee/create' element={<FeeConfig />} />
      </Routes>
    </MessageProvider>,
    { route: '/fee/create' }
  )
}

describe('miền phí của trang tạo chính sách', () => {
  it('chỉ cho tạo phí Bank/NCC hoặc phí ví', () => {
    renderCreatePage()

    expect(screen.getByRole('tab', { name: 'Phí Bank/NCC' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Phí ví' })).toBeInTheDocument()
    expect(
      screen.queryByRole('tab', { name: 'Phí ĐVCNTT' })
    ).not.toBeInTheDocument()
  })

  it('đưa bộ chọn đơn vị chấp nhận thanh toán vào gán đối tượng Bank/NCC', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.click(screen.getByRole('tab', { name: 'Phí Bank/NCC' }))

    expect(
      screen.getByText('Đơn vị chấp nhận thanh toán')
    ).toBeInTheDocument()
  })

  it('mở thành phần phí Bank với người hưởng Ngân hàng đã khoá', async () => {
    const user = userEvent.setup()
    renderCreatePage()

    await user.click(screen.getByRole('tab', { name: 'Phí Bank/NCC' }))
    await user.click(
      screen.getByRole('button', { name: 'Thêm phí thành phần' })
    )

    const beneficiary = screen.getByLabelText(/Người hưởng/)
    expect(beneficiary.closest('.ant-select')).toHaveTextContent('Ngân hàng')
    expect(screen.queryByText('Hệ thống')).not.toBeInTheDocument()
    expect(beneficiary).toBeDisabled()
  })
})
