import { ResponseType } from '@type/api'
import {
  GroupPermissionPayload,
} from '@type/permission'
import { apiService } from './apiService'
import {
  InternalWallet,
  InternalWalletGroup,
  InternalWalletPayload,
  InternalWalletResponse,
  InternalWalletTransactionPayload,
  ModifyInternalWalletBody
} from '@type/internalWallet'
import { CommonResponsePayload } from '@type/common'
import { TransactionDto } from '@type/application'

export const groupPermissionApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListWalletGroups: builder.query<
      InternalWalletResponse,
      InternalWalletPayload
    >({
      query: (payload) => ({
        url: '/internal-wallet-group',
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
    getListWalletInternalGroups: builder.query<
      InternalWalletResponse,
      InternalWalletPayload
    >({
      query: (payload) => ({
        url: '/internal-wallet-group',
        method: 'GET',
        params: payload
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<CommonResponsePayload<InternalWalletGroup[]>>
      ): CommonResponsePayload<InternalWalletGroup[]> {
        return baseQueryReturnValue.data
      },
      providesTags: ['internal-wallet-group']
    }),
    createInternalWalletGroup: builder.mutation({
      query: (payload) => ({
        url: '/internal-wallet-group',
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['internal-wallet-group']
    }),
    updateInternalWalletGroup: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/internal-wallet-group/${id}`,
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
        url: '/internal-wallet',
        method: 'GET',
        cache: 'default',
        params: payload
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<CommonResponsePayload<InternalWallet[]>>
      ): CommonResponsePayload<InternalWallet[]> {
        return baseQueryReturnValue.data
      },
      providesTags: ['internal-wallet-account']
    }),
    getInternalWalletTransactions: builder.query<
      CommonResponsePayload<TransactionDto[]>,
      InternalWalletTransactionPayload
    >({
      query: (payload) => ({
        url: '/internal-wallet/transactions',
        method: 'GET',
        cache: 'default',
        params: payload
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<CommonResponsePayload<TransactionDto[]>>
      ): CommonResponsePayload<TransactionDto[]> {
        return baseQueryReturnValue.data
      },
      providesTags: ['internal-wallet-transactions']
    }),
    createInternalWallet: builder.mutation<any, ModifyInternalWalletBody>({
      query: (body) => ({
        url: '/internal-wallet',
        method: 'POST',
        body
      }),
      invalidatesTags: ['internal-wallet-account']
    }),
    updateInternalWallet: builder.mutation<
      any,
      { body: ModifyInternalWalletBody; id: number }
    >({
      query: ({ id, body }) => ({
        url: `/internal-wallet/${id}`,
        method: 'PATCH',
        body
      }),
      invalidatesTags: ['internal-wallet-account']
    })
  })
})

export const {
  useGetListWalletGroupsQuery,
  useCreateInternalWalletGroupMutation,
  useUpdateInternalWalletGroupMutation,
  useGetListWalletsQuery,
  useLazyGetListWalletsQuery,
  useLazyGetListWalletGroupsQuery,
  useLazyGetListWalletInternalGroupsQuery,
  useCreateInternalWalletMutation,
  useUpdateInternalWalletMutation,
  useGetInternalWalletTransactionsQuery,
} = groupPermissionApi