import { describe, expect, it } from 'vitest'
import {
  DEFAULT_INVALID_LINK_MESSAGE,
  FALLBACK_SUBMIT_ERROR,
  NETWORK_SUBMIT_ERROR,
  isExpiredLinkError,
  isNetworkError,
  toInvalidLinkMessage,
  toSubmitErrorMessage
} from '../../password-reset-error'

describe('isNetworkError', () => {
  it('nhận ra lỗi mạng và timeout', () => {
    expect(isNetworkError({ status: 'FETCH_ERROR', error: 'offline' })).toBe(
      true
    )
    expect(isNetworkError({ status: 'TIMEOUT_ERROR', error: 'slow' })).toBe(
      true
    )
  })

  it('lỗi HTTP thường không phải lỗi mạng', () => {
    expect(isNetworkError({ status: 400, data: null })).toBe(false)
    expect(isNetworkError({ name: 'Error', message: 'oops' })).toBe(false)
  })
})

describe('isExpiredLinkError', () => {
  it.each(['23015', '23016', '23017'])(
    'nhận ra mã nghiệp vụ %s của token',
    (status) => {
      expect(
        isExpiredLinkError({
          status: 400,
          data: { status, message: 'RESET_TOKEN_ERROR' }
        })
      ).toBe(true)
    }
  )

  it.each([401, 403, 410])('hỗ trợ HTTP %i từ BE cũ', (status) => {
    expect(isExpiredLinkError({ status, data: null })).toBe(true)
  })

  it('không coi lỗi 400 không có mã token hay lỗi 500 là hết hạn', () => {
    expect(isExpiredLinkError({ status: 400, data: null })).toBe(false)
    expect(isExpiredLinkError({ status: 500, data: null })).toBe(false)
  })
})

describe('toInvalidLinkMessage', () => {
  it.each([
    ['23015', 'Liên kết đặt lại mật khẩu không hợp lệ.'],
    ['23016', 'Liên kết đặt lại mật khẩu đã hết hạn.'],
    ['23017', 'Liên kết đặt lại mật khẩu này đã được sử dụng.']
  ])('đổi mã %s sang nội dung tiếng Việt', (status, expected) => {
    expect(
      toInvalidLinkMessage({
        status: 400,
        data: { status, message: 'RESET_TOKEN_ERROR' }
      })
    ).toBe(expected)
  })

  it('không lộ nội dung không xác định từ BE', () => {
    expect(
      toInvalidLinkMessage({
        status: 400,
        data: { message: 'INTERNAL_ERROR', stack: 'at foo()' }
      })
    ).toBe(DEFAULT_INVALID_LINK_MESSAGE)
  })
})

describe('toSubmitErrorMessage', () => {
  it('ưu tiên detail tiếng Việt BE trả về', () => {
    const error = {
      status: 400,
      data: {
        message: 'PASSWORD_REUSED',
        detail: 'Mật khẩu trùng mật khẩu cũ'
      }
    }
    expect(toSubmitErrorMessage(error)).toBe('Mật khẩu trùng mật khẩu cũ')
  })

  it('hỗ trợ message có thể đọc được từ BE cũ', () => {
    const error = { status: 400, data: { message: 'Mật khẩu quá ngắn' } }
    expect(toSubmitErrorMessage(error)).toBe('Mật khẩu quá ngắn')
  })

  it('lỗi mạng dùng câu riêng, không phải câu mặc định', () => {
    expect(toSubmitErrorMessage({ status: 'FETCH_ERROR', error: '' })).toBe(
      NETWORK_SUBMIT_ERROR
    )
  })

  it('không có message thì dùng câu mặc định, không lộ raw error', () => {
    expect(
      toSubmitErrorMessage({ status: 500, data: { stack: 'at foo()' } })
    ).toBe(FALLBACK_SUBMIT_ERROR)
  })
})
