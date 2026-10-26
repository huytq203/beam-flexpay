import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { useLocation } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { SCREENS } from '@/app/permissions'
import { MessageProvider } from '@hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import TransactionManagement from '../TransactionManagement'

const ROUTE = SCREENS.TRANSACTION_WALLET.path
const ALIAS = SCREENS.TRANSACTION_WALLET.aliasPaths[0]
const PHONE = '0962341913'
const ACCOUNT = 'Username tài khoản...'

const requests: URLSearchParams[] = []

const mockJournal = () =>
  server.use(
    http.get('*/wallet/journal/unified', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json({ data: { content: [], totalElements: 0 } })
    })
  )

const LocationProbe = () => (
  <span data-testid='search'>{useLocation().search}</span>
)

const renderAt = (route: string) =>
  renderWithProviders(
    <MessageProvider>
      <TransactionManagement />
      <LocationProbe />
    </MessageProvider>,
    { route }
  )

const lastRequest = (): URLSearchParams => requests[requests.length - 1]

afterEach(() => {
  sessionStorage.clear()
  requests.length = 0
})

describe('TransactionManagement — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc + trang từ bản sao, username tài khoản không lên URL', async () => {
    mockJournal()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({
        query: 'transactionCode=TXN-001&hasRefund=true&page=2',
        sensitive: { partyUsername: PHONE }
      })
    )

    renderAt(ROUTE)

    expect(await screen.findByPlaceholderText(ACCOUNT)).toHaveValue(PHONE)
    expect(screen.getByPlaceholderText('Nhập mã giao dịch...')).toHaveValue(
      'TXN-001'
    )
    expect(screen.getByTitle('Hoàn tiền')).toBeInTheDocument()
    expect(lastRequest().get('page')).toBe('2')
    expect(lastRequest().get('partyUsername')).toBe(PHONE)
    expect(lastRequest().get('transactionCode')).toBe('TXN-001')
    expect(lastRequest().get('hasRefund')).toBe('true')
    expect(lastRequest().get('sourceDomain')).toBe('EWALLET')
    await waitFor(() =>
      expect(screen.getByTestId('search')).toHaveTextContent('page=2')
    )
    expect(screen.getByTestId('search')).not.toHaveTextContent(PHONE)
  })

  it('đường dẫn cũ (wallet-administration) dùng chung bản sao với đường dẫn chính', async () => {
    mockJournal()
    sessionStorage.setItem(
      `${LIST_STATE_PREFIX}${ROUTE}`,
      JSON.stringify({ query: 'status=FAILED&page=4', sensitive: {} })
    )

    renderAt(ALIAS)

    await waitFor(() => expect(lastRequest()?.get('page')).toBe('4'))
    expect(lastRequest().get('status')).toBe('FAILED')
  })

  it('Tìm kiếm về trang 1, Xóa lọc xoá bộ lọc và bản sao', async () => {
    mockJournal()
    renderAt(`${ROUTE}?page=3`)
    const account = await screen.findByPlaceholderText(ACCOUNT)
    expect(lastRequest().get('page')).toBe('3')

    fireEvent.change(account, { target: { value: PHONE } })
    fireEvent.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await waitFor(() => {
      expect(lastRequest().get('partyUsername')).toBe(PHONE)
      expect(lastRequest().get('page')).toBe('1')
    })
    expect(screen.getByTestId('search')).not.toHaveTextContent(PHONE)

    fireEvent.click(screen.getByRole('button', { name: /Xóa lọc/ }))
    await waitFor(() => expect(lastRequest().has('partyUsername')).toBe(false))
    expect(screen.getByPlaceholderText(ACCOUNT)).toHaveValue('')
    expect(sessionStorage.getItem(`${LIST_STATE_PREFIX}${ROUTE}`)).toBeNull()
  })
})
