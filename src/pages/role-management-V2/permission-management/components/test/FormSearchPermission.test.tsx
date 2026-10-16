import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import FormSearchPermission from '../FormSearchPermission'

describe('FormSearchPermission', () => {
  it('tìm theo mã quyền nhập tự do và xóa bộ lọc', async () => {
    const onSearch = vi.fn()
    const onClear = vi.fn()
    const user = userEvent.setup()
    render(
      <FormSearchPermission
        keyword=''
        onSearch={onSearch}
        onClear={onClear}
        onAdd={vi.fn()}
        canAdd={false}
      />
    )

    const input = screen.getByRole('textbox', { name: 'Tìm kiếm quyền' })
    await user.type(input, 'EWALLET:USER:VIEW')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    expect(onSearch).toHaveBeenCalledWith({ keyword: 'EWALLET:USER:VIEW' })

    await user.click(screen.getByRole('button', { name: 'Xóa lọc' }))
    expect(input).toHaveValue('')
    expect(onClear).toHaveBeenCalledTimes(1)
  })
})
