import { describe, expect, it } from 'vitest'
import { PASSWORD_RULES } from '../constant/constants'
import { resetPasswordSchema } from '../schema'

const firstError = (
  password: string,
  confirmPassword: string
): string | undefined => {
  const result = resetPasswordSchema.safeParse({ password, confirmPassword })
  return result.success ? undefined : result.error.issues[0]?.message
}

describe('PASSWORD_RULES', () => {
  it('mật khẩu đủ mạnh thì đạt cả 5 điều kiện', () => {
    const met = PASSWORD_RULES.filter((rule) => rule.test('Beam@20260'))
    expect(met).toHaveLength(PASSWORD_RULES.length)
  })

  it('mỗi điều kiện bắt đúng thứ nó kiểm tra', () => {
    const byId = Object.fromEntries(
      PASSWORD_RULES.map((rule) => [rule.id, rule.test])
    )
    expect(byId.length('1234567')).toBe(false)
    expect(byId.upper('beam@2026')).toBe(false)
    expect(byId.lower('BEAM@2026')).toBe(false)
    expect(byId.digit('Beam@beam')).toBe(false)
    expect(byId.special('Beam2026')).toBe(false)
  })
})

describe('resetPasswordSchema', () => {
  it('chấp nhận mật khẩu hợp lệ và khớp nhau', () => {
    expect(
      resetPasswordSchema.safeParse({
        password: 'Beam@20260',
        confirmPassword: 'Beam@20260'
      }).success
    ).toBe(true)
  })

  it('bỏ trống thì báo phải nhập', () => {
    expect(firstError('', '')).toBe('Vui lòng nhập mật khẩu mới')
  })

  it('chưa đủ điều kiện thì chỉ về checklist', () => {
    expect(firstError('beam', 'beam')).toBe(
      'Mật khẩu chưa đạt đủ điều kiện bên dưới'
    )
  })

  it('nhập lại lệch thì báo không khớp', () => {
    expect(firstError('Beam@20260', 'Beam@20270')).toBe(
      'Mật khẩu nhập lại không khớp'
    )
  })

  it('phân biệt hoa thường khi so khớp (edge case)', () => {
    expect(firstError('Beam@20260', 'beam@20260')).toBe(
      'Mật khẩu nhập lại không khớp'
    )
  })
})
