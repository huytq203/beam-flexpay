import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { enhancedApi as authService } from '@services/cmsService'
import { enhancedApi as userApi } from '@services/cmsUser'
import { enhancedAuthApi, useLogoutMutation } from '@services/authEndpoints'
import { IUserProfile } from '@type/auth'
import Cookies from 'js-cookie'
import { CookieKey, CookieExpiry } from '@configs/fetchBaseQuery.types'
import { updateAccessToken, decodeToken } from './authActions'
const name = 'authSlice'

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
      localStorage.removeItem('last_activity_time')
      return {
        ...initialState,
        accessToken: null
      }
    },
    savePermissions: (state, action: PayloadAction<string[]>) => {
      state.profile.permissions = action.payload
    },
    setAccessToken: (state, action: PayloadAction<{ token: string; expiresIn?: number }>) => {
      const { token, expiresIn } = action.payload
      const expiresInSeconds = expiresIn || CookieExpiry.ACCESS_TOKEN_SECONDS
      const expiresInDays = expiresInSeconds / 86400
      Cookies.set(CookieKey.ACCESS_TOKEN, token, { expires: expiresInDays })
      state.accessToken = token
      const tokenInfo = decodeToken(token)
      state.profile.permissions = tokenInfo.permissions
      state.profile.roles = tokenInfo.roles
      state.profile.email = tokenInfo.email
      state.profile.fullName = tokenInfo.name
    }
  },
  extraReducers: (builder) => {
    builder
      // Lắng nghe updateAccessToken action từ authActions (được dispatch sau khi refresh token)
      .addCase(updateAccessToken, (state, action) => {
        const { token, expiresIn } = action.payload
        const expiresInSeconds = expiresIn || CookieExpiry.ACCESS_TOKEN_SECONDS
        const expiresInDays = expiresInSeconds / 86400
        Cookies.set(CookieKey.ACCESS_TOKEN, token, { expires: expiresInDays })
        state.accessToken = token
        const tokenInfo = decodeToken(token)
        state.profile.permissions = tokenInfo.permissions
        state.profile.roles = tokenInfo.roles
        state.profile.email = tokenInfo.email
        state.profile.fullName = tokenInfo.name
      })
      // Lắng nghe userLogin từ authEndpoints (API mới - ENV.API_LOGIN)
      .addMatcher(
        enhancedAuthApi.endpoints.userLogin.matchFulfilled,
        (state, { payload }) => {
          const data = payload as any
          const token = data.accessToken
          if (token) {
            // Sử dụng expiresIn từ API (đơn vị giây), fallback 300 giây
            const expiresInSeconds = data.expiresIn || CookieExpiry.ACCESS_TOKEN_SECONDS
            const expiresInDays = expiresInSeconds / 86400
            Cookies.set(CookieKey.ACCESS_TOKEN, token, { expires: expiresInDays })

            // Lưu refresh token với refreshExpiresIn từ API
            if (data.refreshToken) {
              const refreshExpiresInSeconds = data.refreshExpiresIn || CookieExpiry.REFRESH_TOKEN_SECONDS
              const refreshExpiresInDays = refreshExpiresInSeconds / 86400
              Cookies.set(CookieKey.REFRESH_TOKEN, data.refreshToken, { expires: refreshExpiresInDays })
            }

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


