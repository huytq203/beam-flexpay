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
})
