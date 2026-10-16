import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import MerchantTransactionPage from '../pages/MerchantTransactionPage'

dayjs.extend(utc)

const ROUTE = '/secure-panel/merchant/transaction'
const STORAGE_KEY = `${LIST_STATE_PREFIX}${ROUTE}`
const requests: URL[] = []

beforeEach(() => {
  requests.length = 0
  server.use(
    http.get('*/wallet/journal/unified', ({ request }) => {
      requests.push(new URL(request.url))
      return HttpResponse.json({
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 10,
          number: 0,
          summary: {
            totalCount: 0,
            successCount: 0,
            processingCount: 0,
            pendingCount: 0,
            failedCount: 0
          }
        }
      })
    })
  )
})

afterEach(() => sessionStorage.clear())

const renderPage = () =>
  renderWithProviders(<MerchantTransactionPage />, { route: ROUTE })

const saved = (): unknown =>
  JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? 'null')

describe('MerchantTransactionPage — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục Merchant, từ khóa, ngày và trang từ bản sao đã lưu', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query:
          'merchantId=m-1&merchantCode=MC01&merchantName=Ho%C3%A0ng+Long&fromDate=2026-10-01&page=2',
        sensitive: { keyword: '0901234567' }
      })
    )
    renderPage()
    expect(await screen.findByLabelText('Merchant')).toHaveValue(
      'MC01 — Hoàng Long'
    )
    expect(screen.getByLabelText('Từ khóa')).toHaveValue('0901234567')
    expect(screen.getByLabelText('Từ ngày')).toHaveValue('01/10/2026')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    const first = requests[0].searchParams
    expect(first.get('partyId')).toBe('m-1')
    expect(first.get('keyword')).toBe('0901234567')
    expect(first.get('fromDate')).toBe(
      dayjs('2026-10-01').startOf('day').utc().format('YYYY-MM-DDTHH:mm:ss')
    )
    expect(first.get('page')).toBe('2')
  })

  it('Tìm kiếm giữ từ khóa (có thể là SĐT) ngoài URL, chỉ trong bản sao', async () => {
    const user = userEvent.setup()
    renderPage()
    await user.type(await screen.findByLabelText('Từ khóa'), '0901234567')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))
    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('keyword')).toBe('0901234567')
    )
    expect(saved()).toEqual({
      query: '',
      sensitive: { keyword: '0901234567' }
    })
  })

  it('Xóa bộ lọc thì xóa bản sao và gọi lại trang 1', async () => {
    const user = userEvent.setup()
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ query: 'status=POSTED&page=4', sensitive: {} })
    )
    renderPage()
    await waitFor(() =>
      expect(requests.at(-1)?.searchParams.get('page')).toBe('4')
    )
    await user.click(screen.getByRole('button', { name: /Xóa bộ lọc/ }))
    await waitFor(() => {
      expect(requests.at(-1)?.searchParams.get('status')).toBeNull()
      expect(requests.at(-1)?.searchParams.get('page')).toBe('1')
    })
    expect(saved()).toBeNull()
  })
})
