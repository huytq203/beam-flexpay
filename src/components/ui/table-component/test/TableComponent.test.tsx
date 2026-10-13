import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { renderWithProviders } from '@/test/render'
import TableComponent from '../TableComponent'

const columns = [{ title: 'Tên', dataIndex: 'name', key: 'name' }]
const dataSource = [{ id: '1', name: 'FlexPay' }]

describe('TableComponent', () => {
  it('không hiển thị nút làm mới khi chưa có callback', () => {
    renderWithProviders(
      <TableComponent
        rowKey='id'
        columns={columns}
        dataSource={dataSource}
      />
    )

    expect(
      screen.queryByRole('button', { name: 'Làm mới dữ liệu' })
    ).not.toBeInTheDocument()
  })

  it('gọi callback và khóa nút trong lúc làm mới', async () => {
    let resolveRefresh: (() => void) | undefined
    const onRefresh = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveRefresh = resolve
        })
    )
    const user = userEvent.setup()

    renderWithProviders(
      <TableComponent
        rowKey='id'
        columns={columns}
        dataSource={dataSource}
        onRefresh={onRefresh}
      />
    )

    const refreshButton = screen.getByRole('button', {
      name: 'Làm mới dữ liệu'
    })
    await user.click(refreshButton)

    expect(onRefresh).toHaveBeenCalledOnce()
    expect(refreshButton).toBeDisabled()
    expect(refreshButton).toHaveAttribute('aria-busy', 'true')
    expect(refreshButton.querySelector('svg')).toHaveClass('animate-spin')

    resolveRefresh?.()
    const idleButton = await screen.findByRole('button', {
      name: 'Làm mới dữ liệu'
    })
    expect(idleButton).toBeEnabled()
    expect(idleButton).toHaveAttribute('aria-busy', 'false')
    expect(idleButton.querySelector('svg')).not.toHaveClass('animate-spin')
  })

  describe('cột Thao tác', () => {
    const actionColumns = [
      { title: 'Tên', dataIndex: 'name', key: 'name' },
      {
        title: 'Thao tác',
        key: 'action',
        width: 190,
        fixed: 'right' as const,
        render: () => <button type='button'>Sửa</button>
      }
    ]

    const layoutOf = (container: HTMLElement): string =>
      container.querySelector('table')?.style.tableLayout ?? ''
    const colWidths = (container: HTMLElement): string[] =>
      Array.from(container.querySelectorAll('col')).map(
        (col) => (col as HTMLElement).style.width
      )

    it('co theo nội dung: bỏ độ rộng cố định và dùng bố cục auto', () => {
      const { container } = renderWithProviders(
        <TableComponent
          rowKey='id'
          columns={actionColumns}
          dataSource={dataSource}
        />
      )

      expect(layoutOf(container)).toBe('auto')
      expect(colWidths(container)).toContain('1px')
      expect(colWidths(container)).not.toContain('190px')
    })

    it('bảng có cột ellipsis giữ độ rộng khai báo của cột thao tác', () => {
      const { container } = renderWithProviders(
        <TableComponent
          rowKey='id'
          columns={[
            { title: 'Tên', dataIndex: 'name', ellipsis: true, width: 120 },
            ...actionColumns.slice(1)
          ]}
          dataSource={dataSource}
        />
      )

      // Giữ độ rộng khai báo thì bảng vẫn ở bố cục cố định như trước khi có quy tắc co cột.
      expect(colWidths(container)).toContain('190px')
    })

    it('tôn trọng tableLayout do trang truyền vào', () => {
      const { container } = renderWithProviders(
        <TableComponent
          rowKey='id'
          tableLayout='fixed'
          columns={actionColumns}
          dataSource={dataSource}
        />
      )

      expect(layoutOf(container)).toBe('fixed')
      expect(colWidths(container)).toContain('190px')
    })
  })
})
