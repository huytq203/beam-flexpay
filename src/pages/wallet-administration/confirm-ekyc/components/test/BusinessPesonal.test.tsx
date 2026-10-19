import { fireEvent, render, screen } from '@testing-library/react'
import type { ContentEKYC } from '@type/apiResponseEKYC'
import { describe, expect, it, vi } from 'vitest'
import BusinessPesonal from '../BusinessPesonal'

const image = (type: string) => ({
  fileId: `${type}-id`,
  type,
  expiresAt: '2099-09-28T07:34:24Z',
  url: `https://s3.test/${type}.jpg`
})

const completed: ContentEKYC = {
  sessionId: 'session-done',
  status: 'COMPLETED',
  createdAt: '2026-09-28T10:31:17',
  completedAt: '2026-09-28T10:32:35',
  evidenceImages: [image('FRONT'), image('BACK'), image('FACE_FAR')]
}

const inProgress: ContentEKYC = {
  sessionId: 'session-new',
  status: 'IN_PROGRESS',
  createdAt: '2026-09-28T11:15:56',
  evidenceImages: []
}

describe('BusinessPesonal — ảnh bằng chứng eKYC', () => {
  it('hiển thị một ảnh chính và chuyển đúng ảnh bằng các nút thu nhỏ', () => {
    render(
      <BusinessPesonal
        attempts={[completed]}
        ocrSessionId='session-done'
      />
    )

    expect(screen.getByAltText('CCCD mặt trước')).toHaveAttribute(
      'src',
      'https://s3.test/FRONT.jpg'
    )
    expect(screen.queryByAltText('CCCD mặt sau')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Xem CCCD mặt sau' }))
    expect(screen.getByAltText('CCCD mặt sau')).toHaveAttribute(
      'src',
      'https://s3.test/BACK.jpg'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Xem Ảnh chân dung' }))
    expect(screen.getByAltText('Ảnh chân dung')).toHaveAttribute(
      'src',
      'https://s3.test/FACE_FAR.jpg'
    )
    expect(
      screen.getByRole('button', { name: 'Xem Ảnh chân dung' })
    ).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText(/Ảnh lấy từ lần thực hiện/)).toBeNull()
  })

  it('nút trước/tiếp theo chuyển ảnh và quay vòng ở hai đầu', () => {
    render(
      <BusinessPesonal
        attempts={[completed]}
        ocrSessionId='session-done'
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }))
    expect(screen.getByAltText('CCCD mặt sau')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }))
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh tiếp theo' }))
    expect(screen.getByAltText('CCCD mặt trước')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Ảnh trước' }))
    expect(screen.getByAltText('Ảnh chân dung')).toBeInTheDocument()
  })

  it('lần mới nhất chưa có ảnh thì lấy lần gần nhất có ảnh và ghi rõ thời điểm', () => {
    render(
      <BusinessPesonal
        attempts={[inProgress, completed]}
        ocrSessionId='session-new'
      />
    )

    expect(screen.getByAltText('CCCD mặt trước')).toBeInTheDocument()
    expect(
      screen.getByText('Ảnh lấy từ lần thực hiện lúc 28/09/2026 10:32.')
    ).toBeInTheDocument()
  })

  it('chưa lần nào có ảnh thì hiện trạng thái trống cho khung chính và ba lựa chọn', () => {
    render(<BusinessPesonal attempts={[inProgress]} />)

    expect(
      screen.getByText('Lần thực hiện này chưa có ảnh.')
    ).toBeInTheDocument()
    expect(screen.getAllByText('Chưa có ảnh')).toHaveLength(3)
  })

  it('link ảnh hết hạn thì báo và cho tải lại', () => {
    const onReload = vi.fn()
    render(
      <BusinessPesonal
        attempts={[completed]}
        ocrSessionId='session-done'
        onReload={onReload}
      />
    )

    fireEvent.error(screen.getByAltText('CCCD mặt trước'))

    expect(screen.getByText('Liên kết ảnh đã hết hạn.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /Tải lại ảnh/ }))
    expect(onReload).toHaveBeenCalledTimes(1)
  })

  it('không hiển thị ảnh của phiên khác khi đang xét duyệt phiên được chọn', () => {
    render(
      <BusinessPesonal
        attempts={[completed, inProgress]}
        selectedSessionId='session-new'
      />
    )
    expect(screen.queryByAltText('CCCD mặt trước')).not.toBeInTheDocument()
    expect(
      screen.getByText('Lần thực hiện này chưa có ảnh.')
    ).toBeInTheDocument()
  })
})
