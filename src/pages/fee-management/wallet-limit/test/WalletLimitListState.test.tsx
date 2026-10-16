import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import WalletLimitListPage from '../pages/WalletLimitListPage'
import { toVietnamDayStartIso } from '../utils/walletLimit.listParams'
import dayjs from 'dayjs'

const ROUTE = '/secure-panel/fee-v4/wallet-limit'
const STORAGE_KEY = `${LIST_STATE_PREFIX}${ROUTE}`

const requests: URLSearchParams[] = []

beforeEach(() => {
  requests.length = 0
  server.use(
    http.get('*/wallet-limit-policies', ({ request }) => {
      requests.push(new URL(request.url).searchParams)
      return HttpResponse.json({
        data: { content: [], totalElements: 60, number: 0, size: 20 }
      })
    })
  )
})

afterEach(() => {
  sessionStorage.clear()
})

const renderPage = (route = ROUTE) => {
  const store = createAppStore()
  store.dispatch(savePermissions([PERMISSION.EWALLET_FULL]))
  return renderWithProviders(<WalletLimitListPage />, { store, route })
}

describe('WalletLimitListPage - giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục bộ lọc, SĐT và trang từ bản sao khi URL trống', async () => {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        query: 'scopeType=WALLET&createdFrom=2026-10-01&page=2',
        sensitive: { targetKeyword: '0912' }
      })
    )
    renderPage()

    expect(screen.getByLabelText('Mã định danh')).toHaveValue('0912')
    expect(screen.getByText('Ví')).toBeInTheDocument()
    expect(screen.getByLabelText('Tạo từ ngày')).toHaveValue('01/10/2026')
    await waitFor(() => expect(requests.length).toBeGreaterThan(0))
    expect(requests[0].get('page')).toBe('2')
    expect(requests[0].get('size')).toBe('20')
    expect(requests[0].get('scopeType')).toBe('WALLET')
    expect(requests[0].get('targetKeyword')).toBe('0912')
    expect(requests[0].get('createdFrom')).toBe(
      toVietnamDayStartIso(dayjs('2026-10-01'))
    )
  })

  it('Tìm kiếm lưu SĐT ngoài URL, Xóa bộ lọc thì bỏ bản sao', async () => {
    const user = userEvent.setup()
    renderPage(`${ROUTE}?page=3`)

    await user.type(screen.getByLabelText('Mã định danh'), '0912')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() =>
      expect(requests.at(-1)?.get('targetKeyword')).toBe('0912')
    )
    expect(requests.at(-1)?.get('page')).toBe('1')
    expect(JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '{}')).toEqual({
      query: '',
      sensitive: { targetKeyword: '0912' }
    })

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() =>
      expect(requests.at(-1)?.has('targetKeyword')).toBe(false)
    )
    expect(screen.getByLabelText('Mã định danh')).toHaveValue('')
    expect(sessionStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})
