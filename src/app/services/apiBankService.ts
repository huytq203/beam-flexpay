import { ResponseType } from '@type/api'
import { PublicBankInterface } from '@type/bank'
import { apiService } from './apiService'

const bankAPI = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getPublicBanks: builder.query({
      query: () => ({
        url: '/bank/find-all-active',
        method: 'GET'
      }),
      transformResponse: (res: ResponseType<PublicBankInterface[]>) => res.data
    })
  })
})

export const {
  useLazyGetPublicBanksQuery,
} = bankAPI
