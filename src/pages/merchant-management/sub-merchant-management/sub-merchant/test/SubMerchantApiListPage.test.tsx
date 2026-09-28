import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { PERMISSION } from '@/app/permissions'
import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import SubMerchantListPage from '../pages/SubMerchantListPage'

const record = {
  id: 'sub-1', code: 'SUB001', name: 'Chi nhánh 1', status: 'ACTIVE',
  merchantId: 'merchant-1', merchantCode: 'MC001', merchantName: 'Merchant 1',
  legalName: 'Chi nhánh Một', taxCode: '0123456789', businessField: 'Bán lẻ',
  phone: { value: '0901234567' }, address: { value: '12 Lê Lợi' }
}

function CurrentPath() { return <span data-testid='current-path'>{useLocation().pathname}</span> }

describe('Sub-merchant API list', () => {
  it('hiển thị bộ lọc, cột # và xem chi tiết trong modal trên cùng route', async () => {
    const user = userEvent.setup()
    server.use(
      http.get('*/sub-merchants', () => HttpResponse.json({ data: { content: [record], totalElements: 1, number: 0, size: 10 } })),
      http.get('*/sub-merchants/:id', () => HttpResponse.json({ data: record }))
    )
    const store = createAppStore()
    store.dispatch(savePermissions([PERMISSION.SUB_MERCHANT_VIEW]))
    render(<Provider store={store}><MemoryRouter initialEntries={['/sub-merchant']}><CurrentPath /><Routes><Route path='/sub-merchant' element={<SubMerchantListPage />} /></Routes></MemoryRouter></Provider>)

    expect(screen.getByRole('heading', { name: 'Bộ lọc tìm kiếm' })).toBeInTheDocument()
    expect(await screen.findByRole('columnheader', { name: '#' })).toBeInTheDocument()
    await user.click(await screen.findByRole('button', { name: 'Xem Sub-merchant Chi nhánh 1' }))
    const dialog = await screen.findByRole('dialog', { name: 'Chi tiết Sub-merchant' })
    expect(dialog).toHaveTextContent('12 Lê Lợi')
    expect(dialog).toHaveTextContent('0123456789')
    expect(screen.getByTestId('current-path')).toHaveTextContent('/sub-merchant')
    await user.click(screen.getByRole('button', { name: 'Close' }))
    expect(screen.getByTestId('current-path')).toHaveTextContent('/sub-merchant')
  })
})
