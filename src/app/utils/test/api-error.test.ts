import { describe, expect, it } from 'vitest'
import { getApiErrorDetail } from '../api-error'

describe('getApiErrorDetail', () => {
  it('lấy câu tiếng Việt ở detail của envelope lỗi BE', () => {
    const error = {
      status: 409,
      data: {
        message: 'MERCHANT_TERMINAL_HAS_ACTIVITY',
        detail: 'Terminal đã phát sinh giao dịch'
      }
    }
    expect(getApiErrorDetail(error, 'Lỗi chung')).toBe(
      'Terminal đã phát sinh giao dịch'
    )
  })
  it('dùng câu dự phòng khi không có detail dạng chuỗi', () => {
    expect(getApiErrorDetail({ status: 500, data: {} }, 'Lỗi chung')).toBe(
      'Lỗi chung'
    )
    expect(
      getApiErrorDetail({ status: 500, data: { detail: 5 } }, 'Lỗi chung')
    ).toBe('Lỗi chung')
    expect(getApiErrorDetail(null, 'Lỗi chung')).toBe('Lỗi chung')
    expect(getApiErrorDetail({ status: 'FETCH_ERROR' }, 'Lỗi chung')).toBe(
      'Lỗi chung'
    )
  })
  it('bỏ qua detail rỗng', () => {
    expect(getApiErrorDetail({ data: { detail: '  ' } }, 'Lỗi chung')).toBe(
      'Lỗi chung'
    )
  })
})
