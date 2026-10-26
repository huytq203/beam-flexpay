import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { feedback } from '@components/index'
import { server } from '@/test/mocks/server'
import {
  MASTER_PATH,
  mockConfig,
  mockList,
  renderPage,
  scopedConfig
} from './paymentMethod.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

const openMaster = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole('button', { name: 'Cập nhật Merchant A' })
  )
  await screen.findByRole('switch', { name: 'Dùng mặc định hệ thống' })
}

describe('PaymentMethod — lưu cấp Master', () => {
  it('PATCH không kèm subMerchantId, không gửi methodLimits, kèm version của Master', async () => {
    mockList()
    mockConfig(MASTER_PATH, scopedConfig({ source: 'MASTER', version: 3 }))
    let url: URL | undefined
    let body: unknown
    server.use(
      http.patch(`*/merchants/${MASTER_PATH}`, async ({ request }) => {
        url = new URL(request.url)
        body = await request.json()
        return HttpResponse.json({ data: scopedConfig() })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await openMaster(user)
    await user.click(screen.getByRole('switch', { name: 'Thẻ nội địa' }))
    await user.click(
      screen.getByRole('switch', { name: 'Cấu hình đang hoạt động' })
    )
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Bật thẻ')
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() => expect(body).toBeDefined())
    expect(url?.searchParams.has('subMerchantId')).toBe(false)
    expect(body).toEqual({
      enabledMethods: ['QR', 'DOMESTIC_CARD'],
      active: false,
      version: 3,
      reason: 'Bật thẻ'
    })
  })

  it('chuyển Master về mặc định hệ thống dùng PUT inherit vì PATCH cấm (5509)', async () => {
    mockList()
    mockConfig(MASTER_PATH, scopedConfig({ source: 'MASTER' }))
    let body: unknown
    server.use(
      http.put(`*/merchants/${MASTER_PATH}`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: scopedConfig() })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await openMaster(user)
    await user.click(
      screen.getByRole('switch', { name: 'Dùng mặc định hệ thống' })
    )
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Về mặc định')
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() => expect(body).toBeDefined())
    expect(body).toEqual({ inherit: true, reason: 'Về mặc định' })
  })

  it('xung đột version 5507 thì báo lỗi và tải lại cấu hình', async () => {
    mockList()
    let gets = 0
    server.use(
      http.get(`*/merchants/${MASTER_PATH}`, () => {
        gets += 1
        return HttpResponse.json({ data: scopedConfig() })
      }),
      http.patch(`*/merchants/${MASTER_PATH}`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'MERCHANT_PAYMENT_METHOD_VERSION_CONFLICT',
            status: '5507',
            detail: 'Cấu hình hình thức thanh toán đã thay đổi'
          },
          { status: 409 }
        )
      )
    )
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    renderPage()
    await openMaster(user)
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Sửa')
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Cấu hình hình thức thanh toán đã thay đổi'
      )
    )
    await waitFor(() => expect(gets).toBe(2))
  })
})

describe('PaymentMethod — xuất CSV', () => {
  it('gửi keyword theo bộ lọc tên hiện tại', async () => {
    mockList()
    let url: URL | undefined
    server.use(
      http.get('*/merchants/payment-methods/export', ({ request }) => {
        url = new URL(request.url)
        return new HttpResponse('"a"', {
          headers: { 'Content-Type': 'text/csv;charset=UTF-8' }
        })
      })
    )
    const user = userEvent.setup()
    renderPage([PERMISSION.MERCHANT_PAYMENT_METHOD_VIEW])
    await screen.findByText('Merchant A')
    await user.type(screen.getByLabelText('Tên Merchant'), 'Merchant')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await user.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(url).toBeDefined())
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({
      keyword: 'Merchant'
    })
  })

  it('ẩn nút xuất khi không có quyền xem', async () => {
    mockList()
    renderPage([PERMISSION.MERCHANT_PAYMENT_METHOD_MANAGE])
    await screen.findByText('Merchant A')
    expect(
      screen.queryByRole('button', { name: /Xuất CSV/ })
    ).not.toBeInTheDocument()
  })
})
