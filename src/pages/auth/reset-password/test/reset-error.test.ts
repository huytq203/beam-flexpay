import { describe, expect, it } from 'vitest'
import {
  FALLBACK_SUBMIT_ERROR,
  NETWORK_SUBMIT_ERROR,
  isExpiredLinkError,
  isNetworkError,
  toSubmitErrorMessage
} from '../reset-error'

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
  it.each([401, 403, 410])('coi HTTP %i là liên kết hết hạn', (status) => {
    expect(isExpiredLinkError({ status, data: null })).toBe(true)
  })

  it('không coi 400 hay 500 là hết hạn', () => {
    expect(isExpiredLinkError({ status: 400, data: null })).toBe(false)
    expect(isExpiredLinkError({ status: 500, data: null })).toBe(false)
  })
})

describe('toSubmitErrorMessage', () => {
  it('ưu tiên message BE trả về', () => {
    const error = {
      status: 400,
      data: { message: 'Mật khẩu trùng mật khẩu cũ' }
    }
    expect(toSubmitErrorMessage(error)).toBe('Mật khẩu trùng mật khẩu cũ')
  })

  it('lấy phần tử đầu khi message là mảng', () => {
    const error = { status: 400, data: { message: ['Quá ngắn', 'Thiếu số'] } }
    expect(toSubmitErrorMessage(error)).toBe('Quá ngắn')
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
