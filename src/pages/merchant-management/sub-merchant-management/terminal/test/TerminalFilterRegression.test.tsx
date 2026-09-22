import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'

import { resetSubMerchantRepository, toggleSubMerchantStatus } from '../../sub-merchant/hooks/useSubMerchants'
import { suppressAntPseudoElementWarning } from '../../sub-merchant/test/domTestSetup'
import { resetTerminalRepository } from '../hooks/useTerminals'
import TerminalListPage from '../pages/TerminalListPage'

suppressAntPseudoElementWarning()
beforeEach(() => {
  resetSubMerchantRepository()
  resetTerminalRepository()
})

describe('Terminal list cho phép tra cứu Sub ngừng hoạt động', () => {
  it.each([
    ['Highlands Coffee', 'HLC Nguyễn Huệ', 'QR Quầy 02'],
    ['GS25 Việt Nam', 'GS25 Nguyễn Trãi', 'SoftPOS Nguyễn Trãi 01']
  ])('lọc được Terminal của %s dù Sub khóa/tạm ngưng', async (merchant, sub, terminal) => {
    toggleSubMerchantStatus('sub-001', 'Khóa để đối soát')
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.MERCHANT_VIEW]))
    render(<Provider store={store}><MemoryRouter><TerminalListPage /></MemoryRouter></Provider>)
    const user = userEvent.setup()

    await user.click(screen.getByLabelText('Merchant cha'))
    await user.click(await screen.findByTitle(merchant))
    await user.click(screen.getByLabelText('Sub-merchant'))
    await user.click(await screen.findByTitle(sub))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))

    expect(screen.getByText(terminal)).toBeInTheDocument()
    expect(screen.queryByText('QR Thanh toán 01')).not.toBeInTheDocument()
  }, 10_000)
})
