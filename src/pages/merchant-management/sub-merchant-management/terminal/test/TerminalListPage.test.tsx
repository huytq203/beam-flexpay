import { beforeEach, describe, expect, it } from 'vitest'
import { render, renderHook, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import type { ManagementListState } from '../../shared/management.types'
import {
  createFixtureSubMerchant,
  resetSubMerchantRepository
} from '../../sub-merchant/hooks/useSubMerchants'
import { useCurrentSubMerchants } from '../hooks/useTerminalSubMerchants'
import { createTerminal, resetTerminalRepository } from '../hooks/useTerminals'
import TerminalListPage from '../pages/TerminalListPage'
import { getActiveSubMerchantOptions } from '../utils/terminal.utils'

const LIST_PATH = '/secure-panel/merchant/terminal'

const renderTerminalList = (
  permissions: string[],
  initialListState?: ManagementListState
) => {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[LIST_PATH]}>
        <Routes>
          <Route
            path={LIST_PATH}
            element={<TerminalListPage initialListState={initialListState} />}
          />
          <Route
            path={`${LIST_PATH}/create`}
            element={<p>Trang thêm Terminal</p>}
          />
          <Route
            path={`${LIST_PATH}/detail/:id`}
            element={<p>Trang chi tiết Terminal</p>}
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

const chooseOption = async (label: string, option: string): Promise<void> => {
  const user = userEvent.setup()
  await user.click(screen.getByLabelText(label))
  await user.click(await screen.findByTitle(option))
}

beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})

describe('TerminalListPage', () => {
  it('lọc Terminal theo loại và Sub-merchant', async () => {
    const user = userEvent.setup()
    renderTerminalList([PERMISSION.MERCHANT_VIEW])

    await chooseOption('Loại Terminal', 'POS')
    await chooseOption('Merchant cha', 'Highlands Coffee')
    await chooseOption('Sub-merchant', 'HLC Nguyễn Huệ')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(await screen.findByText('POS Nguyễn Huệ 01')).toBeInTheDocument()
    expect(screen.queryByText('QR Quầy 02')).not.toBeInTheDocument()
  }, 10_000)

  it.each([
    ['loading', 'Đang tải dữ liệu'],
    ['empty', 'Chưa có Terminal']
  ] as const)('hiển thị trạng thái %s', async (state, copy) => {
    renderTerminalList([PERMISSION.MERCHANT_VIEW], state)
    expect(await screen.findByText(copy)).toBeInTheDocument()
  })

  it('cho phép thử lại sau trạng thái lỗi', async () => {
    const user = userEvent.setup()
    renderTerminalList([PERMISSION.MERCHANT_VIEW], 'error')

    expect(
      await screen.findByText('Không tải được danh sách Terminal')
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Thử lại' }))

    expect(await screen.findByText('QR Quầy 02')).toBeInTheDocument()
  })

  it('chỉ hiện thao tác xem với quyền chỉ xem', async () => {
    renderTerminalList([PERMISSION.MERCHANT_VIEW])

    expect(
      await screen.findByRole('button', { name: 'Xem Terminal QR Quầy 02' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Sửa Terminal/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Khóa Terminal/ })).toBeNull()
  })

  it('render action cập nhật dưới dạng button có tên truy cập theo Terminal', async () => {
    renderTerminalList([PERMISSION.MERCHANT_VIEW, PERMISSION.MERCHANT_UPDATE])

    expect(
      await screen.findByRole('button', { name: 'Sửa Terminal QR Quầy 02' })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Khóa Terminal QR Quầy 02' })
    ).toBeInTheDocument()
  })

  it('điều hướng sang trang tạo khi có quyền', async () => {
    const user = userEvent.setup()
    renderTerminalList([PERMISSION.MERCHANT_CREATE])

    await user.click(
      await screen.findByRole('button', { name: 'Thêm Terminal' })
    )
    expect(await screen.findByText('Trang thêm Terminal')).toBeInTheDocument()
  })

  it('chặn mở khóa Terminal đang tạm ngưng theo Sub-merchant', async () => {
    const user = userEvent.setup()
    renderTerminalList([PERMISSION.MERCHANT_UPDATE])

    await user.click(
      await screen.findByRole('button', {
        name: 'Mở khóa Terminal SoftPOS Nguyễn Trãi 01'
      })
    )

    expect(
      screen.getByText('Cần mở khóa Sub-merchant cha trước')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Mở khóa' })).toBeDisabled()
  })

  it('phân trang danh sách dài và hiển thị trang tiếp theo', async () => {
    for (let index = 0; index < 8; index += 1) {
      createTerminal({
        parentMerchantId: 'merchant-0142',
        subMerchantId: 'sub-001',
        name: `Terminal bổ sung ${index + 1}`,
        type: 'POS',
        address: '42 Nguyễn Huệ, TP. Hồ Chí Minh',
        phone: '',
        note: ''
      })
    }
    const user = userEvent.setup()
    renderTerminalList([PERMISSION.MERCHANT_VIEW])

    await waitFor(() =>
      expect(screen.getByText('12 bản ghi')).toBeInTheDocument()
    )
    expect(screen.queryByText('Terminal bổ sung 8')).toBeNull()
    await user.click(screen.getByTitle('2'))
    expect(await screen.findByText('Terminal bổ sung 8')).toBeInTheDocument()
  })

  it('trở về trang hợp lệ khi mutation làm giảm tổng kết quả lọc', async () => {
    for (let index = 0; index < 9; index += 1) {
      createTerminal({
        parentMerchantId: 'merchant-0142',
        subMerchantId: 'sub-001',
        name: `Terminal active ${index + 1}`,
        type: 'POS',
        address: '42 Nguyễn Huệ, TP. Hồ Chí Minh',
        phone: '',
        note: ''
      })
    }
    const user = userEvent.setup()
    renderTerminalList([PERMISSION.MERCHANT_UPDATE])

    await chooseOption('Trạng thái', 'Hoạt động')
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    expect(await screen.findByText('11 bản ghi')).toBeInTheDocument()
    await user.click(screen.getByTitle('2'))
    expect(await screen.findByText('Terminal active 9')).toBeInTheDocument()

    await user.click(
      screen.getByRole('button', {
        name: 'Khóa Terminal Terminal active 9'
      })
    )
    await user.type(
      screen.getByLabelText('Lý do khóa'),
      'Khóa để kiểm tra phân trang'
    )
    await user.click(screen.getByRole('button', { name: 'Khóa' }))

    expect(await screen.findByText('10 bản ghi')).toBeInTheDocument()
    expect(screen.getByText('QR Quầy 02')).toBeInTheDocument()
    expect(screen.queryByTitle('2')).toBeNull()
  }, 15_000)

  it('giữ Sub-merchant active cũ nhất trong bộ lọc sau hơn 10 lần tạo', async () => {
    for (let index = 1; index <= 11; index += 1) {
      createFixtureSubMerchant({
        parentMerchantId: 'merchant-0142',
        name: `Sub active ${index}`,
        phoneInherited: true,
        phone: '',
        addressInherited: true,
        address: '',
        businessField: 'F&B'
      })
    }
    const { result } = renderHook(() => useCurrentSubMerchants())
    const options = getActiveSubMerchantOptions('merchant-0142', result.current)

    expect(options).toContainEqual({
      label: 'Sub active 1',
      value: 'sub-local-05'
    })
  }, 10_000)
})
