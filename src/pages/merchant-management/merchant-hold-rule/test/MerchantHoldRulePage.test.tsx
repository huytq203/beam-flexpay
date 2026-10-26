import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import MerchantHoldRulePage from '../pages/MerchantHoldRulePage'
import { BASE, change, mockLists } from './holdRule.setup'

const MANAGE = PERMISSION.MERCHANT_HOLD_RULE_MANAGE
const APPROVE = PERMISSION.MERCHANT_HOLD_RULE_APPROVE
const SYSTEM_URL = '/?level=SYSTEM'
const REASON = 'Tăng tạm giữ theo đánh giá rủi ro'

describe('MerchantHoldRulePage', { timeout: 30000 }, () => {
  it('hàng đợi có cột # và hiện người đề xuất, nhãn tiếng Việt, capBehaviour giữ giá trị gốc', async () => {
    mockLists([
      change({
        proposedConfig: {
          enabled: true,
          capEnabled: true,
          capBehaviour: 'FILL_TO_CAP'
        }
      })
    ])
    renderWithStore(<MerchantHoldRulePage />, [MANAGE])
    const table = await screen.findByRole('table')
    expect(within(table).getAllByText('#').length).toBeGreaterThan(0)
    expect(await within(table).findByText('Trần Lan')).toBeInTheDocument()
    expect(within(table).getByText('Bật trần tích lũy')).toBeInTheDocument()
    expect(within(table).getByText('FILL_TO_CAP')).toBeInTheDocument()
    expect(within(table).getByText('Chờ duyệt')).toBeInTheDocument()
  })

  it('chỉ có quyền đề xuất thì ẩn nút Duyệt/Từ chối; chỉ có quyền duyệt thì ẩn nút đề xuất', async () => {
    mockLists([change()])
    const first = renderWithStore(
      <MerchantHoldRulePage />,
      [MANAGE],
      SYSTEM_URL
    )
    await screen.findByRole('button', { name: 'Đề xuất thay đổi' })
    await screen.findByText('Chờ duyệt')
    expect(screen.queryByRole('button', { name: /^Duyệt đề xuất/ })).toBeNull()
    first.unmount()

    renderWithStore(<MerchantHoldRulePage />, [APPROVE], SYSTEM_URL)
    expect(
      await screen.findByRole('button', { name: 'Duyệt đề xuất phiên bản 3' })
    ).toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: 'Đề xuất thay đổi' })
    ).toBeNull()
  })

  it('SYSTEM gọi lịch sử đúng targetLevel và không gửi targetId', async () => {
    mockLists()
    let url: URL | undefined
    server.use(
      http.get(`${BASE}/history`, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({ data: [] })
      })
    )
    renderWithStore(<MerchantHoldRulePage />, [MANAGE], SYSTEM_URL)
    await waitFor(() => expect(url).toBeDefined())
    expect(url?.searchParams.get('targetLevel')).toBe('SYSTEM')
    expect(url?.searchParams.has('targetId')).toBe(false)
  })

  it('đề xuất SYSTEM gửi đúng body, chỉ khóa tự đặt, rồi báo chờ duyệt', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockLists()
    let body: unknown
    server.use(
      http.post(BASE, async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: change() })
      })
    )
    renderWithStore(<MerchantHoldRulePage />, [MANAGE], SYSTEM_URL)
    await user.click(
      await screen.findByRole('button', { name: 'Đề xuất thay đổi' })
    )
    await user.type(await screen.findByLabelText('Lý do thay đổi'), REASON)
    await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }))
    await waitFor(() => expect(success).toHaveBeenCalled())
    expect(body).toEqual({
      targetLevel: 'SYSTEM',
      config: {
        enabled: true,
        calculationMode: 'PERCENT_OF_GROSS',
        ratePercent: 5,
        holdDays: 7
      },
      reason: REASON
    })
    expect(success).toHaveBeenCalledWith(
      expect.stringContaining('chờ phê duyệt')
    )
    success.mockRestore()
  })

  it('lý do dưới 10 ký tự thì không gọi API', async () => {
    const user = userEvent.setup()
    mockLists()
    let called = false
    server.use(
      http.post(BASE, () => {
        called = true
        return HttpResponse.json({ data: change() })
      })
    )
    renderWithStore(<MerchantHoldRulePage />, [MANAGE], SYSTEM_URL)
    await user.click(
      await screen.findByRole('button', { name: 'Đề xuất thay đổi' })
    )
    await user.type(await screen.findByLabelText('Lý do thay đổi'), 'ngắn')
    await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }))
    expect(
      await screen.findByText('Lý do tối thiểu 10 ký tự')
    ).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('lỗi 5705 hiển thị nguyên detail của BE', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    mockLists()
    server.use(
      http.post(BASE, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'MERCHANT_HOLD_RULE_INVALID',
            detail: 'Tỷ lệ tạm giữ phải lớn hơn 0 và không quá 100',
            status: '5705'
          },
          { status: 400 }
        )
      )
    )
    renderWithStore(<MerchantHoldRulePage />, [MANAGE], SYSTEM_URL)
    await user.click(
      await screen.findByRole('button', { name: 'Đề xuất thay đổi' })
    )
    await user.type(await screen.findByLabelText('Lý do thay đổi'), REASON)
    await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }))
    await waitFor(() =>
      expect(error).toHaveBeenCalledWith(
        'Tỷ lệ tạm giữ phải lớn hơn 0 và không quá 100'
      )
    )
    error.mockRestore()
  })

  it('duyệt gọi POST /{id}/approve và báo thành công', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockLists([change()])
    let approved = false
    server.use(
      http.post(`${BASE}/rule-1/approve`, () => {
        approved = true
        return HttpResponse.json({
          data: change({ approvalStatus: 'APPROVED' })
        })
      })
    )
    renderWithStore(<MerchantHoldRulePage />, [APPROVE], SYSTEM_URL)
    await user.click(
      await screen.findByRole('button', { name: 'Duyệt đề xuất phiên bản 3' })
    )
    await user.click(await screen.findByRole('button', { name: 'Duyệt' }))
    await waitFor(() => expect(approved).toBe(true))
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith('Đã phê duyệt quy tắc tạm giữ')
    )
    success.mockRestore()
  })

  it('từ chối gửi lý do qua query string', async () => {
    const user = userEvent.setup()
    mockLists([change()])
    let reason: string | null = null
    server.use(
      http.post(`${BASE}/rule-1/reject`, ({ request }) => {
        reason = new URL(request.url).searchParams.get('reason')
        return HttpResponse.json({
          data: change({ approvalStatus: 'REJECTED' })
        })
      })
    )
    renderWithStore(<MerchantHoldRulePage />, [APPROVE], SYSTEM_URL)
    await user.click(
      await screen.findByRole('button', { name: 'Từ chối đề xuất phiên bản 3' })
    )
    await user.type(
      await screen.findByLabelText('Lý do từ chối'),
      'Chưa đủ căn cứ'
    )
    await user.click(await screen.findByRole('button', { name: 'Từ chối' }))
    await waitFor(() => expect(reason).toBe('Chưa đủ căn cứ'))
  })
})
