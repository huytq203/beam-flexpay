import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { MerchantDocumentList } from '../components/MerchantDocumentList'

describe('MerchantDocumentList', () => {
  it('chỉ xin một link thumbnail cho một ảnh đã lưu', async () => {
    let requests = 0
    server.use(
      http.get('*/merchants/merchant-1/documents/file-1/url', () => {
        requests += 1
        return HttpResponse.json({
          success: true,
          data: { url: 'https://files.test/photo.jpg' }
        })
      })
    )
    render(
      <Provider store={createAppStore()}>
        <MerchantDocumentList
          merchantId='merchant-1'
          title='Ảnh sản phẩm'
          files={[
            {
              id: 'file-1',
              filename: 'photo.jpg',
              contentType: 'image/jpeg',
              sizeBytes: 1024
            }
          ]}
        />
      </Provider>
    )

    await waitFor(() => expect(requests).toBe(1))
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(requests).toBe(1)
  })

  it('ưu tiên URL còn hạn đã gắn vào response hồ sơ', async () => {
    let legacyRequests = 0
    server.use(
      http.get('*/merchants/merchant-1/documents/file-1/url', () => {
        legacyRequests += 1
        return HttpResponse.json({
          success: true,
          data: { url: 'https://files.test/legacy.jpg' }
        })
      })
    )
    const { container } = render(
      <Provider store={createAppStore()}>
        <MerchantDocumentList
          merchantId='merchant-1'
          title='Ảnh sản phẩm'
          files={[
            {
              id: 'file-1',
              filename: 'photo.jpg',
              contentType: 'image/jpeg',
              sizeBytes: 1024,
              url: 'https://files.test/direct.jpg',
              urlExpiresAt: '2099-01-01T00:00:00Z'
            }
          ]}
        />
      </Provider>
    )
    await waitFor(() =>
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        'https://files.test/direct.jpg'
      )
    )
    expect(legacyRequests).toBe(0)
  })
})
