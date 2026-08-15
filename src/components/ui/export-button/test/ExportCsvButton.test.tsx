import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ExportCsvButton } from '../ExportCsvButton'

describe('ExportCsvButton', () => {
  it('hiển thị nhãn mặc định Xuất CSV', () => {
    render(<ExportCsvButton onExport={vi.fn()} />)

    expect(
      screen.getByRole('button', { name: /Xuất CSV/ })
    ).toBeInTheDocument()
  })

  it('gọi onExport đúng một lần khi bấm', async () => {
    const onExport = vi.fn()
    render(<ExportCsvButton onExport={onExport} />)

    await userEvent.click(screen.getByRole('button', { name: /Xuất CSV/ }))

    expect(onExport).toHaveBeenCalledTimes(1)
  })

  it('khoá nút khi đang tải', () => {
    render(<ExportCsvButton onExport={vi.fn()} loading />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('khoá nút khi disabled', () => {
    render(<ExportCsvButton onExport={vi.fn()} disabled />)

    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('cho phép đổi nhãn', () => {
    render(<ExportCsvButton onExport={vi.fn()} label='Tải danh sách' />)

    expect(
      screen.getByRole('button', { name: /Tải danh sách/ })
    ).toBeInTheDocument()
  })

  it('hiển thị tooltip khi hover kể cả lúc nút bị khoá', async () => {
    const user = userEvent.setup()
    render(
      <ExportCsvButton
        onExport={vi.fn()}
        disabled
        tooltip='File xuất không áp dụng bộ lọc đang chọn'
      />
    )

    const button = screen.getByRole('button')
    expect(button.parentElement).toHaveAttribute('tabindex', '0')
    await user.hover(button.parentElement as HTMLElement)

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'File xuất không áp dụng bộ lọc đang chọn'
    )
  })
})
