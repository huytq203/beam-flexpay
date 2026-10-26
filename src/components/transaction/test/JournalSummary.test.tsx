import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { JournalSummary } from '../JournalSummary'
import { JOURNAL_STATUS_ITEMS } from '../journal-summary-items'

const summary = {
  totalCount: 477,
  successCount: 412,
  processingCount: 62,
  pendingCount: 62,
  failedCount: 3
}

const renderSummary = (props: Partial<Parameters<typeof JournalSummary>[0]> = {}) =>
  render(
    <JournalSummary
      ariaLabel='Tổng quan giao dịch'
      summary={summary}
      {...props}
    />
  )

describe('JournalSummary', () => {
  it('hiện số của tổng và của ba trạng thái lọc được', () => {
    renderSummary()

    expect(screen.getByText('477')).toBeInTheDocument()
    expect(screen.getByText('412')).toBeInTheDocument()
    expect(screen.getByText('62')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('không dựng ô cho trạng thái mà API không lọc được', () => {
    renderSummary()

    expect(screen.queryByText('Đang xử lý')).not.toBeInTheDocument()
    expect(
      screen.queryByRole('button', { name: /AUTHORIZED/ })
    ).not.toBeInTheDocument()
  })

  it('không rút gọn số lớn', () => {
    renderSummary({ summary: { ...summary, totalCount: 1284000 } })

    expect(screen.getByText('1.284.000')).toBeInTheDocument()
    expect(screen.queryByText(/1\.2M|1,3tr/)).not.toBeInTheDocument()
  })

  it('gửi status tương ứng khi bấm vào một ô', async () => {
    const onStatusChange = vi.fn()
    renderSummary({ onStatusChange })

    await userEvent.click(screen.getByRole('button', { name: /Thất bại/ }))

    expect(onStatusChange).toHaveBeenCalledWith('FAILED')
  })

  it('bấm lại ô đang lọc thì bỏ lọc', async () => {
    const onStatusChange = vi.fn()
    renderSummary({ onStatusChange, activeStatus: 'PENDING' })

    await userEvent.click(screen.getByRole('button', { name: /Chờ xử lý/ }))

    expect(onStatusChange).toHaveBeenCalledWith(undefined)
  })

  it('bấm ô tổng thì xoá bộ lọc trạng thái', async () => {
    const onStatusChange = vi.fn()
    renderSummary({ onStatusChange, activeStatus: 'POSTED' })

    await userEvent.click(screen.getByRole('button', { name: /Tổng giao dịch/ }))

    expect(onStatusChange).toHaveBeenCalledWith()
  })

  it('đánh dấu đúng ô đang được lọc', () => {
    renderSummary({ activeStatus: 'POSTED' })

    expect(screen.getByRole('button', { name: /Thành công/ })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(screen.getByRole('button', { name: /Tổng giao dịch/ })).toHaveAttribute(
      'aria-pressed',
      'false'
    )
  })

  it('dùng tổng số bản ghi khi BE chưa trả khối summary', () => {
    renderSummary({ summary: undefined, totalFallback: 120 })

    expect(screen.getByText('120')).toBeInTheDocument()
    expect(screen.getAllByText('—')).toHaveLength(JOURNAL_STATUS_ITEMS.length)
  })

  it('hiện khung chờ thay cho số khi đang tải', () => {
    renderSummary({ isLoading: true })

    expect(screen.queryByText('477')).not.toBeInTheDocument()
    expect(screen.getByLabelText('Đang tải tổng quan giao dịch')).toBeInTheDocument()
  })
})
