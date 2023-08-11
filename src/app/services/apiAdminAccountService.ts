import {
  AdminAccountData,
  AdminAccountPayload,
  AdminSearchParams
} from '@type/admin'
import { ResponseType } from '@type/api'
import { apiService } from './apiService'

export const adminAccountApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListAccountAdmin: builder.query<AdminAccountPayload, AdminSearchParams>({
      query: (params) => ({
        url: '/user',
        method: 'GET',
        params: params
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<AdminAccountPayload>
      ): AdminAccountPayload {
        return baseQueryReturnValue.data
      }
    }),
    createAdmin: builder.mutation({
      query: (payload) => ({
        url: `/user/permission`,
        method: 'POST',
        body: payload
      })
    }),
    viewDetailAccount: builder.query<ResponseType<AdminAccountData>, string>({
      query: (payload) => ({
        url: `/user/${payload}`,
        method: 'GET'
      })
    }),
    deleteAdmin: builder.mutation({
      query: (payload) => ({
        url: `/user/${payload}`,
        method: 'DELETE'
      })
    }),
    lockAdmin: builder.mutation({
      query: (payload) => ({
        url: `/user/lock-admin/${payload}`,
        method: 'PATCH'
      })
    }),
    unLockAdmin: builder.mutation({
      query: (payload) => ({
        url: `/user/unlock-admin/${payload}`,
        method: 'PATCH'
      })
    }),
    updateAdminPermission: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/user/update-permission-user/${id}`,
        method: 'PATCH',
        body: payload
      })
    })
  })
})

export const {
  useGetListAccountAdminQuery,
  useCreateAdminMutation,
  useViewDetailAccountQuery,
  useDeleteAdminMutation,
  useLockAdminMutation,
  useUnLockAdminMutation,
  useUpdateAdminPermissionMutation,
  useLazyGetListAccountAdminQuery
} = adminAccountApi
