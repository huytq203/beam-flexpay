import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { FeePolicyStatusChangeDialog } from '../components/FeePolicyStatusChangeDialog'
import { END_AT_AFTER_START_MESSAGE } from '../schemas/feePolicySchedule.schema'

const URL = '*/fee/policies/policy-1/status-changes'
const PLACEHOLDER = 'DD/MM/YYYY HH:mm:ss'
const PICKER = 0
const END_PICKER = 1

const getPicker = (index: number) =>
  screen.getAllByPlaceholderText(PLACEHOLDER)[index]

const renderDialog = (status = 'ACTIVE', onClose = vi.fn()) => {
  renderWithProviders(
    <MessageProvider>
      <FeePolicyStatusChangeDialog
        policy={{ id: 'policy-1', name: 'Biểu phí A', status }}
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

const pickRunAt = async (
  user: ReturnType<typeof userEvent.setup>,
  runAt: dayjs.Dayjs,
  index = PICKER
) => {
  const picker = getPicker(index)
  await user.click(picker)
  await user.type(picker, `${runAt.format('DD/MM/YYYY HH:mm:ss')}{Enter}`)
}

describe('dialog khóa / mở chính sách phí', () => {
  it('không có lựa chọn ngay / hẹn giờ: hai ô bắt đầu và kết thúc đều không bắt buộc', async () => {
    renderDialog()
    expect(await screen.findAllByPlaceholderText(PLACEHOLDER)).toHaveLength(2)
    expect(screen.queryByRole('radio')).toBeNull()
  })

  it('không còn ô chọn hành động, tiêu đề theo thao tác đảo trạng thái', async () => {
    renderDialog('INACTIVE')
    expect(
      await screen.findByText('Mở khóa chính sách phí')
    ).toBeInTheDocument()
    expect(screen.queryByText('Hành động')).toBeNull()
    expect(screen.queryByRole('combobox')).toBeNull()
  })

  it('bỏ trống thời điểm: chính sách đang bật thì ngừng áp dụng ngay, không gửi runAt', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog()

    await user.type(
      await screen.findByRole('textbox', { name: /Lý do/ }),
      ' Tạm dừng khuyến mãi '
    )
    await user.click(screen.getByRole('button', { name: 'Ngừng áp dụng ngay' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({
      action: 'DEACTIVATE',
      reason: 'Tạm dừng khuyến mãi'
    })
  })

  it('bỏ trống thời điểm: chính sách đang tắt thì kích hoạt ngay', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog('INACTIVE')

    await user.type(
      await screen.findByRole('textbox', { name: /Lý do/ }),
      'Áp dụng lại'
    )
    await user.click(screen.getByRole('button', { name: 'Kích hoạt ngay' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({ action: 'ACTIVATE', reason: 'Áp dụng lại' })
  })

  it('bắt buộc lý do kể cả khi làm ngay, và không gọi API', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    renderDialog()

    await user.click(
      await screen.findByRole('button', { name: 'Ngừng áp dụng ngay' })
    )

    expect(await screen.findByText('Vui lòng nhập lý do')).toBeInTheDocument()
    expect(sent.calls).toBe(0)
  })

  it('chọn thời điểm thì hẹn giờ, gửi runAt dạng ISO instant', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog()

    const runAt = dayjs().add(2, 'day').second(0).millisecond(0)
    await screen.findAllByPlaceholderText(PLACEHOLDER)
    await pickRunAt(user, runAt)
    await user.type(
      screen.getByRole('textbox', { name: /Lý do/ }),
      '  Hết khuyến mãi '
    )
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({
      action: 'DEACTIVATE',
      runAt: runAt.toDate().toISOString(),
      reason: 'Hết khuyến mãi'
    })
  })

  it('đặt khoảng: một lần gửi cả runAt và endAt, BE tự đảo lại khi hết khoảng', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog()

    const runAt = dayjs().add(1, 'day').second(0).millisecond(0)
    const endAt = runAt.add(3, 'hour')
    await screen.findAllByPlaceholderText(PLACEHOLDER)
    await pickRunAt(user, runAt)
    await pickRunAt(user, endAt, END_PICKER)
    await user.type(
      screen.getByRole('textbox', { name: /Lý do/ }),
      'Bảo trì cổng'
    )
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.calls).toBe(1)
    expect(sent.body).toEqual({
      action: 'DEACTIVATE',
      runAt: runAt.toDate().toISOString(),
      endAt: endAt.toDate().toISOString(),
      reason: 'Bảo trì cổng'
    })
  })

  it('bắt đầu ngay, chỉ chọn kết thúc: gửi endAt mà không gửi runAt', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    const onClose = renderDialog()

    const endAt = dayjs().add(2, 'hour').second(0).millisecond(0)
    await screen.findAllByPlaceholderText(PLACEHOLDER)
    await pickRunAt(user, endAt, END_PICKER)
    await user.type(screen.getByRole('textbox', { name: /Lý do/ }), 'Khóa tạm')
    await user.click(screen.getByRole('button', { name: 'Ngừng áp dụng ngay' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(sent.body).toEqual({
      action: 'DEACTIVATE',
      endAt: endAt.toDate().toISOString(),
      reason: 'Khóa tạm'
    })
  })

  it('kết thúc không sau bắt đầu: báo lỗi và không gọi API', async () => {
    const sent = captureBody()
    const user = userEvent.setup()
    renderDialog()

    const runAt = dayjs().add(1, 'day').second(0).millisecond(0)
    await screen.findAllByPlaceholderText(PLACEHOLDER)
    await pickRunAt(user, runAt)
    await pickRunAt(user, runAt.subtract(1, 'hour'), END_PICKER)
    await user.type(screen.getByRole('textbox', { name: /Lý do/ }), 'Sai giờ')
    await user.click(screen.getByRole('button', { name: 'Xác nhận' }))

    expect(
      await screen.findByText(END_AT_AFTER_START_MESSAGE)
    ).toBeInTheDocument()
    expect(sent.calls).toBe(0)
  })
})
