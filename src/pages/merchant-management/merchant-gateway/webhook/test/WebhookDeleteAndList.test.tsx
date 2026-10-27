import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import {
  CHALLENGE,
  submitOtp
} from '../../key-connection/test/keyConnection.setup'
import { WebhookDeleteDialog } from '../components/WebhookDeleteDialog'
import { WebhookDeliveries } from '../components/WebhookDeliveries'
import { WebhookListPanel } from '../components/WebhookListPanel'

vi.setConfig({ testTimeout: 30000 })

const LIST_ROW = {
  merchantId: 'merchant-1',
  merchantCode: 'MC0001',
  merchantName: 'Công ty Cà phê Mộc',
  subMerchantId: 'sub-1',
  subMerchantCode: 'SB0001',
  subMerchantName: 'Quầy 1',
  level: 'SUB',
  source: 'INHERITED',
  url: 'https://master.test/ipn',
  enabled: true,
  rowRevision: 0,
  updatedAt: '2026-10-22T03:00:00Z',
  updatedBy: 'u-1',
  lastDeliveryStatus: 'DELIVERED',
  lastDeliveryAt: '2026-10-25T03:00:00Z'
}

describe('danh sách webhook Master và Sub', () => {
  it('gọi /merchants/webhooks với page 1, hiện cấp, nguồn, giao gần nhất và mở dòng Sub', async () => {
    const user = userEvent.setup()
    const queries: URLSearchParams[] = []
    const onOpen = vi.fn()
    server.use(
      http.get('*/merchants/webhooks', ({ request }) => {
        queries.push(new URL(request.url).searchParams)
        return HttpResponse.json({
          data: {
            content: [LIST_ROW],
            totalElements: 1,
            number: 1,
            size: 20
          }
        })
      })
    )
    renderWithProviders(<WebhookListPanel onOpen={onOpen} />)

    expect(await screen.findByText('Quầy 1')).toBeInTheDocument()
    expect(queries[0].get('page')).toBe('1')
    expect(screen.getByText('Kế thừa Master')).toBeInTheDocument()
    expect(screen.getByText('Đã gửi')).toBeInTheDocument()

    await user.type(screen.getByLabelText('Từ khóa'), 'Quầy')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() => expect(queries.at(-1)?.get('search')).toBe('Quầy'))

    await user.click(screen.getByLabelText('Chi tiết webhook Quầy 1'))
    expect(onOpen).toHaveBeenCalledWith(
      expect.objectContaining({ subMerchantId: 'sub-1' })
    )
  })
})

describe('lịch sử gửi IPN theo Sub', () => {
  it('gửi subMerchantId và page 0', async () => {
    let query: URLSearchParams | undefined
    server.use(
      http.get('*/merchants/merchant-1/webhook/deliveries', ({ request }) => {
        query = new URL(request.url).searchParams
        return HttpResponse.json({
          data: { content: [], totalElements: 0, number: 0, size: 20 }
        })
      })
    )
    renderWithProviders(
      <WebhookDeliveries
        merchantId='merchant-1'
        subMerchantId='sub-1'
      />
    )
    await screen.findByText('Chưa có sự kiện gửi IPN nào')
    expect(query?.get('subMerchantId')).toBe('sub-1')
    expect(query?.get('page')).toBe('0')
  })
})

describe('WebhookDeleteDialog', () => {
  it('xin OTP rồi POST /webhook/delete kèm sensitiveOtp, không dùng DELETE', async () => {
    const user = userEvent.setup()
    const challenge: unknown[] = []
    const deletes: unknown[] = []
    const onClose = vi.fn()
    server.use(
      http.post(
        '*/merchants/merchant-1/webhook/delete-otp-challenge',
        async ({ request }) => {
          challenge.push(await request.json())
          return HttpResponse.json({ data: CHALLENGE })
        }
      ),
      http.post(
        '*/merchants/merchant-1/webhook/delete',
        async ({ request }) => {
          deletes.push(await request.json())
          return HttpResponse.json({
            data: {
              merchantId: 'merchant-1',
              subMerchantId: 'sub-1',
              inherited: true,
              rowRevision: 0,
              enabled: true
            }
          })
        }
      )
    )
    renderWithProviders(
      <WebhookDeleteDialog
        merchantId='merchant-1'
        subMerchantId='sub-1'
        scopeLabel='Sub-merchant Quầy 1'
        rowRevision={3}
        onClose={onClose}
      />
    )

    await user.type(screen.getByLabelText(/Lý do xóa/), '  Quay về Master  ')
    await user.click(screen.getByRole('button', { name: /Xóa cấu hình riêng/ }))
    await submitOtp(user, '123456')

    await waitFor(() => expect(deletes).toHaveLength(1))
    const body = {
      subMerchantId: 'sub-1',
      expectedRevision: 3,
      reason: 'Quay về Master'
    }
    expect(challenge).toEqual([body])
    expect(deletes).toEqual([
      {
        ...body,
        sensitiveOtp: { otpSessionId: 'otp-session-1', otp: '123456' }
      }
    ])
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('thiếu lý do thì chặn ở FE, không xin OTP', async () => {
    const user = userEvent.setup()
    let challenged = false
    server.use(
      http.post('*/merchants/merchant-1/webhook/delete-otp-challenge', () => {
        challenged = true
        return HttpResponse.json({ data: CHALLENGE })
      })
    )
    renderWithProviders(
      <WebhookDeleteDialog
        merchantId='merchant-1'
        subMerchantId='sub-1'
        scopeLabel='Sub-merchant Quầy 1'
        rowRevision={3}
        onClose={() => undefined}
      />
    )
    await user.click(screen.getByRole('button', { name: /Xóa cấu hình riêng/ }))
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Vui lòng nhập lý do xóa'
    )
    expect(challenged).toBe(false)
  })
})
