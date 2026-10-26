import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { http, HttpResponse } from 'msw'
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createAppStore } from '@/app/store'
import { MessageProvider } from '@/app/hooks/MessageProvider'
import { server } from '@/test/mocks/server'
import CreateMerchant from '../pages/CreateMerchant'

describe('Ảnh sản phẩm merchant', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', {
      configurable: true,
      value: vi.fn(() => 'blob:test-image')
    })
    Object.defineProperty(URL, 'revokeObjectURL', {
      configurable: true,
      value: vi.fn()
    })
  })

  afterAll(() => {
    delete (URL as { createObjectURL?: typeof URL.createObjectURL })
      .createObjectURL
    delete (URL as { revokeObjectURL?: typeof URL.revokeObjectURL })
      .revokeObjectURL
  })

  it('lưu nhiều ảnh mới và danh sách ảnh cũ cần gỡ', async () => {
    let uploadCount = 0
    let savedPayload: Record<string, unknown> | undefined
    server.use(
      http.get('*/merchants/merchant-1', () =>
        HttpResponse.json({
          success: true,
          data: {
            id: 'merchant-1',
            name: 'Cửa hàng thử nghiệm',
            mccCode: '5734',
            merchantType: 'ENTERPRISE',
            enterpriseWalletId: 'wallet-1',
            enterpriseWallet: {
              id: 'wallet-1',
              legalName: 'Công ty thử nghiệm',
              registeredEmail: 'owner@example.com',
              businessType: 'ENTERPRISE'
            },
            contractSignedWithSub: true,
            productImages: [
              {
                id: 'old-1',
                filename: 'old.jpg',
                contentType: 'image/jpeg',
                sizeBytes: 1024
              }
            ]
          }
        })
      ),
      http.post('*/documents', ({ request }) => {
        expect(new URL(request.url).searchParams.has('documentType')).toBe(
          false
        )
        uploadCount += 1
        return HttpResponse.json({
          success: true,
          data: { stagingId: `stage-${uploadCount}` }
        })
      }),
      http.put('*/merchants/merchant-1', async ({ request }) => {
        savedPayload = (await request.json()) as Record<string, unknown>
        return HttpResponse.json({ success: true, data: { id: 'merchant-1' } })
      })
    )

    const user = userEvent.setup()
    const { container } = render(
      <Provider store={createAppStore()}>
        <MessageProvider>
          <MemoryRouter initialEntries={['/merchants/merchant-1/edit']}>
            <Routes>
              <Route
                path='/merchants/:id/edit'
                element={<CreateMerchant />}
              />
            </Routes>
          </MemoryRouter>
        </MessageProvider>
      </Provider>
    )

    await user.click(await screen.findByRole('button', { name: 'Xóa old.jpg' }))
    const input = [
      ...container.querySelectorAll<HTMLInputElement>('input[type="file"]')
    ].find((element) => element.multiple)!
    await user.upload(input, [
      new File(['one'], 'one.jpg', { type: 'image/jpeg' }),
      new File(['two'], 'two.png', { type: 'image/png' })
    ])
    await user.click(screen.getByText('Lưu thay đổi').closest('button')!)

    await waitFor(() => expect(savedPayload).toBeDefined())
    expect(uploadCount).toBe(2)
    expect(savedPayload?.productImageStagingIds).toEqual(['stage-1', 'stage-2'])
    expect(savedPayload?.removedProductImageIds).toEqual(['old-1'])
  })
})
