import { ResponseType } from '@type/api'
import { ResponseUserInfor, UserInfor } from '@type/userManagement'
import {
  AdminResetPasswordResponse,
  CreateAdminUserRequest,
  UpdateAdminUserRequest
} from '@pages/role-management-V2/user-management/types/UserManagement.type'
import { authApiService } from './apiService'

export const userApi = authApiService.injectEndpoints({
  endpoints: (build) => ({
    getUser: build.query<ResponseUserInfor, Record<string, unknown>>({
      query: (params) => ({
        url: 'users/managers',
        method: 'GET',
        params
      }),
      providesTags: ['UserManagement'],
      transformResponse: (res: ResponseType<ResponseUserInfor>) => res.data
    }),
    getUserById: build.query<ResponseType<UserInfor>, string>({
      query: (id) => ({
        url: `users/managers/${id}`,
        method: 'GET'
      })
    }),
    createManagerUser: build.mutation<
      ResponseType<UserInfor>,
      CreateAdminUserRequest
    >({
      query: (body) => ({
        url: 'users/managers',
        method: 'POST',
        body
      }),
      invalidatesTags: ['UserManagement']
    }),
    updateManagerUser: build.mutation<
      ResponseType<UserInfor>,
      { userId: string; body: UpdateAdminUserRequest }
    >({
      query: ({ userId, body }) => ({
        url: `users/managers/${userId}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['UserManagement']
    }),
    resetManagerPassword: build.mutation<
      ResponseType<AdminResetPasswordResponse>,
      string
    >({
      query: (userId) => ({
        url: `users/managers/${userId}/reset-password`,
        method: 'POST'
      })
    })
  })
})

export const {
  useGetUserQuery,
  useGetUserByIdQuery,
  useLazyGetUserByIdQuery,
  useCreateManagerUserMutation,
  useUpdateManagerUserMutation,
  useResetManagerPasswordMutation
} = userApi
