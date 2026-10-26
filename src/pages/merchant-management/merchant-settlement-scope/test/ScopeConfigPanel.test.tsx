import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import { ScopeConfigPanel } from '../components/ScopeConfigPanel'
import { masterView, systemView } from './scopeConfig.setup'

const MASTER_URL = '*/merchants/m-1/settlement-config'
const SYSTEM_URL = '*/settlement-config/system'
const VIEW = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW
const UPDATE = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_UPDATE
const APPROVE = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_APPROVE
const REASON_LABEL = 'Lý do thay đổi (tối thiểu 10 ký tự)'

describe('ScopeConfigPanel', { timeout: 20000 }, () => {
  it('Master: hiện nguồn từng trường và PUT đúng body kèm lý do', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    const puts: unknown[] = []
    server.use(
      http.get(MASTER_URL, () => HttpResponse.json({ data: masterView() })),
      http.put(MASTER_URL, async ({ request }) => {
        puts.push(await request.json())
        return HttpResponse.json({ data: masterView() })
      })
    )
    renderWithStore(<ScopeConfigPanel masterId='m-1' />, [VIEW, UPDATE])
    expect(
      await screen.findByText('Cấu hình đang hiệu lực')
    ).toBeInTheDocument()
    expect(screen.getAllByText('Mặc định hệ thống').length).toBeGreaterThan(0)
    await user.type(
      screen.getByLabelText(REASON_LABEL),
      'Điều chỉnh theo phụ lục mới'
    )
    await user.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    await waitFor(() => expect(success).toHaveBeenCalled())
    expect(puts).toEqual([
      {
        settlementMode: 'MANUAL_ONLY',
        holdbackDays: 2,
        reason: 'Điều chỉnh theo phụ lục mới'
      }
    ])
    success.mockRestore()
  })

  it('lý do dưới 10 ký tự thì không gọi API', async () => {
    const user = userEvent.setup()
    let called = false
    server.use(
      http.get(MASTER_URL, () => HttpResponse.json({ data: masterView() })),
      http.put(MASTER_URL, () => {
        called = true
        return HttpResponse.json({ data: masterView() })
      })
    )
    renderWithStore(<ScopeConfigPanel masterId='m-1' />, [VIEW, UPDATE])
    await user.type(await screen.findByLabelText(REASON_LABEL), 'ngắn')
    await user.click(screen.getByRole('button', { name: 'Lưu cấu hình' }))
    expect(await screen.findByText('Tối thiểu 10 ký tự')).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('chỉ có quyền xem thì ẩn form và nút gỡ', async () => {
    server.use(
      http.get(MASTER_URL, () => HttpResponse.json({ data: masterView() }))
    )
    renderWithStore(<ScopeConfigPanel masterId='m-1' />, [VIEW])
    expect(
      await screen.findByText('Cấu hình đang hiệu lực')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu cấu hình' })).toBeNull()
    expect(
      screen.queryByRole('button', { name: 'Gỡ cấu hình riêng' })
    ).toBeNull()
  })

  it('Hệ thống: thiếu APPROVE thì ẩn nút lưu; có APPROVE thì PUT canonical', async () => {
    const user = userEvent.setup()
    const puts: unknown[] = []
    server.use(
      http.get(SYSTEM_URL, () => HttpResponse.json({ data: systemView() })),
      http.put(SYSTEM_URL, async ({ request }) => {
        puts.push(await request.json())
        return HttpResponse.json({ data: systemView() })
      })
    )
    const first = renderWithStore(<ScopeConfigPanel />, [VIEW, UPDATE])
    await screen.findByText('Cấu hình đang hiệu lực')
    expect(
      screen.queryByRole('button', { name: 'Lưu mặc định hệ thống' })
    ).toBeNull()
    first.unmount()

    renderWithStore(<ScopeConfigPanel />, [VIEW, APPROVE])
    await user.type(
      await screen.findByLabelText(REASON_LABEL),
      'Rút ngắn chu kỳ mặc định'
    )
    await user.click(
      screen.getByRole('button', { name: 'Lưu mặc định hệ thống' })
    )
    await waitFor(() => expect(puts).toHaveLength(1))
    expect(puts[0]).toEqual({
      settlementMode: 'MANUAL_ONLY',
      autoFrequency: 'DAILY',
      holdbackDays: 3,
      reason: 'Rút ngắn chu kỳ mặc định'
    })
  })
})
