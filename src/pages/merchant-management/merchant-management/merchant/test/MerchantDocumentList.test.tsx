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
})
