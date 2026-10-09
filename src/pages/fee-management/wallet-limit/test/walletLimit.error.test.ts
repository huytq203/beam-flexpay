import { describe, expect, it } from 'vitest'
import { parseWalletLimitError } from '../utils/walletLimit.error'

describe('parseWalletLimitError', () => {
  it('nhận biết xung đột phiên bản 409 mã 19110', () => {
    const result = parseWalletLimitError({
      status: 409,
      data: {
        success: false,
        status: '19110',
        detail:
          'Cấu hình đã được người khác cập nhật. Vui lòng tải lại trước khi lưu.'
      }
    })

    expect(result.kind).toBe('conflict')
    expect(result.message).toContain('tải lại')
  })

  it('tách lỗi từng ô khi detail là "Validation failed"', () => {
    const result = parseWalletLimitError({
      status: 400,
      data: {
        status: '3001',
        detail: 'Validation failed',
        data: {
          minPerTransaction: 'Số tiền tối thiểu/GD phải lớn hơn 0.',
          'bankOverrides[0].dailyMaximum':
            'Hạn mức ngày của ngân hàng phải lớn hơn 0.'
        }
      }
    })

    expect(result.kind).toBe('fields')
    expect(result.fields).toEqual({
      minPerTransaction: 'Số tiền tối thiểu/GD phải lớn hơn 0.',
      'bankOverrides[0].dailyMaximum':
        'Hạn mức ngày của ngân hàng phải lớn hơn 0.'
    })
  })

  it('lỗi nghiệp vụ 400 hiển thị thẳng câu tiếng Việt trong detail', () => {
    const result = parseWalletLimitError({
      status: 400,
      data: {
        status: '3001',
        detail: 'Hạn mức ngày phải lớn hơn hoặc bằng hạn mức tối đa/GD.',
        data: null
      }
    })

    expect(result).toEqual({
      kind: 'message',
      message: 'Hạn mức ngày phải lớn hơn hoặc bằng hạn mức tối đa/GD.',
      fields: {}
    })
  })

  it('lỗi không rõ dạng rơi về thông báo chung, không đổ raw response', () => {
    expect(parseWalletLimitError(new Error('boom')).message).toBe(
      'Có lỗi xảy ra, vui lòng thử lại.'
    )
    expect(parseWalletLimitError({ status: 500, data: '<html>' }).kind).toBe(
      'message'
    )
  })
})
