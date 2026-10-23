import { render, waitFor } from '@testing-library/react'
import { Provider } from 'react-redux'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { createAppStore } from '@/app/store'
import { server } from '@/test/mocks/server'
import { MerchantDocumentList } from '../components/MerchantDocumentList'

describe('MerchantDocumentList', () => {
  it('làm mới hồ sơ một lần để lấy link thumbnail khi file chưa có URL', async () => {
    let detailRequests = 0
    server.use(
      http.get('*/merchants/merchant-1', () => {
        detailRequests += 1
        return HttpResponse.json({
          success: true,
          data: {
            id: 'merchant-1',
            productImages: [
              {
                id: 'file-1',
                filename: 'photo.jpg',
                contentType: 'image/jpeg',
                sizeBytes: 1024,
                url: 'https://files.test/fresh.jpg',
                urlExpiresAt: '2099-01-01T00:00:00Z'
              }
            ]
          }
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
              url: 'https://files.test/expired.jpg',
              urlExpiresAt: '2020-01-01T00:00:00Z'
            }
          ]}
        />
      </Provider>
    )

    await waitFor(() =>
      expect(container.querySelector('img')).toHaveAttribute(
        'src',
        'https://files.test/fresh.jpg'
      )
    )
    await new Promise((resolve) => setTimeout(resolve, 100))
    expect(detailRequests).toBe(1)
  })

  it('ưu tiên URL còn hạn đã gắn vào response hồ sơ', async () => {
    let detailRequests = 0
    server.use(
      http.get('*/merchants/merchant-1', () => {
        detailRequests += 1
        return HttpResponse.json({ success: true, data: { id: 'merchant-1' } })
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
    expect(detailRequests).toBe(0)
  })
})
