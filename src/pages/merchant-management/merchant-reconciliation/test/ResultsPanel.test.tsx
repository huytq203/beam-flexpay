import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { describe, expect, it, vi } from 'vitest'
import { PERMISSION } from '@/app/permissions'
import { server } from '@/test/mocks/server'
import { renderWithStore } from '../../merchant-settlement/test/settlement.setup'
import { ResultsPanel } from '../components/ResultsPanel'
import { BASE, SUB_ID, result } from './reconciliation.setup'

vi.mock('../../merchant-settlement-scope/components/ScopeTargetPicker', () => ({
  ScopeTargetPicker: ({
    onChange
  }: {
    onChange: (value: { id: string; code: string; name: string }) => void
  }) => (
    <button
      type='button'
      onClick={() => onChange({ id: 'sub-1', code: 'S1', name: 'Sub 1' })}
    >
      Chọn Sub thử nghiệm
    </button>
  )
}))

const RESULTS_URL = `${BASE}/sub-merchants/${SUB_ID}/results`
const RUN_URL = `${BASE}/sub-merchants/${SUB_ID}/run`

describe('ResultsPanel', { timeout: 30000 }, () => {
  it('liệt kê kết quả có cột #, mở rộng ra chín phương trình với dòng 7-9 là số lượng', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(RESULTS_URL, () => HttpResponse.json({ data: [result()] }))
    )
    renderWithStore(<ResultsPanel />, [PERMISSION.MERCHANT_RECONCILIATION_VIEW])
    await user.click(
      screen.getByRole('button', { name: 'Chọn Sub thử nghiệm' })
    )
    const table = await screen.findByRole('table')
    expect(await within(table).findByText('22/10/2026')).toBeInTheDocument()
    expect(within(table).getByText('Chạy thủ công')).toBeInTheDocument()
    expect(within(table).getAllByText('#').length).toBeGreaterThan(0)

    await user.click(screen.getByRole('button', { name: /Expand row/i }))
    expect(await screen.findByText('Chưa áp dụng')).toBeInTheDocument()
    expect(screen.getByText('+200.000 đ')).toBeInTheDocument()
    // Phương trình 7 đếm vi phạm, không gắn đơn vị tiền.
    expect(screen.getByText('-2')).toBeInTheDocument()
  })

  it('không có quyền chạy thì ẩn nút Đối soát ngay', () => {
    renderWithStore(<ResultsPanel />, [PERMISSION.MERCHANT_RECONCILIATION_VIEW])
    expect(screen.queryByRole('button', { name: 'Đối soát ngay' })).toBeNull()
  })

  it('run trả 200 UNAVAILABLE: hiện trạng thái chưa đối soát được, không báo cân', async () => {
    const user = userEvent.setup()
    let runs = 0
    server.use(
      http.get(RESULTS_URL, () => HttpResponse.json({ data: [] })),
      http.post(RUN_URL, () => {
        runs += 1
        return HttpResponse.json({
          data: result({
            result: 'UNAVAILABLE',
            equations: [],
            mismatchCount: 0
          })
        })
      })
    )
    renderWithStore(<ResultsPanel />, [PERMISSION.MERCHANT_RECONCILIATION_RUN])
    await user.click(
      screen.getByRole('button', { name: 'Chọn Sub thử nghiệm' })
    )
    await user.click(
      await screen.findByRole('button', { name: 'Đối soát ngay' })
    )

    const notice = await screen.findByText(/Chưa đọc được số dư từ sổ cái/)
    expect(notice).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Thử lại' })).toBeInTheDocument()
    expect(runs).toBe(1)
  })

  it('run lệch hiện số phương trình lệch và bảng phương trình', async () => {
    const user = userEvent.setup()
    server.use(
      http.get(RESULTS_URL, () => HttpResponse.json({ data: [] })),
      http.post(RUN_URL, () => HttpResponse.json({ data: result() }))
    )
    renderWithStore(<ResultsPanel />, [PERMISSION.MERCHANT_RECONCILIATION_RUN])
    await user.click(
      screen.getByRole('button', { name: 'Chọn Sub thử nghiệm' })
    )
    await user.click(
      await screen.findByRole('button', { name: 'Đối soát ngay' })
    )
    expect(
      await screen.findByText(/Có 2 phương trình lệch/)
    ).toBeInTheDocument()
    expect(screen.getByText('+200.000 đ')).toBeInTheDocument()
  })
})
