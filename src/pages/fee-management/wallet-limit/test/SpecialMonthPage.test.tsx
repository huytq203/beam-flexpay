import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  chooseMonth,
  listRequests,
  mockList,
  months,
  renderPage,
  rowOf,
  setupSpecialMonthTest
} from './SpecialMonthTestHelpers'

setupSpecialMonthTest()

describe('WalletLimitSpecialMonthPage - danh sách', () => {
  it('sắp tăng dần, gắn tag tháng hiện tại, ẩn thao tác của tháng đã qua', async () => {
    renderPage()
    await screen.findByText('09/2026')

    const labels = screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => within(row).getAllByRole('cell')[0].textContent)
    expect(labels).toEqual(['09/2026', '10/2026Tháng hiện tại', '02/2027'])

    const past = rowOf('09/2026')
    expect(
      within(past).getByText('Tháng đã qua, không thể sửa hoặc xóa')
    ).toBeInTheDocument()
    expect(
      within(past).queryByRole('button', { name: /Đổi tên|Xóa/ })
    ).not.toBeInTheDocument()
    expect(
      within(rowOf('10/2026')).getByRole('button', {
        name: 'Đổi tên tháng 10/2026'
      })
    ).toBeInTheDocument()
    expect(
      within(rowOf('02/2027')).getByRole('button', {
        name: 'Xóa tháng 02/2027'
      })
    ).toBeInTheDocument()
  })

  it('lọc theo năm gửi tham số year, Tất cả năm không gửi', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('09/2026')
    expect(listRequests[0].searchParams.has('year')).toBe(false)

    await user.click(screen.getByLabelText('Năm'))
    await user.click(await screen.findByTitle('2027'))

    await waitFor(() =>
      expect(listRequests.at(-1)?.searchParams.get('year')).toBe('2027')
    )
  })

  it('danh sách rỗng hiện gợi ý dùng form phía trên', async () => {
    mockList([])
    renderPage()

    expect(
      await screen.findByText('Chưa có tháng đặc biệt nào')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/Thêm tháng ở biểu mẫu phía trên/)
    ).toBeInTheDocument()
  })

  it('lỗi tải hiện Thử lại và tải lại được', async () => {
    let calls = 0
    server.use(
      http.get('*/wallet-limit-special-months', () => {
        calls += 1
        return calls === 1
          ? HttpResponse.json({ message: 'boom' }, { status: 500 })
          : HttpResponse.json({ data: months })
      })
    )
    const user = userEvent.setup()
    renderPage()

    await user.click(await screen.findByRole('button', { name: 'Thử lại' }))
    expect(await screen.findByText('02/2027')).toBeInTheDocument()
  })
})

describe('WalletLimitSpecialMonthPage - thêm tháng', () => {
  it('gửi {month: yyyy-MM, name} và xóa form khi thành công', async () => {
    const bodies: unknown[] = []
    server.use(
      http.post('*/wallet-limit-special-months', async ({ request }) => {
        bodies.push(await request.json())
        return HttpResponse.json({ data: months[0] })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('09/2026')

    await chooseMonth(user, '02/2027')
    await user.type(
      screen.getByPlaceholderText('Ví dụ: Tết Nguyên đán 2027'),
      '  Tết Nguyên đán 2027 '
    )
    await user.click(
      screen.getByRole('button', { name: 'Thêm tháng đặc biệt' })
    )

    await waitFor(() =>
      expect(bodies).toEqual([
        { month: '2027-02', name: 'Tết Nguyên đán 2027' }
      ])
    )
    await waitFor(() =>
      expect(
        screen.getByPlaceholderText('Ví dụ: Tết Nguyên đán 2027')
      ).toHaveValue('')
    )
  })

  it('thiếu tháng và tên thì báo lỗi, không gọi API', async () => {
    let posted = false
    server.use(
      http.post('*/wallet-limit-special-months', () => {
        posted = true
        return HttpResponse.json({ data: months[0] })
      })
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('09/2026')

    await user.click(
      screen.getByRole('button', { name: 'Thêm tháng đặc biệt' })
    )

    expect(await screen.findByText('Vui lòng chọn tháng.')).toBeInTheDocument()
    expect(
      screen.getByText('Vui lòng nhập tên tháng đặc biệt.')
    ).toBeInTheDocument()
    expect(posted).toBe(false)
  })

  it('hiện ngay trên form lỗi trùng tháng do BE trả về', async () => {
    server.use(
      http.post('*/wallet-limit-special-months', () =>
        HttpResponse.json(
          {
            success: false,
            status: '3006',
            detail: 'Tháng 02/2027 đã có trong danh mục tháng đặc biệt.'
          },
          { status: 400 }
        )
      )
    )
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('09/2026')

    await chooseMonth(user, '02/2027')
    await user.type(
      screen.getByPlaceholderText('Ví dụ: Tết Nguyên đán 2027'),
      'Tết'
    )
    await user.click(
      screen.getByRole('button', { name: 'Thêm tháng đặc biệt' })
    )

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Tháng 02/2027 đã có trong danh mục tháng đặc biệt.'
    )
  })

  it('ẩn nút Thêm khi không có quyền tạo', async () => {
    renderPage([])
    await screen.findByText('09/2026')

    expect(
      screen.queryByRole('button', { name: 'Thêm tháng đặc biệt' })
    ).not.toBeInTheDocument()
  })
})
