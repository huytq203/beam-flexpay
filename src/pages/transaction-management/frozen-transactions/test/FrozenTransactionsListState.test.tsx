import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { MessageProvider } from '@hooks/MessageProvider'
import { createAppStore } from '@/app/store'
import { renderWithProviders } from '@/test/render'
import { server } from '@/test/mocks/server'
import { savePermissions } from '@slices/authSlice'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import FrozenTransactions from '../FrozenTransactions'

const ROUTE = '/secure-panel/transaction-management/frozen-transactions'

const captureRequests = (content: unknown[] = []): URLSearchParams[] => {
  const seen: URLSearchParams[] = []
  server.use(
    http.get('*/wallet/freezes', ({ request }) => {
      seen.push(new URL(request.url).searchParams)
      return HttpResponse.json({
        data: { content, totalElements: content.length }
      })
    })
  )
  return seen
}

const freezeRow = (id: string, freezeCode: string | null) => ({
  id,
  freezeCode,
  ownerUsername: '0967770788',
  ownerType: 'USER',
  sourceTransactionId: null,
  displayStatus: 'FROZEN',
  releaseType: 'MANUAL',
  createdAt: '2026-10-22T12:17:15',
  unfreezeLogs: [],
  unfreezeCommands: []
})

const renderScreen = (route = ROUTE) => {
  const store = createAppStore()
  store.dispatch(savePermissions(['EWALLET:EWALLET:FULL']))
  return renderWithProviders(
    <MessageProvider>
      <FrozenTransactions />
    </MessageProvider>,
    { store, route }
  )
}

afterEach(() => {
  sessionStorage.clear()
})

describe('Giao dịch đóng băng — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc và trang từ bản sao khi URL trống', async () => {
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({
        query: 'sourceTransactionCode=TXN-001&page=2',
        sensitive: {}
      })
    )
    const seen = captureRequests()
    renderScreen()

    expect(await screen.findByLabelText(/Mã giao dịch gốc/)).toHaveValue(
      'TXN-001'
    )
    await waitFor(() => expect(seen.length).toBeGreaterThan(0))
    expect(seen[0].get('sourceTransactionCode')).toBe('TXN-001')
    expect(seen[0].get('page')).toBe('2')
    expect(seen[0].get('size')).toBe('10')
  })

  it('luôn gửi releaseType=MANUAL, không có ô lọc và bỏ qua giá trị trên URL', async () => {
    const seen = captureRequests()
    renderScreen(`${ROUTE}?releaseType=AUTO`)

    await waitFor(() => expect(seen.length).toBeGreaterThan(0))
    expect(seen[0].get('releaseType')).toBe('MANUAL')
    expect(seen[0].get('includeSummary')).toBe('true')
    expect(screen.queryByLabelText(/Cách mở băng/)).not.toBeInTheDocument()
  })

  it('bấm Tìm kiếm thì về trang 1 và lưu bộ lọc, bấm Đặt lại thì xóa', async () => {
    const user = userEvent.setup()
    const seen = captureRequests()
    renderScreen(`${ROUTE}?page=3`)

    await user.type(await screen.findByLabelText(/Tên tài khoản/), 'nguyenvana')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    await waitFor(() => expect(seen.at(-1)?.get('username')).toBe('nguyenvana'))
    expect(seen.at(-1)?.get('page')).toBe('1')
    // Username là SĐT nên chỉ nằm ở phần nhạy cảm, không ở query (URL).
    const saved = JSON.parse(
      sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`) ?? '{}'
    )
    expect(saved.query).not.toContain('nguyenvana')
    expect(saved.sensitive.username).toBe('nguyenvana')

    await user.click(screen.getByRole('button', { name: /Đặt lại/ }))
    await waitFor(() => expect(seen.at(-1)?.has('username')).toBe(false))
    expect(screen.getByLabelText(/Tên tài khoản/)).toHaveValue('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })

  it('lọc theo mã đóng băng: đọc từ URL và chuẩn hoá chữ hoa khi tìm', async () => {
    const user = userEvent.setup()
    const seen = captureRequests()
    renderScreen(`${ROUTE}?freezeCode=FZ7K4M9Q2H`)

    const input = await screen.findByLabelText(/Mã đóng băng/)
    expect(input).toHaveValue('FZ7K4M9Q2H')
    await waitFor(() => expect(seen[0]?.get('freezeCode')).toBe('FZ7K4M9Q2H'))

    await user.clear(input)
    await user.type(input, '  fz111aaaaa ')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await waitFor(() =>
      expect(seen.at(-1)?.get('freezeCode')).toBe('FZ111AAAAA')
    )
  })

  it('hiện mã đóng băng ở lưới, lệnh không có mã thì hiện —', async () => {
    captureRequests([freezeRow('f-1', 'FZ7K4M9Q2H'), freezeRow('f-2', null)])
    renderScreen()

    expect(await screen.findByText('FZ7K4M9Q2H')).toBeInTheDocument()
    expect(screen.getByText('—')).toBeInTheDocument()
  })
})
