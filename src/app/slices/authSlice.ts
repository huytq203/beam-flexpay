import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { enhancedApi as authService } from '@services/cmsService'
import { enhancedApi as userApi } from '@services/cmsUser'
import { enhancedAuthApi, useLogoutMutation } from '@services/authEndpoints'
import { IUserProfile } from '@type/auth'
import { jwtDecode } from 'jwt-decode'
import Cookies from 'js-cookie'
import { CookieKey, CookieExpiry } from '@configs/fetchBaseQuery.types'
const name = 'authSlice'

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
const decodeToken = (token: string): { permissions: string[], roles: string[], email: string, name: string } => {
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

export interface IAuthState {
  accessToken: string | null
  refreshToken: string
  profile: IUserProfile
}

// Lấy token từ cookie và decode permissions khi app khởi tạo
const storedToken = Cookies.get(CookieKey.ACCESS_TOKEN)
const initialTokenInfo = storedToken ? decodeToken(storedToken) : { permissions: [], roles: [], email: '', name: '' }
const refresh = Cookies.get(CookieKey.REFRESH_TOKEN)
const initialState: IAuthState = {
  accessToken: storedToken ?? null,
  refreshToken: '',
  profile: {
    id: 0,
    email: initialTokenInfo.email,
    fullName: initialTokenInfo.name,
    status: true,
    jwtId: '',
    securityMethod: '',
    accountStatus: '',
    type: '',
    phoneNumber: '',
    avatar: '',
    permissions: initialTokenInfo.permissions,
    roles: initialTokenInfo.roles
  }
}


const authSlice = createSlice({
  name: name,
  initialState: initialState,
  reducers: {
    logout: () => {

      Cookies.remove(CookieKey.ACCESS_TOKEN)
      Cookies.remove(CookieKey.REFRESH_TOKEN)
      return {
        ...initialState,
        accessToken: null
      }
    },
    savePermissions: (state, action: PayloadAction<string[]>) => {
      state.profile.permissions = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      Cookies.set(CookieKey.ACCESS_TOKEN, action.payload, { expires: CookieExpiry.ACCESS_TOKEN_MINUTES / 1440 })
      state.accessToken = action.payload
      // Decode và lấy permissions, roles từ token
      const tokenInfo = decodeToken(action.payload)
      state.profile.permissions = tokenInfo.permissions
      state.profile.roles = tokenInfo.roles
      state.profile.email = tokenInfo.email
      state.profile.fullName = tokenInfo.name
    }
  },
  extraReducers: (builder) => {
    builder
      // Lắng nghe userLogin từ authEndpoints (API mới - ENV.API_LOGIN)
      .addMatcher(
        enhancedAuthApi.endpoints.userLogin.matchFulfilled,
        (state, { payload }) => {
          const token = (payload as any).accessToken || (payload as any).accessToken
          if (token) {
            Cookies.set(CookieKey.ACCESS_TOKEN, token, { expires: CookieExpiry.ACCESS_TOKEN_MINUTES / 1440 })
            // Decode token để lấy permissions
            const tokenInfo = decodeToken(token)
            return {
              ...state,
              accessToken: token,
              profile: {
                ...state.profile,
                permissions: tokenInfo.permissions,
                roles: tokenInfo.roles,
                email: tokenInfo.email,
                fullName: tokenInfo.name
              }
            }
          }
          return state
        }
      )
  }
})

export const { logout, savePermissions, setAccessToken } = authSlice.actions
export default authSlice.reducer


