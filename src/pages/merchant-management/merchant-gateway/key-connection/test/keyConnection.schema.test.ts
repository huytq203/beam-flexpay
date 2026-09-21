import { describe, expect, it } from 'vitest'

import { keyConnectionSchema } from '../schemas/keyConnection.schema'

describe('keyConnectionSchema', () => {
  it('chấp nhận key kết nối có webhook HTTPS và IP hợp lệ', () => {
    const result = keyConnectionSchema.safeParse({
      scope: 'MASTER',
      merchantCode: 'MC000142',
      clientId: 'hlc-production',
      maskedSecret: '••••••••••••4F2A',
      ipWhitelist: ['203.113.1.10'],
      webhookUrl: 'https://merchant.example.vn/ipn',
      status: 'ACTIVE'
    })

    expect(result.success).toBe(true)
  })

  it('từ chối key thiếu thông tin, IP sai hoặc webhook không bảo mật', () => {
    const result = keyConnectionSchema.safeParse({
      scope: 'MASTER',
      merchantCode: '',
      clientId: '',
      maskedSecret: '',
      ipWhitelist: ['invalid-ip'],
      webhookUrl: 'http://insecure.test',
      status: 'ACTIVE'
    })

    expect(result.success).toBe(false)
  })
})
