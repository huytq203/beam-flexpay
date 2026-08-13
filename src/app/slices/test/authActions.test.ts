import { describe, expect, it } from 'vitest'
import { decodeToken } from '../authActions'

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
