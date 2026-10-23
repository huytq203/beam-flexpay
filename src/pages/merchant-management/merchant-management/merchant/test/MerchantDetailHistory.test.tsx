import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import {
  emptyPage,
  mockMerchantDetail,
  renderMerchantDetail
} from './merchantDetail.setup'

const historyRow = {
  auditLogId: 'a1',
  fromStatus: 'PENDING_APPROVAL',
  toStatus: 'REJECTED',
  reason: null,
  rejectedReasonCode: 'BLURRED_IMAGE',
  rejectedReasonDetail: 'Ảnh CCCD bị mờ',
  actorType: 'ADMIN',
  actorId: 'u1',
  actorUsername: 'admin.duyet',
  ipAddress: '10.0.0.1',
  occurredAt: '2026-10-20T09:15:00.123456'
}

const auditRow = {
  id: 'log-1',
  entityName: 'merchants',
  entityId: 'm1',
  action: 'UPDATE',
  actorType: 'ADMIN',
  actorId: 'u1',
  actorUsername: 'admin.sua',
  source: 'ADMIN_PORTAL',
  ipAddress: '10.0.0.2',
  requestId: 'req-1',
  reason: 'Reject merchant registration',
  oldData: '{"status":"PENDING_APPROVAL"}',
  newData: '{"status":"REJECTED"}',
  occurredAt: '2026-10-20T09:15:00'
}

describe('Lịch sử trạng thái và Nhật ký merchant', { timeout: 20000 }, () => {
  it('ẩn hai tab và không gọi API khi thiếu quyền viewHistory', async () => {
    let historyCalls = 0
    mockMerchantDetail()
    server.use(
      http.get('*/merchants/m1/status-history', () => {
        historyCalls += 1
        return HttpResponse.json({ data: emptyPage })
      }),
      http.get('*/merchants/m1/audit-logs', () => {
        historyCalls += 1
        return HttpResponse.json({ data: emptyPage })
      })
    )
    renderMerchantDetail([PERMISSION.MERCHANT_API_VIEW])

    expect(
      await screen.findByRole('heading', { name: 'Công ty A' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('tab', { name: 'Lịch sử trạng thái' })).toBeNull()
    expect(screen.queryByRole('tab', { name: 'Nhật ký' })).toBeNull()
    expect(historyCalls).toBe(0)
  })

  it('hiện từ→đến, lý do, người thực hiện; nhật ký gửi sortBy=occurredAt', async () => {
    let historyUrl: URL | undefined
    let auditUrl: URL | undefined
    mockMerchantDetail()
    server.use(
      http.get('*/merchants/m1/status-history', ({ request }) => {
        historyUrl = new URL(request.url)
        return HttpResponse.json({
          data: { ...emptyPage, content: [historyRow], totalElements: 1 }
        })
      }),
      http.get('*/merchants/m1/audit-logs', ({ request }) => {
        auditUrl = new URL(request.url)
        return HttpResponse.json({
          data: { ...emptyPage, content: [auditRow], totalElements: 1 }
        })
      })
    )
    const user = userEvent.setup()
    renderMerchantDetail([PERMISSION.MERCHANT_API_VIEW, PERMISSION.AUDIT_VIEW])

    expect(await screen.findByText('Ảnh CCCD bị mờ')).toBeInTheDocument()
    expect(screen.getByText('Ảnh mờ')).toBeInTheDocument()
    expect(screen.getByText('admin.duyet')).toBeInTheDocument()
    expect(historyUrl?.searchParams.get('page')).toBe('1')

    await user.click(screen.getByRole('tab', { name: 'Nhật ký' }))
    expect(await screen.findByText('admin.sua')).toBeInTheDocument()
    await waitFor(() =>
      expect(auditUrl?.searchParams.get('sortBy')).toBe('occurredAt')
    )
    expect(screen.getByText('ADMIN_PORTAL')).toBeInTheDocument()
    expect(screen.getByText('Reject merchant registration')).toBeInTheDocument()
    await user.click(screen.getByText('Dữ liệu mới'))
    expect(screen.getByText(/"status": "REJECTED"/)).toBeInTheDocument()
  })

  it('lỗi tải lịch sử hiện detail của BE', async () => {
    mockMerchantDetail()
    server.use(
      http.get('*/merchants/m1/status-history', () =>
        HttpResponse.json(
          {
            success: false,
            status: '1003',
            message: 'RESOURCE_NOT_FOUND',
            detail: 'Merchant không tìm thấy với id : m1'
          },
          { status: 404 }
        )
      )
    )
    renderMerchantDetail([PERMISSION.MERCHANT_API_VIEW, PERMISSION.AUDIT_VIEW])

    expect(
      await screen.findByText('Merchant không tìm thấy với id : m1')
    ).toBeInTheDocument()
  })
})
