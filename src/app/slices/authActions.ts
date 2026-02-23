import { createAction } from '@reduxjs/toolkit'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { CookieKey, CookieExpiry } from '@configs/fetchBaseQuery.types'

// Interface cho JWT payload từ Keycloak/OIDC
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

// Helper function để decode token và lấy thông tin
export const decodeToken = (token: string): { permissions: string[], roles: string[], email: string, name: string } => {
    try {
        const decoded = jwtDecode<JwtPayload>(token)
        return {
            permissions: decoded.permissions || [],
            roles: decoded.roles || [],
            email: decoded.email || decoded.preferred_username || decoded.sub || '',
            name: decoded.name || ''
        }
    } catch (error) {
        console.error('Error decoding token:', error)
        return { permissions: [], roles: [], email: '', name: '' }
    }
}

// Action để update access token - được dispatch từ fetchBaseQueryCustom sau khi refresh
export const updateAccessToken = createAction<{ token: string; expiresIn?: number }>('auth/updateAccessToken')
