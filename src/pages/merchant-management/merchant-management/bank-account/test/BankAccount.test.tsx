import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import BankAccount from '../pages/BankAccount'

const renderWithPermissions = (permissions: string[] = []) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <BankAccount />
      </MemoryRouter>
    </Provider>
  )
}

describe('BankAccount', () => {
  it('hiển thị đủ danh sách tài khoản mock sau khi tải xong', async () => {
    renderWithPermissions()

    expect(await screen.findByText('Highlands Coffee')).toBeInTheDocument()
    expect(screen.getByText('HLC Nguyễn Huệ')).toBeInTheDocument()
    expect(screen.getByText('GS25 Việt Nam')).toBeInTheDocument()
    expect(screen.getByText('6 bản ghi')).toBeInTheDocument()
  })

  it('che số tài khoản theo mặc định', async () => {
    renderWithPermissions()
    await screen.findByText('Highlands Coffee')

    expect(screen.getAllByText('••••4821').length).toBeGreaterThan(0)
    expect(screen.queryByText('0071000124821')).toBeNull()
  })

  it('ẩn nút mở số tài khoản khi thiếu quyền xem đầy đủ', async () => {
    renderWithPermissions()
    await screen.findByText('Highlands Coffee')

    expect(
      screen.queryByRole('button', { name: /Xem đầy đủ số tài khoản/ })
    ).toBeNull()
  })

  it('mở số tài khoản đầy đủ khi có quyền và người dùng chủ động bấm', async () => {
    const user = userEvent.setup()
    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Highlands Coffee')

    await user.click(
      screen.getAllByRole('button', { name: /Xem đầy đủ số tài khoản/ })[0]
    )

    expect(await screen.findByText('0071000124821')).toBeInTheDocument()
  })

  it('lọc theo cấp áp dụng thu hẹp danh sách', async () => {
    const user = userEvent.setup()
    renderWithPermissions()
    await screen.findByText('Highlands Coffee')

    await user.click(screen.getByLabelText('Cấp áp dụng'))
    await user.click(await screen.findByTitle('Sub'))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    await waitFor(() => expect(screen.getByText('2 bản ghi')).toBeInTheDocument())
    expect(screen.queryByText('Highlands Coffee')).toBeNull()
    expect(screen.getByText('HLC Nguyễn Huệ')).toBeInTheDocument()
  })

  it('ẩn nút Thêm mới khi thiếu quyền tạo', async () => {
    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Highlands Coffee')

    expect(
      screen.queryByRole('button', { name: /Thêm mới tài khoản/ })
    ).toBeNull()
  })

  it('mở modal thêm mới khi có quyền tạo', async () => {
    const user = userEvent.setup()
    renderWithPermissions(['EWALLET:MERCHANT:CREATE'])
    await screen.findByText('Highlands Coffee')

    await user.click(
      screen.getByRole('button', { name: /Thêm mới tài khoản/ })
    )

    expect(
      await screen.findByRole('dialog', {
        name: /Thêm mới tài khoản ngân hàng/
      })
    ).toBeInTheDocument()
  })

  it('ẩn thao tác sửa và khóa khi thiếu quyền cập nhật', async () => {
    renderWithPermissions(['EWALLET:MERCHANT:VIEW'])
    await screen.findByText('Highlands Coffee')

    expect(screen.queryByRole('button', { name: /^Sửa tài khoản/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /^Khóa tài khoản/ })).toBeNull()
  })
})
