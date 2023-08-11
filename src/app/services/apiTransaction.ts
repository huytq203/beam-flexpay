import { ResponseType } from '@type/api'
import { ITransactionResponse } from '@type/transfer'
import { apiService } from './apiService'

export const transactionService = apiService.injectEndpoints({
  endpoints: (build) => ({
    getTransactionList: build.query({
      query: (payload) => ({
        url: '/transaction',
        method: 'GET',
        params: payload
      }),
      transformResponse: (res: ResponseType<ITransactionResponse>) => res.data
    }),
    getTransactionDetail: build.query({
      query: () => ({
        url: '/transaction',
        method: 'GET'
      })
    }),
    changeStatus: build.mutation({
      query: ({ status, id }) => ({
        url: '/transaction/status/' + id,
        method: 'PUT',
        body: { status }
      })
    })
  })
})

export const {
  useGetTransactionDetailQuery,
  useGetTransactionListQuery,
  useChangeStatusMutation
} = transactionService
