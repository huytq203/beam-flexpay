import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import FormSearchUser from '../FormSearchUser'
import { SearchUserFormData } from '../../types/UserManagement.type'

const renderForm = (canAdd = true) => {
  const onSearch = vi.fn<(data: SearchUserFormData) => void>()
  const onAdd = vi.fn()
  const onClear = vi.fn()
  render(
    <FormSearchUser
      onSearch={onSearch}
      onClear={onClear}
      onAdd={onAdd}
      canAdd={canAdd}
    />
  )
  return { onSearch, onAdd, onClear, user: userEvent.setup() }
}

/**
 * antd Select không phải <select>: phải mở dropdown rồi click option.
 * Option hiển thị là div có `title`, không mang role nên phải tìm theo title.
 */
const selectOption = async (
  user: UserEvent,
  label: string,
  option: string
): Promise<void> => {
  await user.click(screen.getByLabelText(label))
  await user.click(await screen.findByTitle(option))
}

describe('FormSearchUser', () => {
  it('gửi đủ 3 field lọc khi bấm Tìm kiếm', async () => {
    const { onSearch, user } = renderForm()

    await user.type(screen.getByLabelText('Từ khóa'), 'nguyen')
    await selectOption(user, 'Xác thực email', 'Đã xác thực')
    await selectOption(user, 'Trạng thái hoạt động', 'Hoạt động')
    await user.click(screen.getByRole('button', { name: /Tìm kiếm/ }))

    expect(onSearch).toHaveBeenCalledWith({
      keyword: 'nguyen',
      emailVerified: 'true',
      status: 'true'
    })
  })

  it('giới hạn từ khóa 255 ký tự theo ràng buộc của BE', () => {
    renderForm()

    expect(screen.getByLabelText('Từ khóa')).toHaveAttribute(
      'maxlength',
      '255'
    )
  })

  it('reset về rỗng và gọi onClear khi bấm Xóa lọc', async () => {
    const { onClear, onSearch, user } = renderForm()

    await user.type(screen.getByLabelText('Từ khóa'), 'nguyen')
    await user.click(screen.getByRole('button', { name: /Xóa lọc/ }))

    expect(screen.getByLabelText('Từ khóa')).toHaveValue('')
    expect(onClear).toHaveBeenCalledTimes(1)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('hiện lại bộ lọc đang áp dụng khi quay về màn', () => {
    render(
      <FormSearchUser
        defaultValues={{ keyword: 'nguyen', status: 'true' }}
        onSearch={vi.fn()}
        onClear={vi.fn()}
        onAdd={vi.fn()}
        canAdd={false}
      />
    )

    expect(screen.getByLabelText('Từ khóa')).toHaveValue('nguyen')
    expect(screen.getByTitle('Hoạt động')).toBeInTheDocument()
  })

  it('gọi onAdd khi bấm Thêm mới, không submit form', async () => {
    const { onAdd, onSearch, user } = renderForm()

    await user.click(screen.getByRole('button', { name: /Thêm mới/ }))

    expect(onAdd).toHaveBeenCalledTimes(1)
    expect(onSearch).not.toHaveBeenCalled()
  })

  it('không hiển thị nút Thêm mới khi thiếu quyền tạo user', () => {
    renderForm(false)

    expect(
      screen.queryByRole('button', { name: /Thêm mới/ })
    ).not.toBeInTheDocument()
  })
})
