import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import WalletLimitSpecialMonthPage from '../pages/WalletLimitSpecialMonthPage'

const month = (id: string, monthStart: string, name: string) => ({
  id,
  monthStart,
  name,
  createdAt: '2026-10-02T03:00:00Z',
  createdByUsername: 'admin.ops',
  updatedAt: null,
  updatedByUsername: null
})

// API trả ngoài thứ tự để kiểm tra FE tự sắp tăng dần.
export const months = [
  month('m4', '2027-02-01', 'Tết Nguyên đán 2027'),
  month('m1', '2026-09-01', 'Tháng tri ân khách hàng'),
  month('m2', '2026-10-01', 'Tháng khuyến mãi 10/10')
]

export const listRequests: URL[] = []

export const mockList = (data: unknown[]) =>
  server.use(
    http.get('*/wallet-limit-special-months', ({ request }) => {
      listRequests.push(new URL(request.url))
      return HttpResponse.json({ data })
    })
  )

export const renderPage = (
  permissions: string[] = [PERMISSION.EWALLET_FULL]
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return renderWithProviders(<WalletLimitSpecialMonthPage />, { store })
}

export const chooseMonth = async (
  user: ReturnType<typeof userEvent.setup>,
  value: string
) => {
  await user.type(screen.getByPlaceholderText('Chọn tháng'), `${value}{Enter}`)
}

export const rowOf = (label: string) =>
  screen.getByText(label).closest('tr') as HTMLElement

/** Đăng ký đồng hồ giả (chỉ Date) và danh sách mặc định cho từng test. */
export const setupSpecialMonthTest = (): void => {
  beforeEach(() => {
    // Chỉ giả Date: giữ nguyên timer thật cho MSW và Testing Library.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-09T03:00:00Z'))
    listRequests.length = 0
    mockList(months)
  })

  afterEach(() => vi.useRealTimers())
}
