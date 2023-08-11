import {
  AdminAccountData,
  AdminAccountPayload,
  AdminSearchParams
} from '@type/admin'
import { ResponseType } from '@type/api'
import {
  FreezeAndUnfreezeAccountSearchParams,
  FreezeHistoryPayload
} from '@type/freezeAccount'
import { apiService } from './apiService'

export const freezeAndUnfreezeAccountApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getHistoryFreeze: builder.query<
      FreezeHistoryPayload,
      FreezeAndUnfreezeAccountSearchParams
    >({
      query: (params) => ({
        url: '/freeze-balance-history',
        method: 'GET',
        params: params
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<FreezeHistoryPayload>
      ): FreezeHistoryPayload {
        return baseQueryReturnValue.data
      }
    }),
    getDetailAccountInformation: builder.query({
      query: (params) => ({
        url: `/customer/customer-balance/${params}`,
        method: 'GET'
      })
    }),
    freezeAccountMutation: builder.mutation({
      query: (params) => ({
        url: `/freeze-balance-history`,
        method: 'POST',
        body: params
      })
    }),
    unFreezeAccountMutation: builder.mutation({
      query: (params) => ({
        url: `/freeze-balance-history/open-freeze-balance`,
        method: 'POST',
        body: params
      })
    })
  })
})

export const {
  useGetHistoryFreezeQuery,
  useLazyGetHistoryFreezeQuery,
  useGetDetailAccountInformationQuery,
  useLazyGetDetailAccountInformationQuery,
  useFreezeAccountMutationMutation,
  useUnFreezeAccountMutationMutation
} = freezeAndUnfreezeAccountApi
