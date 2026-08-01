import { DataLogin, UserLoginApiArg } from '@type/application'
import type { AdminChangePasswordInput } from '@/app/schemas/change-password'
import {
  AdminLoginOtpResponse,
  AdminForgotPasswordRequest,
  AdminResetPasswordRequest,
  AdminResetTokenValidationResponse,
  AuthenticationResponse,
  OtpChallengeResponse,
  OtpErrorBody,
  ResendAdminOtpRequest,
  VerifyAdminOtpRequest
} from '@type/auth'
import type { FetchBaseQueryError, FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import { fnTransformResponse } from '@utils/helperFunctions'
import { authApiService } from './apiService'

const isOtpErrorBody = (value: unknown): value is OtpErrorBody =>
  typeof value === 'object' && value !== null

interface TransformedOtpError {
  status: FetchBaseQueryError['status']
  data: OtpErrorBody
}

const transformOtpErrorResponse = (
  response: FetchBaseQueryError,
  meta: FetchBaseQueryMeta | undefined
): TransformedOtpError => {
  const retryAfterHeader = meta?.response?.headers.get('retry-after')
  const parsedRetryAfter = retryAfterHeader
    ? Number.parseInt(retryAfterHeader, 10)
    : Number.NaN
  const body = isOtpErrorBody(response.data) ? response.data : {}

  return {
    status: response.status,
    data: {
      ...body,
      retryAfter: Number.isFinite(parsedRetryAfter)
        ? parsedRetryAfter
        : body.retryAfter
    }
  }
}

const injectedRtkApi = authApiService
  .enhanceEndpoints({
    addTagTypes: ['Auth', 'Profile']
  })
  .injectEndpoints({
    endpoints: (build) => ({
      userLogin: build.mutation<DataLogin | AdminLoginOtpResponse, UserLoginApiArg>({
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
      resetAdminPassword: build.mutation<
        OtpChallengeResponse | null,
        AdminResetPasswordRequest
      >({
        query: (body) => ({
          url: '/auth/reset-password',
          method: 'POST',
          body
        }),
        transformResponse: (
          response: { data?: OtpChallengeResponse } | undefined
        ) => response?.data ?? null
      }),
      verifyLoginOtp: build.mutation<
        AuthenticationResponse,
        VerifyAdminOtpRequest
      >({
        query: (body) => ({
          url: '/auth/login/verify-otp',
          method: 'POST',
          body
        }),
        transformResponse: fnTransformResponse,
        transformErrorResponse: transformOtpErrorResponse
      }),
      verifyResetPasswordOtp: build.mutation<void, VerifyAdminOtpRequest>({
        query: (body) => ({
          url: '/auth/reset-password/verify-otp',
          method: 'POST',
          body
        }),
        transformResponse: () => undefined,
        transformErrorResponse: transformOtpErrorResponse
      }),
      resendAdminOtp: build.mutation<
        OtpChallengeResponse,
        ResendAdminOtpRequest
      >({
        query: (body) => ({
          url: '/auth/otp/resend',
          method: 'POST',
          body
        }),
        transformResponse: fnTransformResponse,
        transformErrorResponse: transformOtpErrorResponse
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
  useResetAdminPasswordMutation,
  useVerifyLoginOtpMutation,
  useVerifyResetPasswordOtpMutation,
  useResendAdminOtpMutation
} = injectedRtkApi
