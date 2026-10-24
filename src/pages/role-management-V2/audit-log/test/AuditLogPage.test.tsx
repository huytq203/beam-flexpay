import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { server } from '@/test/mocks/server'
import {
  AUDIT_ID,
  VIEW_ONLY,
  WITH_EXPORT,
  page,
  record,
  renderPage
} from './auditLog.setup'

vi.mock('@utils/file-download', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@utils/file-download')>()),
  saveBlobAsFile: vi.fn().mockResolvedValue(undefined)
}))

describe('Nhật ký hệ thống: danh sách', () => {
  it('hiện cột # và nhãn tiếng Việt, chỉ gửi page/size khi chưa lọc', async () => {
    let search = ''
    server.use(
      http.get('*/audit-logs', ({ request }) => {
        search = new URL(request.url).search
        return page([record()])
      })
    )
    renderPage()
    const row = (await screen.findByText('admin.hung')).closest('tr')!
    expect(within(row).getByText('1')).toBeInTheDocument()
    expect(within(row).getByText('Merchant')).toBeInTheDocument()
    expect(within(row).getByText('Khóa')).toBeInTheDocument()
    expect(within(row).getByText('Quản trị viên Flexpay')).toBeInTheDocument()
    expect(screen.getByRole('columnheader', { name: '#' })).toBeInTheDocument()
    expect(search).toBe('?page=1&size=20')
  })

  it('gửi đúng giá trị lọc khi bấm Tìm kiếm và chặn UUID sai định dạng', async () => {
    const user = userEvent.setup()
    const searches: string[] = []
    server.use(
      http.get('*/audit-logs', ({ request }) => {
        searches.push(new URL(request.url).search)
        return page([])
      })
    )
    renderPage()
    expect(
      await screen.findByText('Không có bản ghi nhật ký nào')
    ).toBeInTheDocument()
    await user.type(screen.getByLabelText('Loại đối tượng'), 'MerchantUser')
    await user.type(
      screen.getByLabelText('ID người thực hiện'),
      'khong-phai-uuid'
    )
    const before = searches.length
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    expect(
      await screen.findByText('ID người thực hiện phải là UUID hợp lệ.')
    ).toBeInTheDocument()
    expect(searches).toHaveLength(before)

    await user.clear(screen.getByLabelText('ID người thực hiện'))
    await user.click(screen.getByRole('button', { name: 'Tìm kiếm' }))
    await waitFor(() =>
      expect(searches.at(-1)).toBe('?page=1&size=20&entityName=MerchantUser')
    )
  })

  it('hiện detail của BE khi tải lỗi và cho thử lại', async () => {
    server.use(
      http.get('*/audit-logs', () =>
        HttpResponse.json(
          {
            success: false,
            message: 'FORBIDDEN',
            status: '2002',
            detail: 'Không có quyền truy cập'
          },
          { status: 403 }
        )
      )
    )
    renderPage()
    expect(
      await screen.findByText('Không có quyền truy cập')
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
  })
})

describe('Nhật ký hệ thống: xuất file', () => {
  it('ẩn nút xuất khi chỉ có AUDIT:VIEW', async () => {
    renderPage(VIEW_ONLY)
    await screen.findByText('admin.hung')
    expect(screen.queryByRole('button', { name: /Xuất Excel/ })).toBeNull()
  })

  it('xuất với đúng bộ lọc đang áp dụng và không gửi page/size', async () => {
    const user = userEvent.setup()
    let url: URL | undefined
    server.use(
      http.get('*/audit-logs/export', ({ request }) => {
        url = new URL(request.url)
        return new HttpResponse('"a"', {
          headers: { 'Content-Type': 'text/csv;charset=UTF-8' }
        })
      })
    )
    renderPage(WITH_EXPORT)
    await screen.findByText('admin.hung')
    await user.click(screen.getByRole('button', { name: /Xuất Excel/ }))
    await waitFor(() => expect(url).toBeDefined())
    expect(Object.fromEntries(url?.searchParams ?? [])).toEqual({})
  })

  it('khóa nút xuất khi bộ lọc khớp quá 50.000 dòng', async () => {
    server.use(http.get('*/audit-logs', () => page([record()], 50_001)))
    renderPage(WITH_EXPORT)
    await screen.findByText('admin.hung')
    expect(screen.getByRole('button', { name: /Xuất Excel/ })).toBeDisabled()
  })
})

describe('Nhật ký hệ thống: chi tiết', () => {
  const openDetail = async () => {
    const user = userEvent.setup()
    renderPage()
    await user.click(await screen.findByLabelText(`Xem nhật ký ${AUDIT_ID}`))
  }

  it('hiện bảng so sánh trước/sau từ API chi tiết', async () => {
    await openDetail()
    const changed = (await screen.findByText('status')).closest('tr')!
    expect(changed).toHaveAttribute('data-changed', 'true')
    expect(within(changed).getByText('ACTIVE')).toBeInTheDocument()
    expect(within(changed).getByText('LOCKED')).toBeInTheDocument()
    expect(screen.getByText('name').closest('tr')).toHaveAttribute(
      'data-changed',
      'false'
    )
  })

  it('coi data null (HTTP 200) là không tìm thấy', async () => {
    server.use(
      http.get('*/audit-logs/:id', () =>
        HttpResponse.json({ data: null, success: true })
      )
    )
    await openDetail()
    expect(
      await screen.findByText('Không tìm thấy bản ghi nhật ký.')
    ).toBeInTheDocument()
  })
})
