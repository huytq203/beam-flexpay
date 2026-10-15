import { screen, waitFor, within } from '@testing-library/react'
import { useSearchParams } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { feedback } from '@components/index'
import WithdrawalLimitPage from '../pages/WithdrawalLimitPage'
import { renderWithStore } from './settlement.setup'

const LIMITS = '*/merchant-limits'
const VIEW = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_VIEW
const UPDATE = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_UPDATE
const APPROVE = PERMISSION.SUB_MERCHANT_SETTLEMENT_CONFIG_APPROVE

const change = (over: Record<string, unknown> = {}) => ({
  id: 'lim-1',
  policyDomain: 'WITHDRAWAL',
  targetLevel: 'SYSTEM',
  targetId: null,
  version: 1,
  approvalStatus: 'PENDING_APPROVAL',
  proposedConfig: { dailyWithdrawalLimit: 50000000 },
  activeFrom: '2026-10-14T00:00:00Z',
  changeReason: 'Siết hạn mức theo rủi ro',
  createdAt: '2026-10-14T00:00:00Z',
  ...over
})

const mockLists = (pendingRows: unknown[] = [], historyRows: unknown[] = []) =>
  server.use(
    http.get(`${LIMITS}/pending`, () =>
      HttpResponse.json({ data: pendingRows })
    ),
    http.get(LIMITS, () => HttpResponse.json({ data: historyRows }))
  )

const fillAndSubmit = async (
  user: ReturnType<typeof userEvent.setup>,
  extra?: () => Promise<void>
) => {
  await user.type(
    await screen.findByLabelText('Hạn mức rút trong ngày'),
    '50000000'
  )
  await extra?.()
  await user.type(screen.getByLabelText('Lý do'), 'Siết hạn mức theo rủi ro')
  await user.click(screen.getByRole('button', { name: 'Gửi đề xuất' }))
}

describe('WithdrawalLimitPage', { timeout: 25000 }, () => {
  it('cấp SYSTEM gọi lịch sử với policyDomain WITHDRAWAL', async () => {
    let url: URL | undefined
    server.use(
      http.get(`${LIMITS}/pending`, () => HttpResponse.json({ data: [] })),
      http.get(LIMITS, ({ request }) => {
        url = new URL(request.url)
        return HttpResponse.json({ data: [] })
      })
    )
    renderWithStore(<WithdrawalLimitPage />, [VIEW], '/?level=SYSTEM')
    await waitFor(() => expect(url).toBeDefined())
    expect(url?.searchParams.get('policyDomain')).toBe('WITHDRAWAL')
    expect(url?.searchParams.get('targetLevel')).toBe('SYSTEM')
  })

  it('đề xuất trả APPROVED báo áp dụng ngay', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockLists()
    server.use(
      http.post(LIMITS, () =>
        HttpResponse.json({ data: change({ approvalStatus: 'APPROVED' }) })
      )
    )
    renderWithStore(<WithdrawalLimitPage />, [VIEW, UPDATE], '/?level=SYSTEM')
    await fillAndSubmit(user)
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        expect.stringContaining('áp dụng ngay')
      )
    )
    success.mockRestore()
  })

  it('đề xuất trả PENDING_APPROVAL báo chờ phê duyệt, không nói áp dụng ngay', async () => {
    const user = userEvent.setup()
    const success = vi.spyOn(feedback, 'success').mockImplementation(() => {})
    mockLists()
    server.use(http.post(LIMITS, () => HttpResponse.json({ data: change() })))
    renderWithStore(<WithdrawalLimitPage />, [VIEW, UPDATE], '/?level=SYSTEM')
    await fillAndSubmit(user)
    await waitFor(() =>
      expect(success).toHaveBeenCalledWith(
        expect.stringContaining('chờ phê duyệt')
      )
    )
    expect(success).not.toHaveBeenCalledWith(
      expect.stringContaining('áp dụng ngay')
    )
    success.mockRestore()
  })

  it('body gửi đúng policyDomain, cấp và chỉ khóa có giá trị', async () => {
    const user = userEvent.setup()
    let body: Record<string, unknown> | undefined
    mockLists()
    server.use(
      http.post(LIMITS, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ data: change() })
      })
    )
    renderWithStore(<WithdrawalLimitPage />, [VIEW, UPDATE], '/?level=SYSTEM')
    await fillAndSubmit(user)
    await waitFor(() => expect(body).toBeDefined())
    expect(body).toMatchObject({
      policyDomain: 'WITHDRAWAL',
      targetLevel: 'SYSTEM',
      reason: 'Siết hạn mức theo rủi ro'
    })
    expect(body?.config).toEqual({ dailyWithdrawalLimit: 50000000 })
    expect(body).not.toHaveProperty('targetId')
  })

  it('số lệnh tối đa mỗi ngày bằng 0 không gọi API', async () => {
    const user = userEvent.setup()
    let posted = false
    mockLists()
    server.use(
      http.post(LIMITS, () => {
        posted = true
        return HttpResponse.json({ data: change() })
      })
    )
    renderWithStore(<WithdrawalLimitPage />, [VIEW, UPDATE], '/?level=SYSTEM')
    await fillAndSubmit(user, async () => {
      await user.type(screen.getByLabelText('Số lệnh rút tối đa mỗi ngày'), '0')
    })
    expect(
      await screen.findByText('Phải lớn hơn 0 hoặc để trống')
    ).toBeInTheDocument()
    expect(posted).toBe(false)
  })

  it('Duyệt và Từ chối chỉ hiện với dòng chờ duyệt và đúng quyền', async () => {
    mockLists([change()], [change({ id: 'lim-2', approvalStatus: 'APPROVED' })])
    renderWithStore(<WithdrawalLimitPage />, [VIEW, APPROVE], '/?level=SYSTEM')
    expect(
      await screen.findAllByRole('button', { name: 'Duyệt đề xuất' })
    ).toHaveLength(1)
    expect(
      screen.getAllByRole('button', { name: 'Từ chối đề xuất' })
    ).toHaveLength(1)
    expect(
      screen.getByRole('button', { name: 'Gỡ hạn mức' })
    ).toBeInTheDocument()
  })

  it('thiếu quyền APPROVE thì ẩn Duyệt, Từ chối và Gỡ', async () => {
    mockLists([change()], [change({ id: 'lim-2', approvalStatus: 'APPROVED' })])
    renderWithStore(<WithdrawalLimitPage />, [VIEW], '/?level=SYSTEM')
    await screen.findAllByText('Siết hạn mức theo rủi ro')
    expect(screen.queryByRole('button', { name: 'Duyệt đề xuất' })).toBeNull()
    expect(screen.queryByRole('button', { name: 'Gỡ hạn mức' })).toBeNull()
  })

  it('duyệt gọi POST approve; lỗi 6101 hiện câu detail', async () => {
    const user = userEvent.setup()
    const error = vi.spyOn(feedback, 'error').mockImplementation(() => {})
    const detail = 'Không có quyền thực hiện thao tác'
    mockLists([change()])
    server.use(
      http.post(`${LIMITS}/lim-1/approve`, () =>
        HttpResponse.json(
          {
            success: false,
            status: '6101',
            message: 'ADMIN_PERMISSION_DENIED',
            detail
          },
          { status: 403 }
        )
      )
    )
    renderWithStore(<WithdrawalLimitPage />, [VIEW, APPROVE], '/?level=SYSTEM')
    await user.click(
      await screen.findByRole('button', { name: 'Duyệt đề xuất' })
    )
    await user.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Duyệt'
      })
    )
    await waitFor(() => expect(error).toHaveBeenCalledWith(detail))
    error.mockRestore()
  })

  it('gỡ hạn mức cần lý do và gọi POST deactivate?reason=', async () => {
    const user = userEvent.setup()
    let reason: string | null = null
    mockLists([], [change({ id: 'lim-2', approvalStatus: 'APPROVED' })])
    server.use(
      http.post(`${LIMITS}/lim-2/deactivate`, ({ request }) => {
        reason = new URL(request.url).searchParams.get('reason')
        return HttpResponse.json({
          data: change({ approvalStatus: 'INACTIVE' })
        })
      })
    )
    renderWithStore(<WithdrawalLimitPage />, [VIEW, APPROVE], '/?level=SYSTEM')
    await user.click(await screen.findByRole('button', { name: 'Gỡ hạn mức' }))
    const dialog = await screen.findByRole('dialog')
    await user.type(
      within(dialog).getByLabelText('Lý do'),
      'Hết hiệu lực chính sách'
    )
    await user.click(within(dialog).getByRole('button', { name: 'Gỡ' }))
    await waitFor(() => expect(reason).toBe('Hết hiệu lực chính sách'))
  })

  it('hiện hạn mức bằng số đầy đủ, căn phải và tabular-nums', async () => {
    mockLists([change()])
    renderWithStore(<WithdrawalLimitPage />, [VIEW], '/?level=SYSTEM')
    const cell = await screen.findByText(/50\.000\.000/)
    expect(cell.className).toContain('tabular-nums')
  })

  it('chỉ liệt kê đề xuất chờ duyệt của miền WITHDRAWAL', async () => {
    mockLists([
      change(),
      change({
        id: 'lim-9',
        policyDomain: 'HOLD_RULE',
        changeReason: 'Quy tắc tạm giữ'
      })
    ])
    renderWithStore(<WithdrawalLimitPage />, [VIEW], '/?level=SYSTEM')
    await screen.findAllByText('Siết hạn mức theo rủi ro')
    expect(screen.queryByText('Quy tắc tạm giữ')).toBeNull()
  })

  it('thiếu quyền xem thì không hiện trang', async () => {
    renderWithStore(<WithdrawalLimitPage />, [])
    expect(screen.queryByText('Hạn mức rút')).toBeNull()
  })

  it('đổi đối tượng áp dụng thì xóa số đã nhập cho đối tượng cũ', async () => {
    const user = userEvent.setup()
    mockLists()
    server.use(
      http.get('*/merchants/m-1', () =>
        HttpResponse.json({
          data: { id: 'm-1', code: 'M1', name: 'Master 1', status: 'ACTIVE' }
        })
      )
    )
    const Switch = () => {
      const [, setParams] = useSearchParams()
      return (
        <button
          onClick={() => setParams({ level: 'MASTER', targetId: 'm-1' })}
          type='button'
        >
          Đổi sang Master
        </button>
      )
    }
    renderWithStore(
      <>
        <Switch />
        <WithdrawalLimitPage />
      </>,
      [VIEW, UPDATE],
      '/?level=SYSTEM'
    )
    await user.type(
      await screen.findByLabelText('Hạn mức rút trong ngày'),
      '50000000'
    )
    await user.click(screen.getByRole('button', { name: 'Đổi sang Master' }))
    await waitFor(() =>
      expect(screen.getByLabelText('Hạn mức rút trong ngày')).toHaveValue('')
    )
  })
})
