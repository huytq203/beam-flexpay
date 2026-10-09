import { fireEvent, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  months,
  renderPage,
  setupSpecialMonthTest
} from './SpecialMonthTestHelpers'

setupSpecialMonthTest()

describe('WalletLimitSpecialMonthPage - đổi tên và xóa', () => {
  it('đổi tên gửi PUT {name} rồi đóng modal', async () => {
    const bodies: unknown[] = []
    server.use(
      http.put('*/wallet-limit-special-months/:id', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({ data: months[0] })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('02/2027')

    await user.click(
      screen.getByRole('button', { name: 'Đổi tên tháng 02/2027' })
    )
    const input = await screen.findByPlaceholderText('Nhập tên tháng đặc biệt')
    expect(input).toHaveValue('Tết Nguyên đán 2027')
    await user.clear(input)
    await user.type(input, 'Tết 2027')
    await user.click(screen.getByRole('button', { name: 'Lưu tên' }))

    await waitFor(() => expect(bodies).toEqual([{ name: 'Tết 2027' }]))
    await waitFor(() =>
      expect(
        screen.queryByPlaceholderText('Nhập tên tháng đặc biệt')
      ).not.toBeInTheDocument()
    )
  })

  it('lỗi tháng đã qua từ BE hiện ngay trong modal đổi tên', async () => {
    server.use(
      http.put('*/wallet-limit-special-months/:id', () =>
        HttpResponse.json(
          {
            success: false,
            status: '3001',
            detail: 'Không thể thêm, sửa hoặc xóa tháng đã qua.'
          },
          { status: 400 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('02/2027')

    await user.click(
      screen.getByRole('button', { name: 'Đổi tên tháng 02/2027' })
    )
    await screen.findByPlaceholderText('Nhập tên tháng đặc biệt')
    await user.click(screen.getByRole('button', { name: 'Lưu tên' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Không thể thêm, sửa hoặc xóa tháng đã qua.'
    )
    expect(
      screen.getByPlaceholderText('Nhập tên tháng đặc biệt')
    ).toBeInTheDocument()
  })

  it('xóa phải xác nhận rồi gọi DELETE đúng id', async () => {
    const deleted: string[] = []
    server.use(
      http.delete('*/wallet-limit-special-months/:id', ({ params }) => {
        deleted.push(String(params.id))
        return HttpResponse.json({ data: null })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('02/2027')

    await user.click(screen.getByRole('button', { name: 'Xóa tháng 02/2027' }))
    expect(await screen.findByText('Xóa tháng đặc biệt?')).toBeInTheDocument()
    expect(deleted).toEqual([])
    fireEvent.click(screen.getByRole('button', { name: 'Xóa tháng' }))

    await waitFor(() => expect(deleted).toEqual(['m4']))
    await waitFor(() =>
      expect(screen.queryByText('Xóa tháng đặc biệt?')).not.toBeInTheDocument()
    )
  })
})
