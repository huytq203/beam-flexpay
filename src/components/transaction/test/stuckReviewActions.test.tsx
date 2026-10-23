import { describe, expect, it } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '@/test/mocks/server'
import { getFinalActions } from '../stuckTransaction.utils'
import {
  CODE,
  NOTE,
  POSTED_FULL,
  TRIGGER,
  choose,
  fill,
  mockRefresh,
  openForm,
  renderAction,
  submit
} from './stuck.setup'

const REVIEW_APPROVE = {
  status: 'POSTED',
  mode: 'REVIEW_APPROVE',
  requiredFields: ['authCode', 'settlementId', 'note']
}
const REVIEW_REJECT = {
  status: 'FAILED',
  mode: 'REVIEW_REJECT',
  requiredFields: ['option', 'reason']
}
const MARK_REVIEW = {
  status: 'REVIEW',
  mode: 'MARK_REVIEW',
  requiredFields: ['reason']
}

describe('getFinalActions với action Review', () => {
  it('bỏ REVIEW_APPROVE, REVIEW_REJECT và MARK_REVIEW, giữ action cập nhật treo', () => {
    const result = getFinalActions([
      POSTED_FULL,
      MARK_REVIEW,
      REVIEW_APPROVE,
      REVIEW_REJECT
    ])
    expect(result).toEqual([POSTED_FULL])
  })

  it('lệnh REVIEW chỉ còn action Review thì không còn thao tác cập nhật', () => {
    expect(getFinalActions([REVIEW_APPROVE, REVIEW_REJECT])).toEqual([])
  })
})

describe('StuckTransactionUpdateAction với lệnh đang REVIEW', () => {
  it('bấm nút mà snapshot là REVIEW thì không mở popup và báo dùng Duyệt/Từ chối', async () => {
    mockRefresh([REVIEW_APPROVE, REVIEW_REJECT], undefined, 'REVIEW')
    const user = renderAction()
    await openForm(user)

    expect(await screen.findByText(/đang chờ review/)).toBeVisible()
    expect(screen.queryByLabelText(/Kết quả cuối/)).toBeNull()
  })

  it('409 rồi refresh trả REVIEW thì đóng popup và báo dùng Duyệt/Từ chối', async () => {
    let refreshCalls = 0
    server.use(
      http.post(`*/transactions/${CODE}/refresh`, () => {
        refreshCalls += 1
        const underReview = refreshCalls > 1
        return HttpResponse.json({
          success: true,
          data: {
            transactionCode: CODE,
            status: underReview ? 'REVIEW' : 'RECONCILIATION_REQUIRED',
            allowedActions: underReview
              ? [REVIEW_APPROVE, REVIEW_REJECT]
              : [POSTED_FULL]
          }
        })
      }),
      http.post(`*/transactions/${CODE}/update-status`, () =>
        HttpResponse.json(
          {
            success: false,
            message: 'RECONCILIATION_CONFLICT',
            detail: 'Giao dịch đang chờ review'
          },
          { status: 409 }
        )
      )
    )
    const user = renderAction()
    await openForm(user)
    await choose(user, 'Thành công')
    fill('Lý do cập nhật', NOTE)
    await submit(user)

    await waitFor(() =>
      expect(screen.queryByLabelText(/Kết quả cuối/)).toBeNull()
    )
    expect(await screen.findByText(/Dùng Duyệt hoặc Từ chối/)).toBeVisible()
    expect(screen.queryByRole('button', { name: TRIGGER })).toBeNull()
  })
})
