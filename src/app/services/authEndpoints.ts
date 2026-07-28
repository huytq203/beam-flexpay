import { DataLogin, UserLoginApiArg } from '@type/application'
import type { AdminChangePasswordInput } from '@/app/schemas/change-password'
import {
  AdminForgotPasswordRequest,
  AdminResetPasswordRequest,
  AdminResetTokenValidationResponse
} from '@type/auth'
import { fnTransformResponse } from '@utils/helperFunctions'
import { authApiService } from './apiService'

const injectedRtkApi = authApiService
  .enhanceEndpoints({
    addTagTypes: ['Auth', 'Profile']
  })
  .injectEndpoints({
    endpoints: (build) => ({
      userLogin: build.mutation<DataLogin, UserLoginApiArg>({
        query: (queryArg) => ({
          url: '/auth/login',
          method: 'POST',
          body: queryArg.userLoginDto
        }),
        transformResponse: fnTransformResponse
      }),
      logout: build.mutation({
        query: (body) => ({
          url: '/auth/logout',
          method: 'POST',
          body
        })
      }),
      adminChangePassword: build.mutation<void, AdminChangePasswordInput>({
        query: (body) => ({
          url: '/auth/change-password',
          method: 'POST',
          body
        }),
        transformResponse: () => undefined
      }),
      adminForgotPassword: build.mutation<void, AdminForgotPasswordRequest>({
        query: (body) => ({
          url: '/auth/forgot-password',
          method: 'POST',
          body
        }),
        transformResponse: () => undefined
      }),
      validateAdminResetToken: build.mutation<
        AdminResetTokenValidationResponse,
        string
      >({
        query: (token) => ({
          url: '/auth/reset-password/validate',
          method: 'GET',
          params: { token }
        }),
        transformResponse: fnTransformResponse
      }),
      resetAdminPassword: build.mutation<void, AdminResetPasswordRequest>({
        query: (body) => ({
          url: '/auth/reset-password',
          method: 'POST',
          body
        }),
        transformResponse: () => undefined
      })
    }),
    overrideExisting: false
  })

export { injectedRtkApi as enhancedAuthApi }

export const {
  useUserLoginMutation,
  useLogoutMutation,
  useAdminChangePasswordMutation,
  useAdminForgotPasswordMutation,
  useValidateAdminResetTokenMutation,
  useResetAdminPasswordMutation
} = injectedRtkApi
