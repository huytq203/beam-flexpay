import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import {
  createFixtureSubMerchant,
  resetSubMerchantRepository,
  toggleSubMerchantStatus
} from '../../sub-merchant/hooks/useSubMerchants'
import { getTerminalById, resetTerminalRepository } from '../hooks/useTerminals'
import TerminalDetailPage from '../pages/TerminalDetailPage'
import TerminalFormPage from '../pages/TerminalFormPage'

const BASE_PATH = '/secure-panel/merchant/terminal'

const renderTerminalForm = (route: string, permissions: string[]) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route
            path={`${BASE_PATH}/create`}
            element={<TerminalFormPage />}
          />
          <Route
            path={`${BASE_PATH}/edit/:id`}
            element={<TerminalFormPage />}
          />
          <Route
            path={`${BASE_PATH}/detail/:id`}
            element={<TerminalDetailPage />}
          />
          <Route
            path={BASE_PATH}
            element={<p>Danh sách Terminal</p>}
          />
          <Route path='/secure-panel/forbidden' element={<p>Không có quyền truy cập</p>} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

const selectOption = async (label: string, option: string): Promise<void> => {
  const user = userEvent.setup()
  await user.click(screen.getByLabelText(new RegExp(`^${label}`)))
  await user.click(await screen.findByTitle(option))
}

beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})
afterEach(() => vi.restoreAllMocks())

describe('TerminalFormPage', () => {
  it.each(['create', 'edit/terminal-001'])(
    'chặn route %s trực tiếp với quyền VIEW-only', async (path) => {
      renderTerminalForm(`${BASE_PATH}/${path}`, [PERMISSION.MERCHANT_VIEW])

      expect(await screen.findByText('Không có quyền truy cập')).toBeInTheDocument()
      expect(screen.queryByLabelText(/^Tên Terminal/)).not.toBeInTheDocument()
      expect(getTerminalById('terminal-001')?.name).toBe('QR Quầy 02')
    }
  )

  it('lọc Sub-merchant đang hoạt động theo Merchant cha', async () => {
    renderTerminalForm(`${BASE_PATH}/create`, [PERMISSION.MERCHANT_CREATE])

    await selectOption('Merchant cha', 'Highlands Coffee')
    await userEvent.click(screen.getByLabelText(/^Sub-merchant/))

    expect(await screen.findByTitle('HLC Nguyễn Huệ')).toBeInTheDocument()
    expect(screen.getByTitle('HLC Landmark 81')).toBeInTheDocument()
    expect(screen.queryByTitle('GS25 Nguyễn Trãi')).toBeNull()
  }, 10_000)

  it('xóa Sub-merchant cũ, báo thiếu và không tạo bản ghi khi đổi Merchant cha', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000)
    const user = userEvent.setup()
    renderTerminalForm(`${BASE_PATH}/create`, [PERMISSION.MERCHANT_CREATE])

    await selectOption('Merchant cha', 'Highlands Coffee')
    await selectOption('Sub-merchant', 'HLC Nguyễn Huệ')
    await selectOption('Merchant cha', 'GS25 Việt Nam')
    await user.type(
      screen.getByLabelText(/^Tên Terminal/),
      'POS kiểm tra reset'
    )
    await user.type(screen.getByLabelText(/^Địa chỉ/), '175 Nguyễn Trãi')
    await user.click(screen.getByRole('button', { name: 'Thêm Terminal' }))

    expect(screen.getByLabelText(/^Sub-merchant/)).toHaveValue('')
    expect(
      await screen.findByText('Vui lòng chọn Sub-merchant')
    ).toBeInTheDocument()
    expect(getTerminalById('terminal-1700000000000-0005')).toBeUndefined()
  }, 10_000)

  it('phản ánh Sub-merchant vừa tạo và trạng thái khóa hiện tại trong lựa chọn', async () => {
    createFixtureSubMerchant({
      parentMerchantId: 'merchant-0142',
      name: 'HLC Rooftop',
      phoneInherited: true,
      phone: '',
      addressInherited: true,
      address: '',
      businessField: 'F&B'
    })
    toggleSubMerchantStatus('sub-001', 'Khóa để đối soát lựa chọn')
    const user = userEvent.setup()
    renderTerminalForm(`${BASE_PATH}/create`, [PERMISSION.MERCHANT_CREATE])

    await selectOption('Merchant cha', 'Highlands Coffee')
    await user.click(screen.getByLabelText(/^Sub-merchant/))

    expect(await screen.findByTitle('HLC Rooftop')).toBeInTheDocument()
    expect(screen.queryByTitle('HLC Nguyễn Huệ')).toBeNull()

    await user.keyboard('{Escape}')
    act(() => {
      toggleSubMerchantStatus('sub-001', 'Mở lại sau đối soát')
    })
    await user.click(screen.getByLabelText(/^Sub-merchant/))
    expect(await screen.findByTitle('HLC Nguyễn Huệ')).toBeInTheDocument()
  }, 10_000)

  it('hiển thị cùng cấu hình kế thừa của Terminal đang sửa và trang chi tiết', async () => {
    const formView = renderTerminalForm(`${BASE_PATH}/edit/terminal-locked`, [
      PERMISSION.MERCHANT_UPDATE
    ])

    expect(await screen.findByText('Visa')).toBeInTheDocument()
    expect(screen.getByText('Mastercard')).toBeInTheDocument()
    formView.unmount()

    renderTerminalForm(`${BASE_PATH}/detail/terminal-locked`, [
      PERMISSION.MERCHANT_VIEW
    ])
    expect(await screen.findByText('Visa')).toBeInTheDocument()
    expect(screen.getByText('Mastercard')).toBeInTheDocument()
  })

  it('lưu chỉnh sửa và giữ dữ liệu trên trang chi tiết', async () => {
    const user = userEvent.setup()
    renderTerminalForm(`${BASE_PATH}/edit/terminal-001`, [
      PERMISSION.MERCHANT_UPDATE,
      PERMISSION.MERCHANT_VIEW
    ])

    const nameInput = await screen.findByLabelText(/^Tên Terminal/)
    await user.clear(nameInput)
    await user.type(nameInput, 'QR Quầy chính')
    await user.click(screen.getByRole('button', { name: 'Lưu thay đổi' }))

    expect(
      await screen.findByRole('heading', { name: 'QR Quầy chính' })
    ).toBeInTheDocument()
    expect(getTerminalById('terminal-001')?.name).toBe('QR Quầy chính')
  }, 10_000)

  it('khóa TID, Merchant và Sub-merchant trong chế độ sửa', async () => {
    renderTerminalForm(`${BASE_PATH}/edit/terminal-001`, [
      PERMISSION.MERCHANT_UPDATE
    ])

    expect(await screen.findByLabelText('Terminal ID')).toBeDisabled()
    expect(screen.getByLabelText(/^Merchant cha/)).toBeDisabled()
    expect(screen.getByLabelText(/^Sub-merchant/)).toBeDisabled()
  })

  it('không cho sửa Terminal tạm ngưng theo Sub-merchant', async () => {
    renderTerminalForm(`${BASE_PATH}/edit/terminal-suspended`, [
      PERMISSION.MERCHANT_UPDATE
    ])

    expect(
      await screen.findByText('Terminal đang tạm ngưng theo Sub-merchant')
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Lưu thay đổi' })).toBeNull()
    expect(
      screen.getByRole('link', { name: 'Xem Sub-merchant cha' })
    ).toBeInTheDocument()
  })

  it('tạo Terminal và giữ bản ghi khi chuyển sang route chi tiết', async () => {
    const user = userEvent.setup()
    renderTerminalForm(`${BASE_PATH}/create`, [
      PERMISSION.MERCHANT_CREATE,
      PERMISSION.MERCHANT_VIEW
    ])

    await selectOption('Merchant cha', 'Highlands Coffee')
    await selectOption('Sub-merchant', 'HLC Nguyễn Huệ')
    await user.type(screen.getByLabelText(/^Tên Terminal/), 'POS Rooftop 01')
    await selectOption('Loại Terminal', 'POS')
    await user.type(screen.getByLabelText(/^Địa chỉ/), '42 Nguyễn Huệ')
    await user.click(screen.getByRole('button', { name: 'Thêm Terminal' }))

    expect(
      await screen.findByRole('heading', { name: 'POS Rooftop 01' })
    ).toBeInTheDocument()
    expect(screen.getAllByText(/TID-0142-/).length).toBeGreaterThan(0)
  }, 10_000)

  it('hiển thị not-found khi sửa ID không tồn tại', async () => {
    renderTerminalForm(`${BASE_PATH}/edit/missing`, [
      PERMISSION.MERCHANT_UPDATE
    ])

    expect(
      await screen.findByText('Không tìm thấy Terminal')
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Về danh sách Terminal' })
    ).toBeInTheDocument()
  })
})
