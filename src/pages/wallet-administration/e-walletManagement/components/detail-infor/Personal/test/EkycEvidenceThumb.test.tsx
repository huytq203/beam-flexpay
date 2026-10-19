import { renderWithProviders } from '@/test/render'
import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { EkycEvidenceThumb } from '../components/EkycEvidenceThumb'

const FUTURE = '2999-01-01T00:00:00Z'
const PAST = '2000-01-01T00:00:00Z'

const image = (expiresAt: string) => ({
  fileId: 'file-1',
  type: 'FACE_FAR',
  expiresAt,
  url: 'https://example.com/face.jpg'
})

describe('EkycEvidenceThumb', () => {
  it('hiển thị ảnh bằng chứng khi link còn hạn', () => {
    renderWithProviders(
      <EkycEvidenceThumb
        label='Chân dung'
        caption='Chân dung'
        image={image(FUTURE)}
      />
    )

    expect(screen.getByRole('img', { name: 'Chân dung' })).toHaveAttribute(
      'src',
      'https://example.com/face.jpg'
    )
  })

  it('hiện ô trống khi chưa có ảnh', () => {
    renderWithProviders(
      <EkycEvidenceThumb
        label='Mặt trước'
        caption='CCCD Trước'
      />
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(screen.getByText('Mặt trước')).toBeInTheDocument()
  })

  it('báo hết hạn khi link đã quá expiresAt', () => {
    renderWithProviders(
      <EkycEvidenceThumb
        label='Mặt sau'
        caption='CCCD Sau'
        image={image(PAST)}
      />
    )

    expect(screen.queryByRole('img')).not.toBeInTheDocument()
    expect(
      screen.getByText('Ảnh đã hết hạn, tải lại trang')
    ).toBeInTheDocument()
  })

  it('báo hết hạn khi ảnh tải lỗi', () => {
    renderWithProviders(
      <EkycEvidenceThumb
        label='Chân dung'
        caption='Chân dung'
        image={image(FUTURE)}
      />
    )

    fireEvent.error(screen.getByRole('img', { name: 'Chân dung' }))

    expect(
      screen.getByText('Ảnh đã hết hạn, tải lại trang')
    ).toBeInTheDocument()
  })
})
