import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { createAppStore } from '@/app/store'
import { savePermissions } from '@slices/authSlice'
import { server } from '@/test/mocks/server'
import MerchantManagement from '../pages/MerchantManagement'

describe('MerchantManagement export', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    delete (URL as { createObjectURL?: typeof URL.createObjectURL })
      .createObjectURL
    delete (URL as { revokeObjectURL?: typeof URL.revokeObjectURL })
      .revokeObjectURL
  })

  it('downloads the CSV response with a CSV filename', async () => {
    server.use(
      http.get('*/merchants', () =>
        HttpResponse.json({
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            number: 0,
            size: 10
          },
          success: true
        })
      ),
      http.get(
        '*/merchants/export',
        () =>
          new HttpResponse('code,name\nM01,Merchant', {
            headers: {
              'content-type': 'text/csv',
              'content-disposition':
                'attachment; filename="merchant-list-from-api.csv"'
            }
          })
      )
    )
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:merchant-export')
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn()
    })
    let downloadedFilename: string | undefined
    const download = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(function (this: HTMLAnchorElement) {
        downloadedFilename = this.download
      })
    const store = createAppStore()
    store.dispatch(
      savePermissions(['EWALLET:MERCHANT:VIEW', 'EWALLET:MERCHANT:EXPORT'])
    )

    render(
      <Provider store={store}>
        <MemoryRouter>
          <MerchantManagement />
        </MemoryRouter>
      </Provider>
    )
    await userEvent.click(
      await screen.findByRole('button', { name: 'Xuất CSV' })
    )
    await waitFor(() => expect(download).toHaveBeenCalledOnce())
    expect(downloadedFilename).toBe('merchant-list-from-api.csv')
  })
})
