import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { feedback } from '@components/index'
import { server } from '@/test/mocks/server'
import {
  MASTER_PATH,
  SUB_PATH,
  masterRow,
  mockConfig,
  mockList,
  renderPage,
  scopedConfig,
  subRow
} from './paymentMethod.setup'

afterEach(() => {
  sessionStorage.clear()
  vi.restoreAllMocks()
})

const subOverride = scopedConfig({
  level: 'SUB',
  source: 'SUB',
  methods: ['QR', 'DOMESTIC_CARD'],
  version: 7
})

const openSubRow = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.click(
    await screen.findByRole('button', { name: 'Cập nhật Chi nhánh Cầu Giấy' })
  )
  return screen.findByRole('dialog', {
    name: 'Cập nhật hình thức thanh toán · Chi nhánh Cầu Giấy'
  })
}

describe('PaymentMethod — cấu hình cấp Sub-merchant', () => {
  it('sửa dòng Sub: GET route Sub, PATCH ghi đè kèm version của chính Sub', async () => {
    mockList([masterRow, subRow])
    mockConfig(SUB_PATH, subOverride)
    let body: unknown
    let patchUrl: URL | undefined
    server.use(
      http.patch(`*/merchants/${SUB_PATH}`, async ({ request }) => {
        patchUrl = new URL(request.url)
        body = await request.json()
        return HttpResponse.json({ data: subOverride })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await openSubRow(user)
    expect(
      await screen.findByText('Ghi đè riêng cho Sub-merchant')
    ).toBeInTheDocument()
    expect(screen.getByRole('switch', { name: 'Thẻ nội địa' })).toBeChecked()
    expect(screen.getByRole('switch', { name: 'Thẻ quốc tế' })).toBeDisabled()
    await user.click(screen.getByRole('switch', { name: 'Ví liên kết' }))
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Mở ví liên kết')
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() => expect(body).toBeDefined())
    expect(patchUrl?.search).toBe('')
    expect(body).toEqual({
      enabledMethods: ['QR', 'DOMESTIC_CARD', 'LINKED_WALLET'],
      active: true,
      version: 7,
      reason: 'Mở ví liên kết'
    })
  })

  it('chọn Sub từ Master: Sub đang kế thừa thì PATCH không gửi version', async () => {
    mockList([masterRow])
    mockConfig(MASTER_PATH, scopedConfig({ source: 'MASTER' }))
    mockConfig(
      SUB_PATH,
      scopedConfig({ level: 'SUB', source: 'MASTER', version: 3 })
    )
    let subQuery: URLSearchParams | undefined
    let body: unknown
    server.use(
      http.get('*/sub-merchants', ({ request }) => {
        subQuery = new URL(request.url).searchParams
        return HttpResponse.json({
          data: {
            content: [
              {
                id: 'sub-1',
                code: 'S001',
                name: 'Chi nhánh Cầu Giấy',
                status: 'ACTIVE',
                merchantId: 'merchant-1'
              }
            ],
            totalElements: 1,
            number: 0,
            size: 10
          }
        })
      }),
      http.patch(`*/merchants/${SUB_PATH}`, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: subOverride })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await user.click(
      await screen.findByRole('button', { name: 'Cập nhật Merchant A' })
    )
    await screen.findByText('Dùng mặc định hệ thống')
    // Input của Segmented có `pointer-events: none`; bấm thẳng vào radio.
    fireEvent.click(screen.getByRole('radio', { name: 'Sub-merchant' }))
    // Hai modal antd trong test cùng aria-labelledby nên tìm theo nút chọn.
    await user.click(
      await screen.findByRole('button', {
        name: 'Chọn Sub-merchant Chi nhánh Cầu Giấy'
      })
    )
    expect(subQuery?.get('merchantId')).toBe('merchant-1')
    expect(subQuery?.get('status')).toBe('ACTIVE')
    expect(await screen.findByText('Kế thừa từ Master')).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Quay về kế thừa Master' })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('switch', { name: 'Thẻ nội địa' }))
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Ghi đè')
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() => expect(body).toBeDefined())
    expect(body).toEqual({
      enabledMethods: ['QR', 'DOMESTIC_CARD'],
      active: true,
      reason: 'Ghi đè'
    })
  })

  it('Quay về kế thừa Master: DELETE route Sub với reason và version trên query', async () => {
    mockList([masterRow, subRow])
    mockConfig(SUB_PATH, subOverride)
    let deleteUrl: URL | undefined
    server.use(
      http.delete(`*/merchants/${SUB_PATH}`, ({ request }) => {
        deleteUrl = new URL(request.url)
        return HttpResponse.json({
          data: scopedConfig({ level: 'SUB', source: 'MASTER' })
        })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await openSubRow(user)
    const back = await screen.findByRole('button', {
      name: 'Quay về kế thừa Master'
    })
    await user.click(back)
    expect(
      await screen.findByText('Vui lòng nhập lý do thay đổi')
    ).toBeInTheDocument()
    expect(deleteUrl).toBeUndefined()
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Dùng lại Master')
    await user.click(back)
    await waitFor(() => expect(deleteUrl).toBeDefined())
    expect(Object.fromEntries(deleteUrl?.searchParams ?? [])).toEqual({
      reason: 'Dùng lại Master',
      version: '7'
    })
  })

  it('lỗi 5506 hiện câu tiếng Việt thay cho mã INTERNATIONAL_CARD_CONTRACT_REQUIRED', async () => {
    mockList([masterRow, subRow])
    mockConfig(
      SUB_PATH,
      scopedConfig({
        level: 'SUB',
        source: 'SUB',
        methods: ['QR', 'INTERNATIONAL_CARD']
      })
    )
    server.use(
      http.patch(`*/merchants/${SUB_PATH}`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'MERCHANT_PAYMENT_METHOD_INELIGIBLE',
            status: '5506',
            detail: 'INTERNATIONAL_CARD_CONTRACT_REQUIRED'
          },
          { status: 400 }
        )
      )
    )
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    const user = userEvent.setup()
    renderPage()
    await openSubRow(user)
    await screen.findByText('Ghi đè riêng cho Sub-merchant')
    await user.type(screen.getByLabelText(/Lý do thay đổi/), 'Giữ nguyên')
    await user.click(screen.getByRole('button', { name: 'Cập nhật' }))
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Không thể bật hình thức thanh toán: ĐVCNTT chưa có hợp đồng thẻ quốc tế'
      )
    )
  })
})
