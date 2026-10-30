import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { PERMISSION } from '@/app/permissions/permission-codes'
import { SCREENS } from '@/app/permissions/registry'
import type { EscrowConfigRequest } from '@/pages/merchant-management/merchant-escrow/types/merchantEscrow.types'
import { escrowApi } from '../merchantEscrowApi'

const cfg: EscrowConfigRequest = {
  expectedVersion: 1,
  requirementMode: 'FIXED',
  fixedAmount: 1_000_000,
  revenueDays: null,
  minAmount: null,
  maxAmount: null,
  reviewCycle: 'NONE',
  allowTransfer: true,
  allowSetoff: false,
  setoffAcknowledged: false,
  deadlineDays: 30,
  reminderDays: 7,
  overdueAction: 'WARN_ONLY',
  reason: 'Tăng mức'
}

describe('merchantEscrowApi', () => {
  it('saveEscrowConfig gửi PUT kèm sensitiveOtp và trả SaveResult', async () => {
    let body: Record<string, unknown> = {}
    server.use(
      http.put('*/merchant-escrows/m-1/config', async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({
          data: { outcome: 'PENDING_APPROVAL', version: { id: 'v-2' } }
        })
      })
    )
    const store = createAppStore()
    const r = await store
      .dispatch(
        escrowApi.endpoints.saveEscrowConfig.initiate({
          masterId: 'm-1',
          body: { ...cfg, sensitiveOtp: { otpSessionId: 's-1', otp: '143256' } }
        })
      )
      .unwrap()
    expect(body.sensitiveOtp).toEqual({ otpSessionId: 's-1', otp: '143256' })
    expect(r.outcome).toBe('PENDING_APPROVAL')
  })

  it('rejectEscrowConfig gửi note trên query string, không có body', async () => {
    let url = ''
    let text = 'unset'
    server.use(
      http.post(
        '*/merchant-escrows/config-proposals/p-1/reject',
        async ({ request }) => {
          url = request.url
          text = await request.text()
          return HttpResponse.json({ data: { id: 'p-1' } })
        }
      )
    )
    const store = createAppStore()
    await store
      .dispatch(
        escrowApi.endpoints.rejectEscrowConfig.initiate({
          id: 'p-1',
          note: 'Sai mức'
        })
      )
      .unwrap()
    expect(new URL(url).searchParams.get('note')).toBe('Sai mức')
    expect(url).toMatch(/\/config-proposals\/p-1\/reject\?note=/)
    expect(text).toBe('')
  })

  it('challengeEscrowOrderDecision gắn reject=true vào query', async () => {
    let search = ''
    server.use(
      http.post('*/merchant-escrow-orders/o-1/otp-challenge', ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json({
          data: {
            otpSessionId: 's',
            maskedRecipient: 'a***',
            expiresInSeconds: 300,
            canResendAfterSeconds: 30
          }
        })
      })
    )
    const store = createAppStore()
    const r = await store
      .dispatch(
        escrowApi.endpoints.challengeEscrowOrderDecision.initiate({
          id: 'o-1',
          reject: true
        })
      )
      .unwrap()
    expect(search).toBe('?reject=true')
    expect(r.otpSessionId).toBe('s')
  })

  it('getEscrowReturns trả mảng (không phải page)', async () => {
    server.use(
      http.get('*/merchant-escrow-returns', () =>
        HttpResponse.json({ data: [{ id: 'r-1' }, { id: 'r-2' }] })
      )
    )
    const store = createAppStore()
    const r = await store
      .dispatch(escrowApi.endpoints.getEscrowReturns.initiate({}))
      .unwrap()
    expect(Array.isArray(r)).toBe(true)
    expect(r).toHaveLength(2)
  })

  it('getEscrowOrderDocumentReadUrl gọi GET read-url theo fileRef và không cache giữa hai lần bấm', async () => {
    let calls = 0
    server.use(
      http.get(
        '*/merchant-escrow-orders/o-1/documents/f-1/read-url',
        ({ request }) => {
          calls += 1
          expect(request.method).toBe('GET')
          return HttpResponse.json({
            data: { url: `https://files/x?sig=${calls}`, expiresAt: '2026-10-30T10:05:00' }
          })
        }
      )
    )
    const store = createAppStore()
    const read = () =>
      store
        .dispatch(
          escrowApi.endpoints.getEscrowOrderDocumentReadUrl.initiate({
            id: 'o-1',
            fileId: 'f-1'
          })
        )
        .unwrap()
    expect((await read()).url).toBe('https://files/x?sig=1')
    expect((await read()).url).toBe('https://files/x?sig=2')
  })

  it('cancelEscrowOrder gửi reason trên query', async () => {
    let search = ''
    server.use(
      http.post('*/merchant-escrow-orders/o-1/cancel', ({ request }) => {
        search = new URL(request.url).search
        return HttpResponse.json({ data: { id: 'o-1' } })
      })
    )
    const store = createAppStore()
    await store
      .dispatch(
        escrowApi.endpoints.cancelEscrowOrder.initiate({
          id: 'o-1',
          reason: 'Nhập nhầm'
        })
      )
      .unwrap()
    expect(new URL('http://x/' + search).searchParams.get('reason')).toBe(
      'Nhập nhầm'
    )
  })

  it('setEscrowObligationWait gửi PUT { days }', async () => {
    let body: Record<string, unknown> = {}
    server.use(
      http.put(
        '*/merchant-escrow-returns/obligation-wait/m-1',
        async ({ request }) => {
          body = (await request.json()) as Record<string, unknown>
          return HttpResponse.json({ data: 60 })
        }
      )
    )
    const store = createAppStore()
    const r = await store
      .dispatch(
        escrowApi.endpoints.setEscrowObligationWait.initiate({
          masterId: 'm-1',
          days: 60
        })
      )
      .unwrap()
    expect(body).toEqual({ days: 60 })
    expect(r).toBe(60)
  })
})

describe('Quyền và màn ký quỹ', () => {
  it('khai đúng mã quyền và màn', () => {
    expect(PERMISSION.MERCHANT_ESCROW_VIEW).toBe('EWALLET:MERCHANT_ESCROW:VIEW')
    expect(PERMISSION.MERCHANT_ESCROW_ORDER_APPROVE_SENIOR).toBe(
      'EWALLET:MERCHANT_ESCROW_ORDER:APPROVE_SENIOR'
    )
    expect(SCREENS.MERCHANT_ESCROW_DETAIL.path).toMatch(/\/escrow\/:masterId$/)
    expect(SCREENS.MERCHANT_ESCROW_DETAIL.actions.clearBlock).toBe(
      PERMISSION.MERCHANT_ESCROW_ORDER_APPROVE
    )
    expect(SCREENS.MERCHANT_ESCROW_RETURN.actions.approveSenior).toBe(
      PERMISSION.MERCHANT_ESCROW_ORDER_APPROVE_SENIOR
    )
  })
})
