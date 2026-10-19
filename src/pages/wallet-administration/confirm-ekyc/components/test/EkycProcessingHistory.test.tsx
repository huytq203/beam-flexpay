import { render, screen, within } from '@testing-library/react'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import type { ContentEKYC } from '@type/apiResponseEKYC'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProcessingHistory } from '../EkycProcessingHistory'

dayjs.extend(utc)

const attempts: ContentEKYC[] = [
  {
    sessionId: 'session-3',
    status: 'COMPLETED',
    currentStep: 'FACE_COMPARE',
    createdAt: '2026-10-19T15:20:59Z',
    expiresAt: '2026-10-19T15:50:59Z'
  },
  {
    sessionId: 'session-2',
    status: 'IN_PROGRESS',
    currentStep: 'OCR',
    createdAt: '2026-10-19T11:21:23Z',
    expiresAt: '2026-10-19T11:51:23Z'
  },
  {
    sessionId: 'session-1',
    status: 'IN_PROGRESS',
    currentStep: 'OCR',
    createdAt: '2026-10-19T11:18:49Z',
    expiresAt: '2099-10-19T11:48:49Z'
  }
]

const rowOf = (name: string) => {
  const row = screen.getByRole('button', { name }).closest('tr')
  if (!row) throw new Error(`Không tìm thấy hàng ${name}`)
  return within(row)
}

describe('ProcessingHistory', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-10-19T15:30:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('gắn nhãn phiên áp dụng, các phiên còn lại giữ số thứ tự', () => {
    render(<ProcessingHistory attempts={attempts} />)

    expect(
      screen.getByRole('button', {
        name: 'Xem chi tiết phiên áp dụng'
      })
    ).toHaveTextContent('Áp dụng')
    expect(
      screen.getByRole('button', { name: 'Xem chi tiết lần 2' })
    ).toHaveTextContent('#2')
    expect(screen.queryByText('#3')).not.toBeInTheDocument()
  })

  it('phiên đang chạy đã quá hạn hiển thị Hết hạn và bước dừng', () => {
    render(<ProcessingHistory attempts={attempts} />)

    const stalled = rowOf('Xem chi tiết lần 2')
    expect(stalled.getByText('Hết hạn')).toBeInTheDocument()
    expect(
      stalled.getByText('Dừng ở: Trích xuất thông tin')
    ).toBeInTheDocument()

    const running = rowOf('Xem chi tiết lần 1')
    expect(running.getByText('Đang xử lý')).toBeInTheDocument()
    expect(running.getByText('Trích xuất thông tin')).toBeInTheDocument()
  })
})
