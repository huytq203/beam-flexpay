import { appName } from '@constants/appConstant'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { enhancedApi as authService } from '@services/cmsService'
import { enhancedApi as userApi } from '@services/cmsUser'
import { IUserProfile } from '@type/auth'

const name = 'authSlice'

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
    }
  },
  extraReducers: (builder) => {
    builder
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
    // .addMatcher(
    //   authService.endpoints.profile.matchFulfilled,
    //   (state, { payload }) => {
    //     return {
    //       ...state,
    //       profile: payload
    //     }
    //   }
    // )
  }
})

export const { logout, savePermissions } = authSlice.actions
export default authSlice.reducer
