import { describe, expect, it } from 'vitest'
import { toSetupRequest } from '../utils/feeConfigPayload'
import { baseForm } from './feeConfigPayload.fixtures'

describe('toSetupRequest — người chịu phí', () => {
  it('rút tiền: giữ RECEIVER người dùng chọn, payer lạ về USER', () => {
    const form = baseForm()
    form.components[0].payerType = 'RECEIVER'

    expect(toSetupRequest(form).components[0].payerType).toBe('RECEIVER')
    expect(toSetupRequest(form).components[0].beneficiaryType).toBe('SYSTEM')

    form.components[0].payerType = 'MERCHANT'
    expect(toSetupRequest(form).components[0].payerType).toBe('USER')
  })

  it('nạp tiền: giữ RECEIVER, SENDER về USER', () => {
    const form = baseForm({ serviceType: 'EWALLET_DEPOSIT' })
    form.components[0].payerType = 'RECEIVER'
    expect(toSetupRequest(form).components[0].payerType).toBe('RECEIVER')
  })

  it('chuyển tiền: giữ RECEIVER (phí trừ vào tiền nhận), payer lạ về USER', () => {
    const form = baseForm({ serviceType: 'EWALLET_TRANSFER_INTERNAL' })
    form.components[0].payerType = 'RECEIVER'
    expect(toSetupRequest(form).components[0].payerType).toBe('RECEIVER')

    form.components[0].payerType = 'MERCHANT'
    expect(toSetupRequest(form).components[0].payerType).toBe('USER')
  })

  it('chuẩn hoá payer cũ chưa hỗ trợ của miền Ví về USER', () => {
    const cases = [
      { serviceType: 'EWALLET_WITHDRAWAL', legacy: 'SENDER' },
      { serviceType: 'EWALLET_DEPOSIT', legacy: 'SENDER' },
      { serviceType: 'EWALLET_REFUND', legacy: 'SENDER' }
    ]
    for (const { serviceType, legacy } of cases) {
      const form = baseForm({ feeDomain: 'EWALLET', serviceType })
      form.components[0].payerType = legacy

      expect(toSetupRequest(form).components[0].payerType).toBe('USER')
    }
  })
})
