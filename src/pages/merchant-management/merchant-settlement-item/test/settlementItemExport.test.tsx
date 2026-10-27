import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import { PATH, VIEW_ONLY, renderPage } from './settlementItem.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

describe('xuất CSV mục quyết toán', () => {
  it('gửi đúng bộ lọc và sắp xếp đang áp, không phân trang', async () => {
    let query = ''
    server.use(
      http.get('*/merchant-settlement-items/export', ({ request }) => {
        query = new URL(request.url).search
        return new HttpResponse('a,b', {
          headers: { 'Content-Type': 'text/csv' }
        })
      })
    )
    renderPage(
      VIEW_ONLY,
      `${PATH}?merchantId=master-1&paidFrom=2026-10-01&paidTo=2026-10-22&sortBy=customerPaid&sortDirection=DESC`
    )
    await screen.findByText('ORD-a1')
    await userEvent.click(screen.getByRole('button', { name: /Xuất CSV/ }))
    await waitFor(() => expect(query).not.toBe(''))
    const params = new URLSearchParams(query)
    expect(params.get('merchantId')).toBe('master-1')
    expect(params.get('paidFrom')).toBe('2026-10-01')
    expect(params.get('sortBy')).toBe('customerPaid')
    expect(params.get('sortDirection')).toBe('DESC')
    expect(params.has('page')).toBe(false)
    expect(params.has('size')).toBe(false)
  })

  it('chưa có khoảng ngày thì nút xuất bị khóa', async () => {
    renderPage(VIEW_ONLY, PATH)
    await screen.findByText(/Chọn khoảng ngày thanh toán/)
    expect(screen.getByRole('button', { name: /Xuất CSV/ })).toBeDisabled()
  })
})
