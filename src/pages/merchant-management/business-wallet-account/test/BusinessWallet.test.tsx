import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import type {
  ContentAccountWallet,
  DataAccountWallet
} from '@type/responseAccountWallet'
import { renderWithProviders } from '@/test/render'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'

import BusinessWallet from '../pages/BusinessWallet'

const businessWallet: ContentAccountWallet = {
  id: 'wallet-business-1',
  ownerId: 'merchant-001',
  ownerType: 'MERCHANT',
  ownerUsername: 'Công ty TNHH Sao Việt',
  glCode: 'MERCHANT_WALLET_VND',
  currency: 'VND',
  totalDebit: 500_000,
  totalCredit: 1_750_000,
  balance: 1_250_000,
  holdBalance: 250_000,
  availableBalance: 1_000_000,
  version: 1,
  status: 'ACTIVE',
  enabled: true,
  checksum: 'checksum',
  lockedReason: '',
  lockedAt: '',
  lockedBy: '',
  createdAt: '2026-09-01T08:30:00',
  updatedAt: '2026-09-02T09:30:00',
  createdBy: 'admin.cms',
  updatedBy: 'admin.cms',
  linkedBanks: []
}

const accountPage = (
  content: ContentAccountWallet[] = [businessWallet],
  totalElements = content.length
): DataAccountWallet => ({
  content,
  pageable: {
    pageNumber: 0,
    pageSize: 10,
    sort: { empty: true, unsorted: true, sorted: false },
    offset: 0,
    unpaged: false,
    paged: true
  },
  last: true,
  totalElements,
  totalPages: totalElements > 10 ? 2 : 1,
  size: 10,
  number: 0,
  first: true,
  sort: { empty: true, unsorted: true, sorted: false },
  numberOfElements: content.length,
  empty: content.length === 0
})

const respondWithAccounts = (data = accountPage()) =>
  HttpResponse.json({
    data,
    message: 'success',
    success: true,
    status: '1000'
  })

const renderWithPermissions = (permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BusinessWallet />
      </MemoryRouter>
    </Provider>
  )
}

describe('BusinessWallet', () => {
  it('gọi API với phân trang mặc định và khóa loại ví BUSINESS', async () => {
    let requestedUrl = ''
    server.use(
      http.get('*/wallet/accounts', ({ request }) => {
        requestedUrl = request.url
        return respondWithAccounts()
      })
    )

    renderWithProviders(<BusinessWallet />)

    expect(
      await screen.findByText('Công ty TNHH Sao Việt')
    ).toBeInTheDocument()
    expect(screen.getByText('1,250,000')).toBeInTheDocument()
    expect(screen.getByText('Hoạt động')).toBeInTheDocument()
    expect(screen.getByText('1 bản ghi')).toBeInTheDocument()

    const params = new URL(requestedUrl).searchParams
    expect(params.get('page')).toBe('1')
    expect(params.get('size')).toBe('10')
    expect(params.get('walletType')).toBe('BUSINESS')
    expect(screen.queryByLabelText('Loại ví')).not.toBeInTheDocument()
  })

  it('gửi bộ lọc đã chuẩn hóa và xóa bộ lọc mà vẫn giữ BUSINESS', async () => {
    const requestedUrls: string[] = []
    server.use(
      http.get('*/wallet/accounts', ({ request }) => {
        requestedUrls.push(request.url)
        return respondWithAccounts()
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<BusinessWallet />)
    await screen.findByText('Công ty TNHH Sao Việt')

    await user.type(screen.getByLabelText('Tên doanh nghiệp'), '  Sao Việt  ')
    await user.type(screen.getByLabelText('Mã chủ ví'), '  merchant-001  ')
    await user.click(screen.getByLabelText('Trạng thái ví'))
    await user.click(await screen.findByTitle('Hoạt động'))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => {
      const params = new URL(requestedUrls.at(-1) ?? '').searchParams
      expect(params.get('username')).toBe('Sao Việt')
      expect(params.get('ownerId')).toBe('merchant-001')
      expect(params.get('status')).toBe('ACTIVE')
      expect(params.get('walletType')).toBe('BUSINESS')
    })

    await user.click(screen.getByRole('button', { name: 'Xóa bộ lọc' }))

    await waitFor(() => {
      const params = new URL(requestedUrls.at(-1) ?? '').searchParams
      expect(params.has('username')).toBe(false)
      expect(params.has('ownerId')).toBe(false)
      expect(params.has('status')).toBe(false)
      expect(params.get('walletType')).toBe('BUSINESS')
    })
  })

  it('gửi đúng trang tiếp theo khi người dùng phân trang', async () => {
    const requestedPages: string[] = []
    server.use(
      http.get('*/wallet/accounts', ({ request }) => {
        const page = new URL(request.url).searchParams.get('page') ?? ''
        requestedPages.push(page)
        return respondWithAccounts(accountPage([businessWallet], 15))
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<BusinessWallet />)
    await screen.findByText('Công ty TNHH Sao Việt')
    await user.click(screen.getByTitle('2'))

    await waitFor(() => expect(requestedPages.at(-1)).toBe('2'))
  })

  it('hiển thị skeleton trong lúc tải lần đầu', () => {
    server.use(
      http.get('*/wallet/accounts', async () => {
        await delay('infinite')
        return respondWithAccounts()
      })
    )

    renderWithProviders(<BusinessWallet />)

    expect(
      screen.getByRole('region', { name: 'Danh sách ví doanh nghiệp' })
    ).toHaveAttribute('aria-busy', 'true')
    expect(
      screen.getByRole('status', {
        name: 'Đang tải danh sách ví doanh nghiệp'
      })
    ).toBeInTheDocument()
  })

  it('hiển thị trạng thái rỗng khi không có ví phù hợp', async () => {
    server.use(
      http.get('*/wallet/accounts', () => respondWithAccounts(accountPage([])))
    )

    renderWithProviders(<BusinessWallet />)

    expect(await screen.findByText('Chưa có ví doanh nghiệp')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Làm mới dữ liệu' })
    ).toBeInTheDocument()
  })

  it('cho phép thử lại sau khi API lỗi', async () => {
    let requestCount = 0
    server.use(
      http.get('*/wallet/accounts', () => {
        requestCount += 1
        if (requestCount === 1) {
          return HttpResponse.json(
            { message: 'INTERNAL_SERVER_ERROR' },
            { status: 500 }
          )
        }
        return respondWithAccounts()
      })
    )
    const user = userEvent.setup()

    renderWithProviders(<BusinessWallet />)

    expect(
      await screen.findByRole('alert')
    ).toHaveTextContent('Không tải được danh sách ví doanh nghiệp')
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(
      await screen.findByText('Công ty TNHH Sao Việt')
    ).toBeInTheDocument()
    expect(requestCount).toBe(2)
  })

  it('hiện nút Thêm mới khi có quyền tạo', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))
    renderWithPermissions(['EWALLET:MERCHANT:CREATE'])

    expect(
      await screen.findByRole('button', { name: /Thêm mới ví doanh nghiệp/ })
    ).toBeInTheDocument()
  })

  it('ẩn nút Thêm mới khi thiếu quyền tạo', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))
    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Công ty TNHH Sao Việt')

    expect(
      screen.queryByRole('button', { name: /Thêm mới ví doanh nghiệp/ })
    ).toBeNull()
  })

  it('ẩn nút Sửa khi thiếu quyền cập nhật', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))
    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Công ty TNHH Sao Việt')

    expect(
      screen.queryByRole('button', { name: 'Sửa hồ sơ ví doanh nghiệp' })
    ).toBeNull()
  })

  it('hiện nút Sửa khi có quyền cập nhật', async () => {
    server.use(http.get('*/wallet/accounts', () => respondWithAccounts()))
    renderWithPermissions(['EWALLET:MERCHANT:UPDATE'])

    expect(
      await screen.findByRole('button', { name: 'Sửa hồ sơ ví doanh nghiệp' })
    ).toBeInTheDocument()
  })
})
