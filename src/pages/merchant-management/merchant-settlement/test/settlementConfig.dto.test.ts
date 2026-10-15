import { describe, expect, it } from 'vitest'
import type { SettlementConfigForm } from '../schemas/settlementConfig.schema'
import {
  toSettlementConfigForm,
  toUpdateBody
} from '../dto/settlementConfig.dto'
import type { SettlementConfigDto } from '../types/settlementConfig.types'

const form: SettlementConfigForm = {
  inherit: false,
  settlementMode: 'AUTOMATIC',
  autoFrequency: 'DAILY',
  holdbackDays: 1,
  holdReason: '',
  active: true,
  reason: 'Merchant đủ điều kiện'
}

describe('toUpdateBody', () => {
  it('không bao giờ gửi các trường hạn mức rút', () => {
    const body = toUpdateBody(form)
    expect(body).not.toHaveProperty('autoApprovalThreshold')
    expect(body).not.toHaveProperty('minimumWithdrawalAmount')
    expect(body).not.toHaveProperty('dailyWithdrawalLimit')
    expect(body).toEqual({
      settlementMode: 'AUTOMATIC',
      autoFrequency: 'DAILY',
      holdbackDays: 1,
      active: true,
      reason: 'Merchant đủ điều kiện'
    })
  })
  it('inherit=true chỉ gửi inherit và reason', () => {
    expect(toUpdateBody({ ...form, inherit: true })).toEqual({
      inherit: true,
      reason: 'Merchant đủ điều kiện'
    })
  })
  it('HOLD gửi holdReason đã trim và không gửi autoFrequency', () => {
    const body = toUpdateBody({
      ...form,
      settlementMode: 'HOLD',
      holdReason: '  Nghi ngờ rủi ro cao '
    })
    expect(body).toMatchObject({
      settlementMode: 'HOLD',
      holdReason: 'Nghi ngờ rủi ro cao'
    })
    expect(body).not.toHaveProperty('autoFrequency')
  })
  it('MANUAL_ONLY không gửi autoFrequency lẫn holdReason', () => {
    const body = toUpdateBody({ ...form, settlementMode: 'MANUAL_ONLY' })
    expect(body).not.toHaveProperty('autoFrequency')
    expect(body).not.toHaveProperty('holdReason')
  })
})

describe('toSettlementConfigForm', () => {
  it('đổ giá trị đang hiệu lực vào form và để trống lý do', () => {
    const dto: SettlementConfigDto = {
      subMerchantId: 'sub-1',
      configuredAtThisLevel: true,
      active: true,
      settlementMode: { value: 'HOLD' },
      autoFrequency: { value: 'WEEKLY' },
      holdReason: { value: 'Nghi ngờ rủi ro cao' },
      holdbackDays: { value: 7 }
    }
    expect(toSettlementConfigForm(dto)).toEqual({
      inherit: false,
      settlementMode: 'HOLD',
      autoFrequency: 'WEEKLY',
      holdbackDays: 7,
      holdReason: 'Nghi ngờ rủi ro cao',
      active: true,
      reason: ''
    })
  })
  it('Sub chưa có cấu hình riêng thì mặc định kế thừa', () => {
    const dto: SettlementConfigDto = {
      subMerchantId: 'sub-1',
      configuredAtThisLevel: false,
      settlementMode: { value: 'MANUAL_ONLY', inherited: true },
      autoFrequency: { value: 'DAILY', inherited: true },
      holdbackDays: { value: 0, inherited: true }
    }
    expect(toSettlementConfigForm(dto).inherit).toBe(true)
  })
})
