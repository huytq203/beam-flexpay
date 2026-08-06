import { ResponseType } from '@type/api'
import { ResponseUserInfor, UserInfor } from '@type/userManagement'
import { CreateAdminUserRequest } from '@pages/role-management-V2/user-management/types/UserManagement.type'
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
    })
  })
})

export const {
  useGetUserQuery,
  useLazyGetUserByIdQuery,
  useCreateManagerUserMutation
} = userApi
