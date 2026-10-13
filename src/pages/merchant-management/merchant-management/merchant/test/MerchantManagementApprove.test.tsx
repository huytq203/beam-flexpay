import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import MerchantManagement from '../pages/MerchantManagement'

describe('MerchantManagement approval action', () => {
  it('confirms before approving a pending merchant', async () => {
    const merchant = {
      id: 'merchant-1',
      name: 'Cửa hàng Sao Việt',
      code: 'SV01',
      status: 'PENDING_APPROVAL',
      createdAt: '2026-09-01T08:30:00Z'
    }
    let approvalCount = 0
    server.use(
      http.get('*/merchants', () =>
        HttpResponse.json({
          data: {
            content: [merchant],
            totalElements: 1,
            totalPages: 1,
            number: 0,
            size: 10
          },
          success: true
        })
      ),
      http.post('*/merchants/merchant-1/approve', () => {
        approvalCount += 1
        return HttpResponse.json({
          data: { ...merchant, status: 'ACTIVE' },
          success: true
        })
      })
    )
    const store = createAppStore()
    store.dispatch(
      savePermissions(['EWALLET:MERCHANT:VIEW', 'EWALLET:MERCHANT:APPROVE'])
    )
    const user = userEvent.setup()
    render(
      <Provider store={store}>
        <MemoryRouter>
          <MerchantManagement />
        </MemoryRouter>
      </Provider>
    )

    await user.click(
      await screen.findByRole('button', {
        name: 'Phê duyệt merchant Cửa hàng Sao Việt'
      })
    )
    expect(approvalCount).toBe(0)
    await user.click(screen.getByRole('button', { name: /^Phê duyệt$/ }))
    await waitFor(() => expect(approvalCount).toBe(1))
  })
})
