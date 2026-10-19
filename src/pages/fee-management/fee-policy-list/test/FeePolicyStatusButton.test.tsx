import { createAppStore } from '@/app/store'
import { renderWithProviders } from '@/test/render'
import { savePermissions } from '@slices/authSlice'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { FeePolicyStatusButton } from '../components/FeePolicyStatusButton'
import { STATUS_BUTTON_LABEL } from '../constants/feePolicySchedule'

const renderButton = (status: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  const onChangeStatus = vi.fn()
  renderWithProviders(
    <FeePolicyStatusButton
      status={status}
      onChangeStatus={onChangeStatus}
    />,
    { store }
  )
  return onChangeStatus
}

describe('nút khóa / mở ở dòng chính sách phí', () => {
  it('ACTIVE: một nút mở dialog khóa / mở', async () => {
    const user = userEvent.setup()
    const onChangeStatus = renderButton('ACTIVE', ['EWALLET:FEE:UPDATE'])
    await user.click(screen.getByLabelText(STATUS_BUTTON_LABEL))
    expect(onChangeStatus).toHaveBeenCalledTimes(1)
  })

  it('INACTIVE: hiện với quyền mở', async () => {
    const user = userEvent.setup()
    const onChangeStatus = renderButton('INACTIVE', ['EWALLET:FEE:APPROVE'])
    await user.click(screen.getByLabelText(STATUS_BUTTON_LABEL))
    expect(onChangeStatus).toHaveBeenCalledTimes(1)
  })

  it('ẩn khi không có quyền nào', () => {
    renderButton('ACTIVE', ['EWALLET:FEE:VIEW'])
    expect(screen.queryByLabelText(STATUS_BUTTON_LABEL)).toBeNull()
  })

  it.each(['INIT', 'REJECTED', 'LOCKED'])('ẩn với chính sách %s', (status) => {
    renderButton(status, ['EWALLET:FEE:UPDATE', 'EWALLET:FEE:APPROVE'])
    expect(screen.queryByLabelText(STATUS_BUTTON_LABEL)).toBeNull()
  })
})
