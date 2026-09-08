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

  it('khoá nút và nêu cách gỡ khi bộ lọc vượt trần 100.000 dòng', async () => {
    const user = userEvent.setup()
    const onExport = vi.fn()
    render(<ExportCsvButton onExport={onExport} totalRows={240_000} />)

    const button = screen.getByRole('button', { name: /Xuất CSV/ })
    expect(button).toBeDisabled()

    await user.hover(button.parentElement as HTMLElement)
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('240.000 dòng')
    expect(tooltip).toHaveTextContent('vượt trần 100.000 dòng')
    expect(tooltip).toHaveTextContent(/Thu hẹp khoảng thời gian/)
    expect(onExport).not.toHaveBeenCalled()
  })

  it('giữ nguyên nút khi số dòng còn trong trần', () => {
    render(<ExportCsvButton onExport={vi.fn()} totalRows={100_000} />)

    expect(screen.getByRole('button', { name: /Xuất CSV/ })).toBeEnabled()
  })

  it('giữ lại ghi chú của màn bên cạnh cảnh báo vượt trần', async () => {
    const user = userEvent.setup()
    render(
      <ExportCsvButton
        onExport={vi.fn()}
        totalRows={120_000}
        tooltip='File sắp theo thời gian tạo giảm dần'
      />
    )

    await user.hover(
      screen.getByRole('button').parentElement as HTMLElement
    )
    const tooltip = await screen.findByRole('tooltip')
    expect(tooltip).toHaveTextContent('vượt trần 100.000 dòng')
    expect(tooltip).toHaveTextContent('File sắp theo thời gian tạo giảm dần')
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
