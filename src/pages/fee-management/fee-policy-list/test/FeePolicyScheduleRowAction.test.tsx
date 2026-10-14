import { createAppStore } from '@/app/store'
import { renderWithProviders } from '@/test/render'
import { savePermissions } from '@slices/authSlice'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeePolicyScheduleRowAction } from '../components/FeePolicyScheduleRowAction'

const renderAction = (status: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  const onClick = vi.fn()
  renderWithProviders(
    <FeePolicyScheduleRowAction
      status={status}
      onClick={onClick}
    />,
    { store }
  )
  return onClick
}

const LABEL = 'Hẹn giờ khóa / mở'

describe('nút hẹn giờ ở dòng chính sách phí', () => {
  it('hiện với quyền khóa (UPDATE) và gọi onClick', async () => {
    const onClick = renderAction('ACTIVE', ['EWALLET:FEE:UPDATE'])
    await userEvent.click(screen.getByLabelText(LABEL))
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('hiện với quyền mở (APPROVE)', () => {
    renderAction('INACTIVE', ['EWALLET:FEE:APPROVE'])
    expect(screen.getByLabelText(LABEL)).toBeInTheDocument()
  })

  it('ẩn khi không có quyền nào', () => {
    renderAction('ACTIVE', ['EWALLET:FEE:VIEW'])
    expect(screen.queryByLabelText(LABEL)).toBeNull()
  })

  it.each(['INIT', 'REJECTED', 'LOCKED'])('ẩn với chính sách %s', (status) => {
    renderAction(status, ['EWALLET:FEE:UPDATE', 'EWALLET:FEE:APPROVE'])
    expect(screen.queryByLabelText(LABEL)).toBeNull()
  })
})
