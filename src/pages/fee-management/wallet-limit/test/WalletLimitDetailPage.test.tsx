import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import WalletLimitDetailPage from '../pages/WalletLimitDetailPage'
import { walletLimitPaths } from '../utils/walletLimit.paths'

const policy: WalletLimitPolicy = {
  id: 'policy-1',
  scopeType: 'WALLET',
  targetId: 'profile-1',
  targetDisplay: '0912345678',
  walletType: 'ALL',
  transactionType: 'WITHDRAWAL',
  minPerTransaction: 10000,
  maxPerTransaction: 5000000,
  dailyMaximum: 10000000,
  normalMonthlyMaximum: 50000000,
  specialMonthlyMaximum: null,
  walletBalanceMaximum: 999000000,
  outflowDailyMaximum: 7000000,
  outflowMonthlyMaximum: null,
  outboundMaxTimesPerDay: 3,
  approvalThreshold: 2000000,
  status: 'ACTIVE',
  bankOverrides: [
    {
      id: 'ov-1',
      transactionType: 'WITHDRAWAL',
      bankCode: 'VCB',
      paymentMethod: null,
      minPerTransaction: 10000,
      maxPerTransaction: 4000000,
      dailyMaximum: 5000000,
      normalMonthlyMaximum: null,
      specialMonthlyMaximum: null
    }
  ],
  createdAt: '2026-10-08T03:10:00Z',
  createdByUsername: 'admin.ops',
  updatedAt: '2026-10-08T03:15:00Z',
  updatedByUsername: 'admin.risk',
  rowVersion: 4
}

const mockPolicy = (data: WalletLimitPolicy) =>
  server.use(
    http.get('*/wallet-limit-policies/:id', () => HttpResponse.json({ data }))
  )

const renderPage = (permissions: string[] = [PERMISSION.EWALLET_FULL]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(
    <Routes>
      <Route
        path='/fee/wallet-limit/:id'
        element={<WalletLimitDetailPage />}
      />
      <Route
        path={walletLimitPaths.list}
        element={<p>Màn danh sách hạn mức</p>}
      />
    </Routes>,
    { store, route: '/fee/wallet-limit/policy-1' }
  )
}

beforeEach(() => mockPolicy(policy))

describe('WalletLimitDetailPage', () => {
  it('hiển thị tiêu đề, tag, hạn mức đủ chữ số và thông tin lưu vết', async () => {
    renderPage()

    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: 'Ví · 0912345678 · Rút tiền'
      })
    ).toBeInTheDocument()
    expect(screen.getByText('Hoạt động')).toBeInTheDocument()
    expect(screen.getByText('10,000,000 ₫')).toBeInTheDocument()
    expect(screen.getByText('50,000,000 ₫')).toBeInTheDocument()
    expect(screen.getByText('3 lần')).toBeInTheDocument()
    expect(
      screen.getByText('Phiên bản dữ liệu (rowVersion)')
    ).toBeInTheDocument()
    expect(screen.getByText('4')).toBeInTheDocument()
    expect(screen.getByText(/^admin\.ops · /)).toBeInTheDocument()
    expect(screen.getByText(/^admin\.risk · /)).toBeInTheDocument()
  })

  it('chỉ hiện các ô hạn mức áp dụng cho Rút tiền, ẩn Sức chứa ví', async () => {
    renderPage()
    await screen.findByText('Ngưỡng duyệt lệnh rút')

    expect(screen.getByText('Tổng chi trong ngày')).toBeInTheDocument()
    expect(screen.getByText('Số lần chi trong ngày')).toBeInTheDocument()
    expect(screen.queryByText('Sức chứa ví')).not.toBeInTheDocument()
    expect(screen.queryByText('999,000,000 ₫')).not.toBeInTheDocument()
    expect(screen.getAllByText('Không giới hạn').length).toBeGreaterThan(0)
  })

  it('loại giao dịch Tất cả hiện Sức chứa ví, Nạp tiền ẩn các ô chi', async () => {
    mockPolicy({ ...policy, transactionType: 'ALL' })
    const { unmount } = renderPage()
    expect(await screen.findByText('Sức chứa ví')).toBeInTheDocument()
    unmount()

    mockPolicy({ ...policy, transactionType: 'DEPOSIT' })
    renderPage()
    await screen.findAllByText('Hạn mức ngày')
    expect(screen.queryByText('Tổng chi trong ngày')).not.toBeInTheDocument()
    expect(screen.queryByText('Ngưỡng duyệt lệnh rút')).not.toBeInTheDocument()
  })

  it('liệt kê hạn mức theo ngân hàng trong bảng', async () => {
    renderPage()
    const table = await screen.findByRole('table')

    expect(within(table).getByText('VCB')).toBeInTheDocument()
    expect(within(table).getByText('4,000,000 ₫')).toBeInTheDocument()
  })

  it('không có override thì hiện câu giải thích thay cho bảng', async () => {
    mockPolicy({ ...policy, bankOverrides: [] })
    renderPage()

    expect(
      await screen.findByText(
        'Cấu hình này không có hạn mức riêng theo ngân hàng hoặc phương thức.'
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('hiện nút Cập nhật khi có quyền và ẩn khi không có quyền', async () => {
    const { unmount } = renderPage()
    expect(
      await screen.findByRole('button', { name: 'Cập nhật' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Lịch sử cập nhật' })
    ).toBeInTheDocument()
    unmount()

    renderPage([])
    await screen.findByRole('button', { name: 'Lịch sử cập nhật' })
    expect(
      screen.queryByRole('button', { name: 'Cập nhật' })
    ).not.toBeInTheDocument()
  })

  it('404 hiện thông báo không tìm thấy và nút về danh sách', async () => {
    server.use(
      http.get('*/wallet-limit-policies/:id', () =>
        HttpResponse.json(
          { success: false, detail: 'Not found', status: '1003' },
          { status: 404 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage()

    expect(
      await screen.findByText('Không tìm thấy cấu hình hạn mức')
    ).toBeInTheDocument()
    await user.click(
      screen.getByRole('button', { name: 'Về danh sách hạn mức' })
    )
    expect(await screen.findByText('Màn danh sách hạn mức')).toBeInTheDocument()
  })

  it('lỗi khác 404 hiện Thử lại và tải lại thành công', async () => {
    let calls = 0
    server.use(
      http.get('*/wallet-limit-policies/:id', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ message: 'boom' }, { status: 500 })
          : HttpResponse.json({ data: policy })
      })
    )
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Thử lại' }))
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
        'Ví · 0912345678 · Rút tiền'
      )
    )
  })
})
