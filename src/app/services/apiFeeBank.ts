import { apiFeeService } from './apiService'
import type { ResponseType } from '@type/api'
import type { FeeBank, FeePage } from '@type/fee.type'

export const apiFeeBank = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getBank: build.query<FeePage<FeeBank>, Record<string, unknown>>({
      query: (params) => ({
        url: `/fee/banks`,
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<FeePage<FeeBank>>) => res.data,
      extraOptions: { suppressGlobalLoading: true },
      providesTags: ['feeBank']
    })
  })
})
export const { useGetBankQuery } = apiFeeBank
