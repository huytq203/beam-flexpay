import { describe, expect, it } from 'vitest'
import { adminChangePasswordSchema } from './change-password'

const VALID_INPUT = {
  oldPassword: 'OldPass@2025',
  newPassword: 'NewPass@2026',
  confirmPassword: 'NewPass@2026'
}

describe('adminChangePasswordSchema', () => {
  it('chấp nhận payload đúng contract backend', () => {
    expect(adminChangePasswordSchema.safeParse(VALID_INPUT).success).toBe(true)
  })

  it.each([
    ['New@2026', 'ít nhất 10 ký tự'],
    ['newpass@2026', 'ít nhất 1 chữ hoa'],
    ['NEWPASS@2026', 'ít nhất 1 chữ thường'],
    ['NewPassword@', 'ít nhất 1 chữ số'],
    ['NewPassword2026', 'ít nhất 1 ký tự đặc biệt'],
    ['New Pass@2026', 'ký tự không được hỗ trợ']
  ])('từ chối mật khẩu "%s"', (newPassword, expectedMessage) => {
    const result = adminChangePasswordSchema.safeParse({
      ...VALID_INPUT,
      newPassword,
      confirmPassword: newPassword
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toContain(expectedMessage)
    }
  })

  it('không cho mật khẩu mới trùng mật khẩu hiện tại', () => {
    const result = adminChangePasswordSchema.safeParse({
      ...VALID_INPUT,
      newPassword: VALID_INPUT.oldPassword,
      confirmPassword: VALID_INPUT.oldPassword
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.newPassword).toContain(
        'Mật khẩu mới không được trùng với mật khẩu hiện tại'
      )
    }
  })

  it('yêu cầu mật khẩu xác nhận khớp mật khẩu mới', () => {
    const result = adminChangePasswordSchema.safeParse({
      ...VALID_INPUT,
      confirmPassword: 'OtherPass@2026'
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.flatten().fieldErrors.confirmPassword).toContain(
        'Mật khẩu xác nhận không khớp'
      )
    }
  })
})
