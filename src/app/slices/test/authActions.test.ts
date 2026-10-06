import { describe, expect, it } from 'vitest'
import { decodeToken, isAccessTokenExpired } from '../authActions'

const encode = (value: object): string =>
  Buffer.from(JSON.stringify(value)).toString('base64url')

describe('decodeToken', () => {
  it('giữ JWT subject để nhận biết chính tài khoản đang đăng nhập', () => {
    const token = `${encode({ alg: 'none' })}.${encode({
      sub: 'keycloak-user-1',
      preferred_username: 'admin.cms',
      permissions: ['EWALLET:USER:UPDATE'],
      roles: ['ADMIN']
    })}.signature`

    expect(decodeToken(token)).toMatchObject({
      jwtId: 'keycloak-user-1',
      email: 'admin.cms',
      permissions: ['EWALLET:USER:UPDATE']
    })
  })
})

describe('isAccessTokenExpired', () => {
  it('coi JWT hết hạn là không thể dùng để khôi phục phiên khi reload', () => {
    const token = `${encode({ alg: 'none' })}.${encode({
      exp: Math.floor(Date.now() / 1000) - 1
    })}.signature`

    expect(isAccessTokenExpired(token)).toBe(true)
  })

  it('giữ JWT còn hạn để không refresh token không cần thiết', () => {
    const token = `${encode({ alg: 'none' })}.${encode({
      exp: Math.floor(Date.now() / 1000) + 60
    })}.signature`

    expect(isAccessTokenExpired(token)).toBe(false)
  })
})
