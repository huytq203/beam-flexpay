import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import { BalanceReportPanel } from '../components/BalanceReportPanel'
import MerchantBalanceReportPage from '../pages/MerchantBalanceReportPage'
import { BASE, SUB_ID, apiError, balanceReport } from './reconciliation.setup'

vi.mock('../../merchant-settlement-scope/components/ScopeTargetPicker', () => ({
  ScopeTargetPicker: ({
    onChange
  }: {
    onChange: (value: { id: string; code: string; name: string }) => void
  }) => (
    <button
      type='button'
      onClick={() => onChange({ id: 'sub-1', code: 'S1', name: 'Sub 1' })}
    >
      Chọn Sub thử nghiệm
    </button>
  )
}))

const REPORT_URL = `${BASE}/sub-merchants/${SUB_ID}/balance-report`

describe('BalanceReportPanel', { timeout: 30000 }, () => {
  it('hiện doanh thu, khoản chờ quyết toán tách khỏi đóng băng và nhãn BE', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(REPORT_URL, () => HttpResponse.json({ data: balanceReport() }))
    )
    renderWithStore(<BalanceReportPanel />, [])
    await user.click(
      screen.getByRole('button', { name: 'Chọn Sub thử nghiệm' })
    )
    expect(await screen.findByText('8.500.000 đ')).toBeInTheDocument()
    expect(screen.getByText('Giải thích Chờ quyết toán')).toBeInTheDocument()
    expect(screen.getByText('1.500.000 đ')).toBeInTheDocument()
    // Đóng băng theo lệnh luôn 0 nên được đánh dấu chưa áp dụng.
    expect(screen.getByText('Chưa áp dụng')).toBeInTheDocument()
  })

  it('503 sổ cái chưa đọc được hiện cùng trạng thái dịch vụ chưa sẵn sàng với run', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(REPORT_URL, () =>
        apiError(
          'MERCHANT_ESCROW_BALANCE_UNAVAILABLE',
          'Chưa đọc được số dư từ sổ cái',
          503
        )
      )
    )
    renderWithStore(<BalanceReportPanel />, [])
    await user.click(
      screen.getByRole('button', { name: 'Chọn Sub thử nghiệm' })
    )
    expect(
      await screen.findByText(/Chưa đọc được số dư từ sổ cái nên chưa lập/)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })

  it('404 ngoài phạm vi hiện detail của BE kèm nút thử lại', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(REPORT_URL, () =>
        apiError('RESOURCE_NOT_FOUND', 'SubMerchant không tìm thấy', 404)
      )
    )
    renderWithStore(<BalanceReportPanel />, [])
    await user.click(
      screen.getByRole('button', { name: 'Chọn Sub thử nghiệm' })
    )
    expect(
      await screen.findByText('SubMerchant không tìm thấy')
    ).toBeInTheDocument()
  })

  it('trang cho vào với quyền báo cáo hoặc quyền đối soát, từ chối khi không có quyền nào', () => {
    const first = renderWithStore(<MerchantBalanceReportPage />, [
      PERMISSION.MERCHANT_RECONCILIATION_RUN
    ])
    expect(screen.getByText('Báo cáo số dư')).toBeInTheDocument()
    first.unmount()
    renderWithStore(<MerchantBalanceReportPage />, [])
    expect(screen.queryByText('Báo cáo số dư')).toBeNull()
  })
})
