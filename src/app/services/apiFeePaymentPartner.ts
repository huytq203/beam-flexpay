import { apiFeeService } from './apiService'
import type { ResponseType } from '@type/api'
import type { FeePaymentPartner } from '@type/fee.type'

export const apiFeePaymentPartner = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    getPaymentPartners: build.query<FeePaymentPartner[], void>({
      query: () => ({ url: `/fee/payment-partners`, method: 'GET' }),
      transformResponse: (res: ResponseType<FeePaymentPartner[]>) => res.data,
      extraOptions: { suppressGlobalLoading: true }
    })
  })
})

export const { useGetPaymentPartnersQuery } = apiFeePaymentPartner
