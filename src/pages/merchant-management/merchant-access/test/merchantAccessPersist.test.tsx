import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { LIST_STATE_PREFIX } from '@utils/list-state-storage'
import { server } from '@/test/mocks/server'
import { renderPage } from './merchantAccess.setup'

const USER_ROUTE = '/secure-panel/merchant/user'
const ROLE_ROUTE = '/secure-panel/merchant/user-role'
const userRequests: URL[] = []
const roleRequests: URL[] = []

const emptyPage = { content: [], totalElements: 0, number: 0, size: 10 }

beforeEach(() => {
  userRequests.length = 0
  roleRequests.length = 0
  server.use(
    http.get('*/merchant-users', ({ request }) => {
      userRequests.push(new URL(request.url))
      return HttpResponse.json({ data: emptyPage })
    }),
    http.get('*/merchant-permission-groups', ({ request }) => {
      roleRequests.push(new URL(request.url))
      return HttpResponse.json({ data: emptyPage })
    })
  )
})

afterEach(() => sessionStorage.clear())

const saved = (route: string): unknown =>
  JSON.parse(sessionStorage.getItem(`${LIST_STATE_PREFIX}${route}`) ?? 'null')

const store = (route: string, query: string, sensitive = {}) =>
  sessionStorage.setItem(
    `${LIST_STATE_PREFIX}${route}`,
    JSON.stringify({ query, sensitive })
  )

describe('Merchant User — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục từ khóa, Merchant, trạng thái và trang từ bản sao', async () => {
    store(USER_ROUTE, 'merchantId=merchant-0142&status=LOCKED&page=2', {
      query: '0912345456'
    })
    renderPage(USER_ROUTE)
    expect(screen.getByLabelText('Từ khóa')).toHaveValue('0912345456')
    await waitFor(() =>
      expect(screen.getByLabelText('Merchant')).toHaveValue(
        'MC000142 — Highlands Coffee'
      )
    )
    expect(screen.getByText('Bị khóa')).toBeInTheDocument()
    await waitFor(() => expect(userRequests.length).toBeGreaterThan(0))
    const first = userRequests[0].searchParams
    expect(first.get('query')).toBe('0912345456')
    expect(first.get('merchantId')).toBe('merchant-0142')
    expect(first.get('status')).toBe('LOCKED')
    expect(first.get('page')).toBe('2')
  })

  it('Tìm kiếm giữ từ khóa ngoài URL vì có thể là SĐT/Email', async () => {
    const user = userEvent.setup()
    renderPage(USER_ROUTE)
    await user.type(screen.getByLabelText('Từ khóa'), ' hai@example.com ')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() =>
      expect(userRequests.at(-1)?.searchParams.get('query')).toBe(
        'hai@example.com'
      )
    )
    expect(saved(USER_ROUTE)).toEqual({
      query: '',
      sensitive: { query: 'hai@example.com' }
    })
    expect(saved(ROLE_ROUTE)).toBeNull()
  })
})

describe('Nhóm quyền — giữ bộ lọc khi quay lại màn', () => {
  it('khôi phục tên nhóm, Merchant và trang từ bản sao', async () => {
    store(ROLE_ROUTE, 'query=Qu%E1%BA%A3n&merchantId=merchant-0142&page=2')
    renderPage(ROLE_ROUTE)
    expect(screen.getByLabelText('Tên nhóm quyền')).toHaveValue('Quản')
    await waitFor(() =>
      expect(screen.getByLabelText('Merchant')).toHaveValue(
        'MC000142 — Highlands Coffee'
      )
    )
    await waitFor(() => expect(roleRequests.length).toBeGreaterThan(0))
    const first = roleRequests[0].searchParams
    expect(first.get('query')).toBe('Quản')
    expect(first.get('merchantId')).toBe('merchant-0142')
    expect(first.get('page')).toBe('2')
  })

  it('Xóa bộ lọc thì xóa bản sao và gọi lại trang 1', async () => {
    const user = userEvent.setup()
    store(ROLE_ROUTE, 'scope=shared&page=3')
    renderPage(ROLE_ROUTE)
    await waitFor(() =>
      expect(roleRequests.at(-1)?.searchParams.get('systemOnly')).toBe('true')
    )
    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))
    await waitFor(() => {
      expect(roleRequests.at(-1)?.searchParams.get('systemOnly')).toBeNull()
      expect(roleRequests.at(-1)?.searchParams.get('page')).toBe('1')
    })
    expect(saved(ROLE_ROUTE)).toBeNull()
  })
})
