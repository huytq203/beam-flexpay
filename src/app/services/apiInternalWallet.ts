import { ResponseType } from '@type/api'
import {
  DetailPermissionPayload,
  GroupPermissionPayload,
  GroupPermissionSearchParams,
  PermissionDataType
} from '@type/permission'
import { apiService } from './apiService'
import {
  InternalWalletPayload,
  InternalWalletResponse,
  ModifyInternalWalletBody
} from '@type/internalWallet'

export const groupPermissionApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListWalletGroups: builder.query<
      InternalWalletResponse,
      InternalWalletPayload
    >({
      query: (payload) => ({
        url: '/balance-internal-group',
        method: 'GET',
        params: payload
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<GroupPermissionPayload>
      ): GroupPermissionPayload {
        return baseQueryReturnValue.data
      },
      providesTags: ['internal-wallet-group']
    }),
    createInternalWalletGroup: builder.mutation({
      query: (payload) => ({
        url: '/balance-internal-group',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['internal-wallet-group']
    }),
    updateInternalWalletGroup: builder.mutation({
      query: ({id, ...body}) => ({
        url: `/balance-internal-group/${id}`,
        method: 'PUT',
        body: body
      }),
      invalidatesTags: ['internal-wallet-group']
    }),
    getListWallets: builder.query<
      InternalWalletResponse,
      InternalWalletPayload
    >({
      query: (payload) => ({
        url: '/balance-internal',
        method: 'GET',
        params: payload
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<GroupPermissionPayload>
      ): GroupPermissionPayload {
        return baseQueryReturnValue.data
      }
    }),
    createInternalWallet: builder.mutation<any, ModifyInternalWalletBody>({
      query: (body) => ({
        url: '/balance-internal',
        method: 'POST',
        body
      })
    }),
    updateInternalWallet: builder.mutation<
      any,
      { body: ModifyInternalWalletBody; id: number }
    >({
      query: ({ body, id }) => ({
        url: `/balance-internal/${id}`,
        method: 'PATCH',
        body
      })
    })
  })
})

export const {
  useGetListWalletGroupsQuery,
  useCreateInternalWalletGroupMutation,
  useUpdateInternalWalletGroupMutation,
  useGetListWalletsQuery,
  useLazyGetListWalletGroupsQuery,
  useCreateInternalWalletMutation,
  useUpdateInternalWalletMutation
} = groupPermissionApi
