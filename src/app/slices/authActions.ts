import { createAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  exp: number
  iat: number
  jti: string
  iss: string
  typ: string
  azp: string
  sid: string
  scope: string
  permissions: string[]
  roles: string[]
  sub?: string
  email?: string
  name?: string
  preferred_username?: string
}

interface DecodedToken {
  permissions: string[]
  roles: string[]
  email: string
  name: string
  jwtId: string
  /** Keycloak preferred_username — dùng để so sánh với makerId/checkerId trong maker-checker. */
  username: string
}

/** Decode thông tin phân quyền và Keycloak user ID từ access token. */
export const decodeToken = (token: string): DecodedToken => {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return {
      permissions: decoded.permissions || [],
      roles: decoded.roles || [],
      email: decoded.email || decoded.preferred_username || decoded.sub || '',
      name: decoded.name || '',
      jwtId: decoded.sub || '',
      username: decoded.preferred_username || decoded.sub || ''
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return {
      permissions: [],
      roles: [],
      email: '',
      name: '',
      jwtId: '',
      username: ''
    }
  }
}

/**
 * Token không có `exp` hoặc không decode được không được dùng để khôi phục
 * phiên sau khi reload. BE sẽ xác thực lại phiên qua refresh token.
 */
export const isAccessTokenExpired = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<Pick<JwtPayload, 'exp'>>(token)
    return !exp || exp * 1000 <= Date.now()
  } catch {
    return true
  }
}

// Action để update access token - được dispatch từ fetchBaseQueryCustom sau khi refresh
export const updateAccessToken = createAction<{
  token: string
  expiresIn?: number
  refreshExpiresIn?: number
}>('auth/updateAccessToken')
