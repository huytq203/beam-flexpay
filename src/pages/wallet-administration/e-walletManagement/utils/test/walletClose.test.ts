import { describe, expect, it } from 'vitest'
import type { WalletClosureCheck } from '../../types/WalletClose.type'
import {
  getCloseErrorDetail,
  getWalletCloseView,
  isCloseConflict,
  isCloseResultUnknown
} from '../walletClose'

const base = {
  eligible: false,
  retryable: false,
  blockingReasons: []
} as unknown as WalletClosureCheck

describe('getWalletCloseView', () => {
  it('đủ điều kiện → form nhập lý do', () => {
    expect(getWalletCloseView({ ...base, eligible: true })).toBe('form')
  })

  it('không đủ điều kiện nhưng retryable → bật xác nhận không cần lý do', () => {
    expect(getWalletCloseView({ ...base, retryable: true })).toBe('retry')
  })

  it('không đủ điều kiện và không retryable → chặn', () => {
    expect(getWalletCloseView(base)).toBe('blocked')
  })
})

describe('lỗi khi xóa ví', () => {
  it('lấy detail tiếng Việt của BE', () => {
    expect(
      getCloseErrorDetail({
        status: 409,
        data: { detail: 'Phát hiện biến động' }
      })
    ).toBe('Phát hiện biến động')
    expect(getCloseErrorDetail(undefined)).toBeUndefined()
  })

  it('nhận ra 504 WALLET_CLOSE_RESULT_UNKNOWN (4012)', () => {
    expect(
      isCloseResultUnknown({
        status: 504,
        data: { message: 'WALLET_CLOSE_RESULT_UNKNOWN', status: 4012 }
      })
    ).toBe(true)
    expect(isCloseResultUnknown({ status: 409, data: {} })).toBe(false)
  })

  it('409 là xung đột cần vẽ lại trạng thái', () => {
    expect(isCloseConflict({ status: 409 })).toBe(true)
    expect(isCloseConflict({ status: 503 })).toBe(false)
  })
})
