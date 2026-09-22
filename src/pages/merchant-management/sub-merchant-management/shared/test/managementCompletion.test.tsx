import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION, SCREENS } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import { createFixtureSubMerchant, resetSubMerchantRepository } from '../../sub-merchant/hooks/useSubMerchants'
import SubMerchantDetailPage from '../../sub-merchant/pages/SubMerchantDetailPage'
import SubMerchantFormPage from '../../sub-merchant/pages/SubMerchantFormPage'
import SubMerchantListPage from '../../sub-merchant/pages/SubMerchantListPage'
import { suppressAntPseudoElementWarning } from '../../sub-merchant/test/domTestSetup'
import { createTerminal, resetTerminalRepository } from '../../terminal/hooks/useTerminals'
import TerminalListPage from '../../terminal/pages/TerminalListPage'

const SUB_PATH = SCREENS.MERCHANT_SUB_MERCHANT.path
const TERMINAL_PATH = SCREENS.MERCHANT_TERMINAL.path

suppressAntPseudoElementWarning()
beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})

function renderPage(path: string, permissions: string[] = [PERMISSION.MERCHANT_FULL]) {
  const store = createAppStore()
  store.dispatch(savePermissions(permissions))
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path={SUB_PATH} element={<SubMerchantListPage />} />
          <Route path={`${SUB_PATH}/create`} element={<SubMerchantFormPage />} />
          <Route path={`${SUB_PATH}/edit/:id`} element={<SubMerchantFormPage />} />
          <Route path={`${SUB_PATH}/detail/:id`} element={<SubMerchantDetailPage />} />
          <Route path={TERMINAL_PATH} element={<TerminalListPage />} />
        </Routes>
      </MemoryRouter>
    </Provider>
  )
}

function createLongLists() {
  for (let index = 1; index <= 22; index += 1) {
    createFixtureSubMerchant({
      parentMerchantId: 'merchant-0142', name: `Sub thêm ${index}`, phoneInherited: true,
      phone: '', addressInherited: true, address: '', businessField: 'F&B'
    })
    createTerminal({
      parentMerchantId: 'merchant-0142', subMerchantId: 'sub-001', name: `Terminal thêm ${index}`,
      type: 'POS', address: '42 Nguyễn Huệ', phone: '', note: ''
    })
  }
}

describe('Chi tiết hành vi còn thiếu trong spec', () => {
  it.each([SUB_PATH, TERMINAL_PATH])('đổi số dòng 10/20/50 trên %s', async (path) => {
    createLongLists()
    renderPage(path)
    const user = userEvent.setup()
    const tableRows = () => within(screen.getByRole('table')).getAllByRole('row').length - 1
    expect(tableRows()).toBe(10)
    for (const [size, count] of [[20, 20], [50, 26], [10, 10]]) {
      await user.click(screen.getByRole('combobox', { name: 'Page Size' }))
      await user.click(await screen.findByTitle(`${size} / page`))
      expect(tableRows()).toBe(count)
    }
  }, 15_000)

  it('hiển thị nhãn Sub mặc định và email trong cột liên hệ', () => {
    renderPage(SUB_PATH)
    const row = screen.getByText('SUB-0142-01').closest('tr')!
    expect(within(row).getByText('Mặc định')).toBeInTheDocument()
    expect(within(row).getByText('nguyenhue@highlands.example.vn')).toBeInTheDocument()
    expect(within(row).getByText('028 3822 9988')).toBeInTheDocument()
  })

  it.each([SUB_PATH, `${SUB_PATH}/detail/sub-001`])(
    'dialog khóa từ %s có số dư và cảnh báo gián đoạn', async (path) => {
      renderPage(path)
      const user = userEvent.setup()
      await user.click(screen.getByRole('button', {
        name: path === SUB_PATH ? 'Khóa Sub-merchant HLC Nguyễn Huệ' : 'Khóa Sub-merchant'
      }))
      const dialog = within(screen.getByRole('dialog'))
      expect(dialog.getByText(/128\.450\.000/)).toBeInTheDocument()
      expect(dialog.getByRole('alert')).toHaveTextContent(/thanh toán.*rút tiền/)
      expect(dialog.queryByText(/Audit Log/)).not.toBeInTheDocument()
    }
  )

  it.each([
    ['create', 'Hệ thống tự sinh'], ['edit/sub-001', 'sub-001']
  ])('hiển thị Sub ID chỉ đọc ở %s', (path, value) => {
    renderPage(`${SUB_PATH}/${path}`)
    expect(screen.getByText('Sub-merchant ID')).toHaveRole('term')
    expect(screen.getByText(value)).toHaveRole('definition')
    expect(screen.queryByRole('textbox', { name: 'Sub-merchant ID' })).not.toBeInTheDocument()
  })

  it('hiển thị nguồn cấu hình từng mục và giữ liên kết module', () => {
    renderPage(`${SUB_PATH}/edit/sub-001`)
    for (const [label, source] of [
      ['Tài khoản ngân hàng', 'Kế thừa từ Master'], ['Key kết nối', 'Cấu hình riêng'],
      ['Hình thức thanh toán', 'Kế thừa từ Master'], ['Cấu hình thông báo', 'Kế thừa từ Master']
    ]) {
      const link = screen.getByRole('link', { name: label })
      expect(link.parentElement).toHaveTextContent(source)
    }
  })

  it('history chỉ hiện theo quyền giao dịch và giải thích trạng thái chưa khả dụng', async () => {
    const noAccess = renderPage(`${SUB_PATH}/detail/sub-001`, [PERMISSION.MERCHANT_VIEW])
    expect(screen.queryByRole('button', { name: 'Lịch sử giao dịch' })).not.toBeInTheDocument()
    noAccess.unmount()
    renderPage(`${SUB_PATH}/detail/sub-001`, [PERMISSION.MERCHANT_VIEW, PERMISSION.TRANSACTION_VIEW])

    const action = screen.getByRole('button', { name: 'Lịch sử giao dịch' })
    expect(action).toBeDisabled()
    await userEvent.hover(action.parentElement!)
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Lịch sử giao dịch theo Sub-merchant chưa khả dụng')
  })
})
