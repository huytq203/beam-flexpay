import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { FULL, FULL_ONLY_TRANSACTION, REVIEW_ONLY } from './transaction.setup'
import {
  MARK,
  approveAction,
  fill,
  json,
  record,
  rejectAction,
  renderPanel,
  result,
  snapshot
} from './review.setup'

/** Trả lần lượt từng snapshot, lần cuối lặp lại mãi. */
const refreshWith = (...responses: object[]) => {
  let index = 0
  return record('refresh', () =>
    json(responses[Math.min(index++, responses.length - 1)])
  )
}

const checkStatus = async () =>
  userEvent.click(
    await screen.findByRole('button', { name: /Kiểm tra trạng thái/ })
  )

const underReview = snapshot('REVIEW', [
  approveAction(false),
  rejectAction(false)
])

describe('TransactionReviewPanel — hiển thị', () => {
  it('chỉ dành cho lệnh nạp: lệnh rút không có panel', () => {
    renderPanel(FULL, 'a', { type: 'CASH_OUT' })
    expect(
      screen.queryByRole('button', { name: /Kiểm tra trạng thái/ })
    ).toBeNull()
  })

  it.each(['PROCESSING', 'POSTED', 'FAILED'])(
    'không hiện panel khi bút toán ở %s',
    (status) => {
      renderPanel(FULL, 'a', { status })
      expect(
        screen.queryByRole('button', { name: /Kiểm tra trạng thái/ })
      ).toBeNull()
    }
  )

  it('thiếu cả EWALLET:FULL lẫn TRANSACTION:REVIEW thì không render', () => {
    renderPanel(FULL_ONLY_TRANSACTION)
    expect(screen.queryByRole('region')).toBeNull()
    expect(screen.queryByRole('button')).toBeNull()
  })

  it('FULL: chưa kiểm tra thì chưa có nút thao tác; kiểm tra xong hiện nút theo allowedActions', async () => {
    refreshWith(snapshot('PENDING', [MARK]))
    renderPanel(FULL)

    expect(screen.queryByRole('button', { name: 'Đánh dấu Review' })).toBeNull()
    await checkStatus()

    expect(
      await screen.findByRole('button', { name: 'Đánh dấu Review' })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Duyệt$/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Từ chối$/ })).toBeNull()
  })

  it('lệnh đang REVIEW: người khác thấy Duyệt và Từ chối, không còn Đánh dấu', async () => {
    refreshWith(underReview)
    renderPanel(FULL)

    await checkStatus()

    expect(
      await screen.findByRole('button', { name: /Duyệt$/ })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Từ chối$/ })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Đánh dấu Review' })).toBeNull()
  })

  it('không có action REVIEW_REJECT trong allowedActions thì không hiện Từ chối', async () => {
    refreshWith(snapshot('REVIEW', [approveAction(false)]))
    renderPanel(FULL)

    await checkStatus()

    expect(
      await screen.findByRole('button', { name: /Duyệt$/ })
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Từ chối$/ })).toBeNull()
  })
})

describe('TransactionReviewPanel — maker khác checker', () => {
  it('đánh dấu gửi reason; người vừa đánh dấu (bỏ khoảng trắng, không phân biệt hoa thường) không thấy Duyệt/Từ chối', async () => {
    refreshWith(snapshot('PENDING', [MARK]), underReview)
    const mark = record('review', () => json(result()))
    renderPanel(FULL, ' Van.Hanh.A ')

    await checkStatus()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Đánh dấu Review' })
    )
    const dialog = await screen.findByRole('dialog')
    fill(/Lý do review/, 'Nghi ngờ trùng giao dịch, cần đối soát')
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Đánh dấu Review' })
    )

    await waitFor(() => expect(mark.bodies).toHaveLength(1))
    expect(mark.bodies[0]).toEqual({
      reason: 'Nghi ngờ trùng giao dịch, cần đối soát'
    })
    expect(
      await screen.findByText(/Bạn là người đánh dấu Review/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Duyệt$/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Từ chối$/ })).toBeNull()
  })

  it('người đánh dấu khác với người đang đăng nhập vẫn thấy Duyệt/Từ chối', async () => {
    refreshWith(snapshot('PENDING', [MARK]), underReview)
    record('review', () => json(result({ updatedBy: 'nguoi.khac' })))
    renderPanel(FULL, 'van.hanh.a')

    await checkStatus()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Đánh dấu Review' })
    )
    fill(/Lý do review/, 'Nghi ngờ trùng giao dịch, cần đối soát')
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Đánh dấu Review'
      })
    )

    expect(
      await screen.findByRole('button', { name: /Duyệt$/ })
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Từ chối$/ })).toBeInTheDocument()
  })

  it('lý do trống bị chặn và không gọi API', async () => {
    refreshWith(snapshot('PENDING', [MARK]))
    const mark = record('review', () => json(result()))
    renderPanel(FULL)

    await checkStatus()
    await userEvent.click(
      await screen.findByRole('button', { name: 'Đánh dấu Review' })
    )
    fill(/Lý do review/, '   ')
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Đánh dấu Review'
      })
    )

    expect(
      await screen.findByText('Lý do review là bắt buộc')
    ).toBeInTheDocument()
    expect(mark.calls.count).toBe(0)
  })
})

describe('TransactionReviewPanel — chỉ có TRANSACTION:REVIEW', () => {
  it('không gọi được refresh: báo thiếu quyền kiểm tra lại và chỉ cho Đánh dấu Review', async () => {
    const refresh = refreshWith(snapshot('PENDING', [MARK]))
    const mark = record('review', () => json(result()))
    renderPanel(REVIEW_ONLY)

    expect(
      screen.queryByRole('button', { name: /Kiểm tra trạng thái/ })
    ).toBeNull()
    expect(
      screen.getByText(
        /chưa đọc được trạng thái chi tiết vì thiếu quyền kiểm tra lại/
      )
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Duyệt$/ })).toBeNull()

    await userEvent.click(
      screen.getByRole('button', { name: 'Đánh dấu Review' })
    )
    fill(/Lý do review/, 'Nghi ngờ trùng giao dịch, cần đối soát')
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', {
        name: 'Đánh dấu Review'
      })
    )

    await waitFor(() => expect(mark.bodies).toHaveLength(1))
    expect(
      await screen.findByText(/Cần người khác duyệt hoặc từ chối/)
    ).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Đánh dấu Review' })).toBeNull()
    expect(refresh.calls.count).toBe(0)
  })
})
