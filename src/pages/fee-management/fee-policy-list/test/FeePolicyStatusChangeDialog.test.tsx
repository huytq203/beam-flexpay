import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { FeePolicyScheduleAction } from '@type/fee.type'
import dayjs from 'dayjs'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { FeePolicyStatusChangeDialog } from '../components/FeePolicyStatusChangeDialog'
import { RUN_AT_REQUIRED_MESSAGE } from '../schemas/feePolicySchedule.schema'

const URL = '*/fee/policies/policy-1/status-changes'
const PICKER = 'DD/MM/YYYY HH:mm:ss'

const renderDialog = (
  status = 'ACTIVE',
  allowedActions: FeePolicyScheduleAction[] = ['ACTIVATE', 'DEACTIVATE'],
  onClose = vi.fn()
) => {
  renderWithProviders(
    <MessageProvider>
      <FeePolicyStatusChangeDialog
        policy={{ id: 'policy-1', name: 'Biểu phí A', status }}
        allowedActions={allowedActions}
        onClose={onClose}
      />
    </MessageProvider>
  )
  return onClose
}

const captureBody = () => {
  const sent: { body?: unknown; calls: number } = { calls: 0 }
  server.use(
    http.post(URL, async ({ request }) => {
      sent.calls += 1
      sent.body = await request.json()
      return HttpResponse.json({ data: { mode: 'IMMEDIATE' } })
    })
  )
  return sent
}

const pickRunAt = async (user: ReturnType<typeof userEvent.setup>, runAt: dayjs.Dayjs) => {
  const picker = screen.getByPlaceholderText(PICKER)
  await user.click(picker)
  await user.type(picker, `${runAt.format('DD/MM/YYYY HH:mm:ss')}{Enter}`)
}

describe('dialog khóa / mở chính sách phí', () => {
  it('không có lựa chọn ngay / hẹn giờ: chỉ một ô thời điểm không bắt buộc', async () => {
    renderDialog()
    expect(await screen.findByPlaceholderText(PICKER)).toBeInTheDocument()
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('bỏ trống thời điểm: chính sách đang bật thì ngừng áp dụng ngay, không gửi runAt', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog()

    await user.type(await screen.findByRole('textbox', { name: /Lý do/ }), ' Tạm dừng khuyến mãi ')
    await user.click(screen.getByRole('button', { name: 'Ngừng áp dụng ngay' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({ action: 'DEACTIVATE', reason: 'Tạm dừng khuyến mãi' })
  })

  it('bỏ trống thời điểm: chính sách đang tắt thì kích hoạt ngay', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog('INACTIVE')

    await user.type(await screen.findByRole('textbox', { name: /Lý do/ }), 'Áp dụng lại')
    await user.click(screen.getByRole('button', { name: 'Kích hoạt ngay' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({ action: 'ACTIVATE', reason: 'Áp dụng lại' })
  })

  it('bắt buộc lý do kể cả khi làm ngay, và không gọi API', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    renderDialog()

    await user.click(await screen.findByRole('button', { name: 'Ngừng áp dụng ngay' }))

    expect(await screen.findByText('Vui lòng nhập lý do')).toBeInTheDocument()
    expect(sent.calls).toBe(0)
  })

  it('chọn thời điểm thì hẹn giờ, gửi runAt dạng ISO instant', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog()

    const runAt = dayjs().add(2, 'day').second(0).millisecond(0)
    await screen.findByPlaceholderText(PICKER)
    await pickRunAt(user, runAt)
    await user.type(screen.getByRole('textbox', { name: /Lý do/ }), '  Hết khuyến mãi ')
    await user.click(screen.getByRole('button', { name: 'Hẹn giờ' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({
      action: 'DEACTIVATE',
      runAt: runAt.toDate().toISOString(),
      reason: 'Hết khuyến mãi'
    })
  })

  it('hành động không làm ngay được (mở chính sách đang bật) thì bắt chọn thời điểm', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    renderDialog('ACTIVE', ['ACTIVATE'])

    await user.type(await screen.findByRole('textbox', { name: /Lý do/ }), 'Mở lại sáng mai')
    await user.click(screen.getByRole('button', { name: 'Hẹn giờ' }))

    expect(await screen.findByText(RUN_AT_REQUIRED_MESSAGE)).toBeInTheDocument()
    expect(sent.calls).toBe(0)
  })
})
