import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { apiEKYC } from '../apiEKYC'

describe('eKYC manual review API', () => {
  it('đọc chi tiết và duyệt bằng sessionId, không gửi request body', async () => {
    const requests: { method: string; pathname: string; body: string }[] = []
    server.use(
      http.get('*/verified-kyc-profiles/session-123', ({ request }) => {
        requests.push({
          method: request.method,
          pathname: new URL(request.url).pathname,
          body: ''
        })
        return HttpResponse.json({
          success: true,
          data: {
            sessionId: 'session-123',
            status: 'PENDING_REVIEW',
            approvalReady: true,
            createdAt: '2026-09-28T11:00:00'
          }
        })
      }),
      http.post(
        '*/verified-kyc-profiles/session-123/approve',
        async ({ request }) => {
          requests.push({
            method: request.method,
            pathname: new URL(request.url).pathname,
            body: await request.text()
          })
          return HttpResponse.json({
            success: true,
            data: { sessionId: 'session-123', status: 'MANUALLY_APPROVED' }
          })
        }
      )
    )
    const store = createAppStore()
    await store.dispatch(apiEKYC.endpoints.getEKYCById.initiate('session-123'))
    await store.dispatch(apiEKYC.endpoints.approveEKYC.initiate('session-123'))

    expect(
      requests
        .slice(0, 2)
        .map(({ method, pathname }) => [
          method,
          pathname.slice(pathname.indexOf('/verified-kyc-profiles'))
        ])
    ).toEqual([
      ['GET', '/verified-kyc-profiles/session-123'],
      ['POST', '/verified-kyc-profiles/session-123/approve']
    ])
    expect(requests[1].body).toBe('')
  })

  it('không coi HTTP 200 success=false là duyệt thành công', async () => {
    server.use(
      http.post('*/verified-kyc-profiles/session-123/approve', () =>
        HttpResponse.json({
          success: false,
          detail: 'Phiên đã được thay thế',
          status: '1005'
        })
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      apiEKYC.endpoints.approveEKYC.initiate('session-123')
    )
    expect(result).toHaveProperty('error')
  })

  it('coi wrapper success=false của search và detail là lỗi truy vấn', async () => {
    server.use(
      http.get('*/verified-kyc-profiles/search', () =>
        HttpResponse.json({ success: false, detail: 'Không có quyền xem eKYC' })
      ),
      http.get('*/verified-kyc-profiles/session-denied', () =>
        HttpResponse.json({ success: false, detail: 'Phiên không còn hợp lệ' })
      )
    )
    const store = createAppStore()
    const search = await store.dispatch(
      apiEKYC.endpoints.getEKYCSearch.initiate({ page: 1, size: 10 })
    )
    const detail = await store.dispatch(
      apiEKYC.endpoints.getEKYCById.initiate('session-denied')
    )
    expect(search).toHaveProperty('error')
    expect(detail).toHaveProperty('error')
  })

  it('mở lại eKYC: POST /restore bằng profileId, không body, trả detail', async () => {
    const requests: { pathname: string; body: string }[] = []
    server.use(
      http.post(
        '*/verified-kyc-profiles/profile-9/restore',
        async ({ request }) => {
          requests.push({
            pathname: new URL(request.url).pathname,
            body: await request.text()
          })
          return HttpResponse.json({
            success: true,
            data: 'profile-9',
            detail: 'Khôi phục eKYC thành công'
          })
        }
      )
    )
    const store = createAppStore()
    const result = await store.dispatch(
      apiEKYC.endpoints.restoreVerifiedKycProfile.initiate('profile-9')
    )

    expect(result).toMatchObject({
      data: { profileId: 'profile-9', detail: 'Khôi phục eKYC thành công' }
    })
    expect(requests).toHaveLength(1)
    expect(requests[0].pathname).toMatch(
      /\/verified-kyc-profiles\/profile-9\/restore$/
    )
    expect(requests[0].body).toBe('')
  })

  it('mở lại eKYC: success=false hoặc lỗi 400 là thất bại', async () => {
    server.use(
      http.post('*/verified-kyc-profiles/profile-1/restore', () =>
        HttpResponse.json({ success: false }, { status: 200 })
      ),
      http.post('*/verified-kyc-profiles/profile-2/restore', () =>
        HttpResponse.json(
          {
            success: false,
            detail: 'Chỉ hồ sơ eKYC đã bị hủy mới có thể khôi phục.'
          },
          { status: 400 }
        )
      )
    )
    const store = createAppStore()
    const first = await store.dispatch(
      apiEKYC.endpoints.restoreVerifiedKycProfile.initiate('profile-1')
    )
    const second = await store.dispatch(
      apiEKYC.endpoints.restoreVerifiedKycProfile.initiate('profile-2')
    )
    expect(first.error).toBeDefined()
    expect(second.error).toMatchObject({
      data: { detail: 'Chỉ hồ sơ eKYC đã bị hủy mới có thể khôi phục.' }
    })
  })
})
