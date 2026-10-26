import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import WalletLimitListPage from '../pages/WalletLimitListPage'

const walletRow = {
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
  walletBalanceMaximum: null,
  outflowDailyMaximum: null,
  outflowMonthlyMaximum: null,
  outboundMaxTimesPerDay: null,
  approvalThreshold: null,
  status: 'ACTIVE',
  bankOverrides: [
    {
      id: 'ov-1',
      transactionType: 'WITHDRAWAL',
      bankCode: 'VCB',
      paymentMethod: null,
      minPerTransaction: 10000,
      maxPerTransaction: 5000000,
      dailyMaximum: 5000000,
      normalMonthlyMaximum: null,
      specialMonthlyMaximum: null
    }
  ],
  createdAt: '2026-10-08T03:10:00Z',
  createdByUsername: 'admin.ops',
  updatedAt: null,
  updatedByUsername: null,
  rowVersion: 1
}

const systemRow = {
  ...walletRow,
  id: 'policy-2',
  scopeType: 'SYSTEM',
  targetId: null,
  targetDisplay: null,
  transactionType: 'ALL',
  status: 'LOCKED',
  bankOverrides: []
}

const requests: URL[] = []

const respondWithRows = () =>
  http.get('*/wallet-limit-policies', ({ request }) => {
    requests.push(new URL(request.url))
    return HttpResponse.json({
      data: {
        content: [walletRow, systemRow],
        totalElements: 2,
        totalPages: 1,
        number: 0,
        size: 20
      }
    })
  })

beforeEach(() => {
  requests.length = 0
  server.use(respondWithRows())
})

afterEach(() => {
  sessionStorage.clear()
})

const renderPage = (permissions: string[] = [PERMISSION.EWALLET_FULL]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<WalletLimitListPage />, { store })
}

describe('WalletLimitListPage - danh sách hạn mức ví', () => {
  it('hiển thị dòng dữ liệu kèm override và nhãn mặc định', async () => {
    renderPage()

    expect(await screen.findByText('0912345678')).toBeInTheDocument()
    expect(screen.getByText('Toàn hệ thống')).toBeInTheDocument()
    expect(screen.getByText('VCB · Rút tiền')).toBeInTheDocument()
    expect(screen.getByText('Không có')).toBeInTheDocument()
    expect(screen.getAllByText('Loại ví: Tất cả')).toHaveLength(2)
    expect(screen.getByText('Hoạt động')).toBeInTheDocument()
    expect(screen.getByText('Khóa')).toBeInTheDocument()
    expect(screen.getAllByText('5.000.000 ₫').length).toBeGreaterThan(0)
    expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
    expect(requests.at(-1)?.searchParams.get('size')).toBe('20')
  })

  it('chỉ áp bộ lọc khi bấm Tìm kiếm và gửi đúng query', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('0912345678')

    fireEvent.mouseDown(
      screen
        .getByLabelText('Đối tượng')
        .closest('.ant-select')!
        .querySelector('.ant-select-selector')!
    )
    await user.click(
      await screen.findByText('Ví', {
        selector: '.ant-select-item-option-content'
      })
    )
    await user.type(screen.getByLabelText('Mã định danh'), ' 0912 ')
    expect(requests.at(-1)?.searchParams.get('scopeType')).toBeNull()

    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('scopeType')).toBe('WALLET')
      expect(requests.at(-1)?.searchParams.get('targetKeyword')).toBe('0912')
    })
    expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
  })

  it('báo lỗi và cho thử lại khi tải danh sách thất bại', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/wallet-limit-policies', () =>
        HttpResponse.json({ success: false }, { status: 500 })
      )
    )
    renderPage()

    expect(
      await screen.findByText('Không thể tải danh sách hạn mức.')
    ).toBeInTheDocument()

    server.use(respondWithRows())
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByText('0912345678')).toBeInTheDocument()
  })

  it('hiện thông báo rỗng khi không có cấu hình khớp bộ lọc', async () => {
    server.use(
      http.get('*/wallet-limit-policies', () =>
        HttpResponse.json({
          data: { content: [], totalElements: 0, number: 0, size: 20 }
        })
      )
    )
    renderPage()

    expect(
      await screen.findByText('Không có cấu hình nào khớp bộ lọc')
    ).toBeInTheDocument()
  })

  it('có đủ quyền thì hiện nút thêm và sửa', async () => {
    renderPage()

    expect(
      await screen.findByRole('button', { name: /Thêm hạn mức/ })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Cập nhật Ví · 0912345678 · Rút tiền'
      })
    ).toBeInTheDocument()
  })

  it('không có quyền thao tác thì ẩn nút thêm và sửa, vẫn xem được', async () => {
    renderPage([])

    expect(await screen.findByText('0912345678')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Thêm hạn mức/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Cập nhật/ })).toBeNull()
    expect(
      screen.getByRole('button', {
        name: 'Xem chi tiết Ví · 0912345678 · Rút tiền'
      })
    ).toBeInTheDocument()
  })
})
