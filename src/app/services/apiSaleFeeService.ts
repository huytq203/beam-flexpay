import { ResponseType } from '@type/api'
import { SaleFeePayload, SaleFeeSearchParams } from '@type/saleFeeType'
import { apiService } from './apiService'

export const transactionService = apiService.injectEndpoints({
  endpoints: (build) => ({
    getListSaleFee: build.query<SaleFeePayload, SaleFeeSearchParams>({
      query: (payload) => ({
        url: '/sale-fee',
        method: 'GET',
        params: payload
      })
    }),
    createSaleFee: build.mutation({
      query: (payload) => ({
        url: '/sale-fee',
        method: 'POST',
        body: payload
      })
    }),
    getDetailSalelFee: build.query({
      query: (payload) => ({
        url: `/sale-fee/${payload}`,
        method: 'GET'
      })
    }),
    updateSaleFee: build.mutation({
      query: (payload) => ({
        url: `/sale-fee/${payload.id}`,
        method: 'PATCH',
        body: payload
      })
    }),
    createNotifySaleFee: build.mutation({
      query: (payload) => ({
        url: `sale-fee/${payload}/notify`,
        method: 'GET'
      })
    })
  })
})

export const {
  useGetListSaleFeeQuery,
  useCreateSaleFeeMutation,
  useGetDetailSalelFeeQuery,
  useUpdateSaleFeeMutation,
  useCreateNotifySaleFeeMutation
} = transactionService
