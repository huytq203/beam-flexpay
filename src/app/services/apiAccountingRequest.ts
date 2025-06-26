import {
  AccountingRequest,
  AccountingRequestPayload,
  AccountingRequestResponse,
  AccountingRequestBody
} from '@type/accountingRequest'
import { ResponseType } from '@type/api'
import { CommonResponsePayload } from '@type/common'
import { pretty } from '@utils/qs'
import { apiService } from './apiService'

export const accountingRequestApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListDepositRequest: builder.query<
      AccountingRequestResponse,
      AccountingRequestPayload
    >({
      query: (payload) => ({
        url: '/accounting-requests',
        method: 'GET',
        params: pretty(payload)
      }),
      transformResponse(
        baseQueryReturnValue: ResponseType<
          CommonResponsePayload<AccountingRequest[]>
        >
      ): CommonResponsePayload<AccountingRequest[]> {
        return baseQueryReturnValue.data
      },
      providesTags: ['accounting-requests']
    }),
    getDetailDepositRequest: builder.query({
      query: ( id ) => ({
        url: `/accounting-requests/${id}`,
        method: 'GET',
      }),
      transformResponse: (res: ResponseType<any>) => res.data,
      providesTags: ['accounting-requests']
    }),
    createDepositRequest: builder.mutation<any, AccountingRequestBody>({
      query: (body) => ({
        url: '/accounting-requests',
        method: 'POST',
        body
      }),
      invalidatesTags: ['accounting-requests']
    }),
    updateDepositRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/accounting-requests/${id}`,
        method: 'PATCH',
        body: body
      }),
      invalidatesTags: ['accounting-requests']
    })
  })
})
export const {
  useGetListDepositRequestQuery,
  useCreateDepositRequestMutation,
  useUpdateDepositRequestMutation,
  useGetDetailDepositRequestQuery,
  useLazyGetDetailDepositRequestQuery
} = accountingRequestApi
