import { createAppStore } from '@/app/store'
import { renderWithProviders } from '@/test/render'
import { savePermissions } from '@slices/authSlice'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeePolicyStatusMenu } from '../components/FeePolicyStatusMenu'

const TRIGGER = 'Thao tác trạng thái chính sách'

const renderMenu = (status: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  const handlers = {
    onActivate: vi.fn(),
    onDeactivate: vi.fn(),
    onSchedule: vi.fn()
  }
  renderWithProviders(
    <FeePolicyStatusMenu
      status={status}
      {...handlers}
    />,
    { store }
  )
  return handlers
}

describe('menu trạng thái ở dòng chính sách phí', () => {
  it('ACTIVE: có Hẹn giờ, không có Kích hoạt ngay', async () => {
    const user = userEvent.setup()
    const h = renderMenu('ACTIVE', ['EWALLET:FEE:UPDATE'])
    await user.click(screen.getByLabelText(TRIGGER))
    expect(screen.queryByText('Kích hoạt ngay')).toBeNull()
    await user.click(await screen.findByText('Hẹn giờ khóa / mở'))
    expect(h.onSchedule).toHaveBeenCalledTimes(1)
  })

  it('ACTIVE: Ngừng áp dụng ngay gọi onDeactivate', async () => {
    const user = userEvent.setup()
    const h = renderMenu('ACTIVE', ['EWALLET:FEE:UPDATE'])
    await user.click(screen.getByLabelText(TRIGGER))
    await user.click(await screen.findByText('Ngừng áp dụng ngay'))
    expect(h.onDeactivate).toHaveBeenCalledTimes(1)
  })

  it('INACTIVE: có Kích hoạt ngay với quyền mở', async () => {
    const user = userEvent.setup()
    const h = renderMenu('INACTIVE', ['EWALLET:FEE:APPROVE'])
    await user.click(screen.getByLabelText(TRIGGER))
    await user.click(await screen.findByText('Kích hoạt ngay'))
    expect(h.onActivate).toHaveBeenCalledTimes(1)
  })

  it('ẩn khi không có quyền nào', () => {
    renderMenu('ACTIVE', ['EWALLET:FEE:VIEW'])
    expect(screen.queryByLabelText(TRIGGER)).toBeNull()
  })

  it.each(['INIT', 'REJECTED', 'LOCKED'])('ẩn với chính sách %s', (status) => {
    renderMenu(status, ['EWALLET:FEE:UPDATE', 'EWALLET:FEE:APPROVE'])
    expect(screen.queryByLabelText(TRIGGER)).toBeNull()
  })
})
