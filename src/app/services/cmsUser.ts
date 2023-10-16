import {
  UserChangePasswordApiArg,
  UserChangePasswordApiResponse,
  UserCreateApiArg,
  UserCreateApiResponse,
  UserFindAllApiArg,
  UserFindAllApiResponse,
  UserFindOneApiArg,
  UserFindOneApiResponse,
  UserForgotPasswordApiArg,
  UserForgotPasswordApiResponse,
  UserGetMyInfoApiArg,
  UserGetMyInfoApiResponse,
  UserGetUserOtpApiArg,
  UserGetUserOtpApiResponse,
  UserLockAdminApiArg,
  UserLockAdminApiResponse,
  UserLoginApiArg,
  UserLoginApiResponse,
  UserNewPasswordApiArg,
  UserNewPasswordApiResponse,
  UserRemoveApiArg,
  UserRemoveApiResponse,
  UserSetPermissionForUserApiArg,
  UserSetPermissionForUserApiResponse,
  UserUnlockAdminApiArg,
  UserUnlockAdminApiResponse,
  UserUpdateApiArg,
  UserUpdateApiResponse,
  UserUpdatePermissionUserApiArg,
  UserUpdatePermissionUserApiResponse,
  UserUploadAvatarApiArg,
  UserUploadAvatarApiResponse,
  UserVerifyTokenApiArg,
  UserVerifyTokenApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin User'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      userFindAll: build.query<UserFindAllApiResponse, UserFindAllApiArg>({
        query: (queryArg) => ({
          url: `/user`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            fullName: queryArg.fullName,
            email: queryArg.email,
            phoneNumber: queryArg.phoneNumber,
            active: queryArg.active,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin User'],
        transformResponse: fnTransformResponse
      }),
      userCreate: build.mutation<UserCreateApiResponse, UserCreateApiArg>({
        query: (queryArg) => ({
          url: `/user`,
          method: 'POST',
          body: queryArg.createUserDto
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userGetUserOtp: build.mutation<
        UserGetUserOtpApiResponse,
        UserGetUserOtpApiArg
      >({
        query: (queryArg) => ({
          url: `/user/get-otp`,
          method: 'POST',
          body: queryArg.adminGetOtp
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userLogin: build.mutation<UserLoginApiResponse, UserLoginApiArg>({
        query: (queryArg) => ({
          url: `/user/login`,
          method: 'POST',
          body: queryArg.userLoginDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userGetMyInfo: build.query<UserGetMyInfoApiResponse, UserGetMyInfoApiArg>(
        {
          query: () => ({ url: `/user/me` }),
          transformResponse: fnTransformResponse,
          providesTags: ['[Admin] Admin User']
        }
      ),
      userFindOne: build.query<UserFindOneApiResponse, UserFindOneApiArg>({
        query: (queryArg) => ({ url: `/user/${queryArg.id}` }),
        providesTags: ['[Admin] Admin User']
      }),
      userUpdate: build.mutation<UserUpdateApiResponse, UserUpdateApiArg>({
        query: (queryArg) => ({
          url: `/user/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateUserDto
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userRemove: build.mutation<UserRemoveApiResponse, UserRemoveApiArg>({
        query: (queryArg) => ({
          url: `/user/${queryArg.id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userChangePassword: build.mutation<
        UserChangePasswordApiResponse,
        UserChangePasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/user/change-password`,
          method: 'PUT',
          body: queryArg.changeUserPasswordDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin User']
      }),
      userSetPermissionForUser: build.mutation<
        UserSetPermissionForUserApiResponse,
        UserSetPermissionForUserApiArg
      >({
        query: (queryArg) => ({
          url: `/user/permission`,
          method: 'POST',
          body: queryArg.setPermissionForUserDto
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userUploadAvatar: build.mutation<
        UserUploadAvatarApiResponse,
        UserUploadAvatarApiArg
      >({
        query: (queryArg) => ({
          url: `/user/avatar`,
          method: 'POST',
          body: queryArg.body
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userVerifyToken: build.mutation<
        UserVerifyTokenApiResponse,
        UserVerifyTokenApiArg
      >({
        query: (queryArg) => ({
          url: `/user/verify-token`,
          method: 'POST',
          params: { token: queryArg.token }
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userForgotPassword: build.mutation<
        UserForgotPasswordApiResponse,
        UserForgotPasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/user/forgot-password`,
          method: 'POST',
          body: queryArg.userForgotPassword
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userNewPassword: build.mutation<
        UserNewPasswordApiResponse,
        UserNewPasswordApiArg
      >({
        query: (queryArg) => ({
          url: `/user/new-password`,
          method: 'POST',
          body: queryArg.userNewPassword,
          params: { token: queryArg.token }
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userLockAdmin: build.mutation<
        UserLockAdminApiResponse,
        UserLockAdminApiArg
      >({
        query: (queryArg) => ({
          url: `/user/lock-admin/${queryArg.id}`,
          method: 'PATCH'
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userUnlockAdmin: build.mutation<
        UserUnlockAdminApiResponse,
        UserUnlockAdminApiArg
      >({
        query: (queryArg) => ({
          url: `/user/unlock-admin/${queryArg.id}`,
          method: 'PATCH'
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      userUpdatePermissionUser: build.mutation<
        UserUpdatePermissionUserApiResponse,
        UserUpdatePermissionUserApiArg
      >({
        query: (queryArg) => ({
          url: `/user/update-permission-user/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updatePermissionForUserDto
        }),
        invalidatesTags: ['[Admin] Admin User']
      }),
      ssoLogin: build.query({
      query: (code) => ({
        url: `/oauth/authorization-code/exchange?code=${code}`,
        method: 'GET',
      }),
    }),
      getUrlLogin: build.query({
      query: () => ({
        url: `/oauth/authorization-code`,
        method: 'GET'
      }),
    }),

    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useUserFindAllQuery,
  useUserCreateMutation,
  useUserGetUserOtpMutation,
  useUserLoginMutation,
  useUserGetMyInfoQuery,
  useUserFindOneQuery,
  useUserUpdateMutation,
  useUserRemoveMutation,
  useUserChangePasswordMutation,
  useUserSetPermissionForUserMutation,
  useUserUploadAvatarMutation,
  useUserVerifyTokenMutation,
  useUserForgotPasswordMutation,
  useUserNewPasswordMutation,
  useUserLockAdminMutation,
  useUserUnlockAdminMutation,
  useUserUpdatePermissionUserMutation,
  useLazyGetUrlLoginQuery,
  useLazySsoLoginQuery
} = injectedRtkApi
