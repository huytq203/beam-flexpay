import { appName } from '@constants/appConstant'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { enhancedApi as authService } from '@services/cmsService'
import { enhancedApi as userApi } from '@services/cmsUser'
import { enhancedAuthApi } from '@services/authEndpoints'
import { IUserProfile } from '@type/auth'
import { jwtDecode } from 'jwt-decode'

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
const decodeToken = (token: string): { permissions: string[], email: string, name: string } => {
  try {
    const decoded = jwtDecode<JwtPayload>(token)
    return {
      permissions: decoded.permissions || decoded.roles || [],
      email: decoded.email || decoded.preferred_username || decoded.sub || '',
      name: decoded.name || ''
    }
  } catch (error) {
    console.error('Error decoding token:', error)
    return { permissions: [], email: '', name: '' }
  }
}

export interface IAuthState {
  accessToken: string | null
  refreshToken: string
  profile: IUserProfile
}

const initialState: IAuthState = {
  accessToken: localStorage.getItem(appName) || null,
  refreshToken: '',
  profile: {
    id: 0,
    email: '',
    fullName: '',
    status: true,
    jwtId: '',
    securityMethod: '',
    accountStatus: '',
    type: '',
    phoneNumber: '',
    avatar: '',
    permissions: []
  }
}

const authSlice = createSlice({
  name: name,
  initialState: initialState,
  reducers: {
    logout: () => {
      localStorage.removeItem(appName)
      return {
        ...initialState,
        accessToken: null
      }
    },
    savePermissions: (state, action: PayloadAction<string[]>) => {
      state.profile.permissions = action.payload
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      localStorage.setItem(appName, action.payload)
      state.accessToken = action.payload
      // Decode và lấy permissions từ token
      const tokenInfo = decodeToken(action.payload)
      state.profile.permissions = tokenInfo.permissions
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
          const token = (payload as any).accessToken || (payload as any).access_token
          if (token) {
            localStorage.setItem(appName, token)
            // Decode token để lấy permissions
            const tokenInfo = decodeToken(token)
            return {
              ...state,
              accessToken: token,
              profile: {
                ...state.profile,
                permissions: tokenInfo.permissions,
                email: tokenInfo.email,
                fullName: tokenInfo.name
              }
            }
          }
          return state
        }
      )
      // Giữ lại cho backward compatibility với API cũ
      .addMatcher(
        authService.endpoints.verifyLoginOtp.matchFulfilled,
        (state, { payload }) => {
          localStorage.setItem(appName, payload.accessToken)
          return {
            ...state,
            accessToken: payload.accessToken
          }
        }
      )
      .addMatcher(
        userApi.endpoints.ssoLogin.matchFulfilled,
        (state, { payload }) => {
          localStorage.setItem(appName, payload.data.accessToken)
          return {
            ...state,
            accessToken: payload.data.accessToken
          }
        }
      )
  }
})

export const { logout, savePermissions, setAccessToken } = authSlice.actions
export default authSlice.reducer


