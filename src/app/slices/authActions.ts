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
      jwtId: decoded.sub || ''
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return { permissions: [], roles: [], email: '', name: '', jwtId: '' }
  }
}

// Action để update access token - được dispatch từ fetchBaseQueryCustom sau khi refresh
export const updateAccessToken = createAction<{
  token: string
  expiresIn?: number
}>('auth/updateAccessToken')
