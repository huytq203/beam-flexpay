import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import WalletLimitHistoryPage from '../pages/WalletLimitHistoryPage'
import { walletLimitPaths } from '../utils/walletLimit.paths'

const entries = [
  {
    occurredAt: '2026-10-08T03:15:00Z',
    actorUsername: 'admin.ops',
    ipAddress: '10.0.1.23',
    action: 'UPDATE',
    changes: [
      {
        field: 'dailyMaximum',
        label: 'Hạn mức ngày',
        oldValue: 20000000,
        newValue: 30000000
      },
      {
        field: 'status',
        label: 'Trạng thái',
        oldValue: 'Hoạt động',
        newValue: 'Khóa'
      },
      {
        field: 'bankOverrides[VCB|WITHDRAWAL|].maxPerTransaction',
        label: 'VCB · Rút tiền · Tối đa/GD',
        oldValue: 5000000,
        newValue: null
      }
    ]
  },
  {
    occurredAt: '2026-10-08T03:10:00Z',
    actorUsername: 'admin.ops',
    ipAddress: '10.0.1.23',
    action: 'INSERT',
    changes: [
      {
        field: 'maxPerTransaction',
        label: 'Tối đa/GD',
        oldValue: null,
        newValue: 5000000
      }
    ]
  }
]

const policy = {
  id: 'policy-1',
  scopeType: 'WALLET',
  targetDisplay: '0912345678',
  transactionType: 'WITHDRAWAL'
}

const historyRequests: URL[] = []

const mockHistory = (content: unknown[], totalElements = content.length) =>
  server.use(
    http.get('*/wallet-limit-policies/:id/history', ({ request }) => {
      historyRequests.push(new URL(request.url))
      return HttpResponse.json({
        data: { content, totalElements, number: 0, size: 10 }
      })
    })
  )

const renderPage = () => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.EWALLET_FULL]))
  return renderWithProviders(
    <Routes>
      <Route
        path='/fee/wallet-limit/:id/history'
        element={<WalletLimitHistoryPage />}
      />
      <Route
        path={walletLimitPaths.list}
        element={<p>Màn danh sách hạn mức</p>}
      />
    </Routes>,
    { store, route: '/fee/wallet-limit/policy-1/history' }
  )
}

beforeEach(() => {
  historyRequests.length = 0
  server.use(
    http.get('*/wallet-limit-policies/:id', () =>
      HttpResponse.json({ data: policy })
    )
  )
  mockHistory(entries)
})

describe('WalletLimitHistoryPage', () => {
  it('hiện breadcrumb 3 cấp, người thực hiện, IP và từng thay đổi', async () => {
    renderPage()

    expect(await screen.findByText('Hạn mức ngày')).toBeInTheDocument()
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(
      within(nav).getByRole('link', { name: 'Hạn mức ví' })
    ).toBeInTheDocument()
    expect(
      await within(nav).findByRole('link', {
        name: 'Ví · 0912345678 · Rút tiền'
      })
    ).toBeInTheDocument()
    expect(within(nav).getByText('Lịch sử cập nhật')).toHaveAttribute(
      'aria-current',
      'page'
    )
    expect(screen.getAllByText('admin.ops · IP 10.0.1.23')).toHaveLength(2)
    expect(screen.getByText('Cập nhật')).toBeInTheDocument()
    expect(screen.getByText('Tạo mới')).toBeInTheDocument()
    expect(screen.getByText('20,000,000')).toBeInTheDocument()
    expect(screen.getByText('30,000,000')).toBeInTheDocument()
    expect(screen.getByText('VCB · Rút tiền · Tối đa/GD')).toBeInTheDocument()
  })

  it('giá trị cũ gạch ngang, giá trị mới đậm; null hiện Trống, chuỗi giữ nhãn BE', async () => {
    renderPage()
    await screen.findByText('Hạn mức ngày')

    expect(screen.getByText('20,000,000').tagName).toBe('DEL')
    expect(screen.getByText('30,000,000').tagName).toBe('STRONG')
    expect(screen.getByText('Hoạt động').tagName).toBe('DEL')
    expect(screen.getByText('Khóa').tagName).toBe('STRONG')
    // Override bị bỏ trống: mới = Trống; INSERT: cũ = Trống.
    expect(screen.getAllByText('Trống')).toHaveLength(2)
    expect(
      screen
        .getAllByText('Trống')
        .map((node) => node.tagName)
        .sort()
    ).toEqual(['DEL', 'STRONG'])
  })

  it('đánh số # từ 1 và gửi page=1,size=10 lần đầu', async () => {
    renderPage()
    await screen.findByText('Hạn mức ngày')

    const rows = screen.getAllByRole('row')
    expect(within(rows[1]).getByText('1')).toBeInTheDocument()
    expect(within(rows[2]).getByText('2')).toBeInTheDocument()
    expect(historyRequests[0].searchParams.get('page')).toBe('1')
    expect(historyRequests[0].searchParams.get('size')).toBe('10')
  })

  it('chuyển trang gửi page=2 và # tiếp tục từ 11', async () => {
    mockHistory(entries, 12)
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Hạn mức ngày')

    await user.click(screen.getByTitle('2'))

    await waitFor(() =>
      expect(
        historyRequests.some((url) => url.searchParams.get('page') === '2')
      ).toBe(true)
    )
    const last = historyRequests.at(-1)
    expect(last?.searchParams.get('size')).toBe('10')
    await waitFor(() => expect(screen.getByText('11')).toBeInTheDocument())
  })

  it('chưa có lịch sử thì hiện câu trạng thái rỗng', async () => {
    mockHistory([])
    renderPage()

    expect(
      await screen.findByText('Cấu hình này chưa có lịch sử cập nhật.')
    ).toBeInTheDocument()
  })

  it('404 hiện không tìm thấy cấu hình và nút về danh sách', async () => {
    server.use(
      http.get('*/wallet-limit-policies/:id/history', () =>
        HttpResponse.json({ detail: 'Not found' }, { status: 404 })
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

  it('lỗi tải hiện Thử lại', async () => {
    let calls = 0
    server.use(
      http.get('*/wallet-limit-policies/:id/history', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ message: 'boom' }, { status: 500 })
          : HttpResponse.json({
              data: { content: entries, totalElements: 2, number: 0, size: 10 }
            })
      })
    )
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByText('Hạn mức ngày')).toBeInTheDocument()
  })
})
