import { server } from '@/test/mocks/server'
import { renderWithProviders } from '@/test/render'
import { MessageProvider } from '@hooks/MessageProvider'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import dayjs from 'dayjs'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { FeePolicyScheduleDialog } from '../components/FeePolicyScheduleDialog'

const policy = { id: 'policy-1', name: 'Biểu phí A', status: 'ACTIVE' }

const renderDialog = (onClose = vi.fn()) => {
  renderWithProviders(
    <MessageProvider>
      <FeePolicyScheduleDialog
        policy={policy}
        allowedActions={['ACTIVATE', 'DEACTIVATE']}
        onClose={onClose}
      />
    </MessageProvider>
  )
  return onClose
}

describe('dialog hẹn giờ khóa / mở chính sách phí', () => {
  it('báo lỗi khi gửi form trống và không gọi API', async () => {
    let called = false
    server.use(
      http.post('*/fee/policies/policy-1/schedules', () => {
        called = true
        return HttpResponse.json({ data: {} })
      })
    )
    const user = userEvent.setup()
    renderDialog()
    await user.click(await screen.findByRole('button', { name: 'Hẹn giờ' }))
    expect(
      await screen.findByText('Vui lòng chọn thời điểm chạy')
    ).toBeInTheDocument()
    expect(screen.getByText('Vui lòng nhập lý do')).toBeInTheDocument()
    expect(called).toBe(false)
  })

  it('gửi action, runAt dạng ISO instant và lý do', async () => {
    let body: unknown
    server.use(
      http.post('*/fee/policies/policy-1/schedules', async ({ request }) => {
        body = await request.json()
        return HttpResponse.json({ data: { id: 's1' } })
      })
    )
    const user = userEvent.setup()
    const onClose = renderDialog()

    const runAt = dayjs().add(2, 'day').second(0).millisecond(0)
    const picker = await screen.findByPlaceholderText('DD/MM/YYYY HH:mm:ss')
    await user.click(picker)
    await user.type(picker, `${runAt.format('DD/MM/YYYY HH:mm:ss')}{Enter}`)
    await user.type(
      screen.getByRole('textbox', { name: /Lý do/ }),
      '  Hết khuyến mãi '
    )
    await user.click(screen.getByRole('button', { name: 'Hẹn giờ' }))

    await waitFor(() => expect(onClose).toHaveBeenCalled())
    expect(body).toEqual({
      action: 'DEACTIVATE',
      runAt: runAt.toDate().toISOString(),
      reason: 'Hết khuyến mãi'
    })
  })
})
