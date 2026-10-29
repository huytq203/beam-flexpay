import { apiFeeService } from './apiService'
import type { ResponseType } from '@type/api'
import type { FeePaymentPartner } from '@type/fee.type'

export const apiFeePartner = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    /** Danh mục nhỏ, trả trọn (không phân trang). */
    getPaymentPartners: build.query<FeePaymentPartner[], void>({
      query: () => ({ url: `/fee/payment-partners`, method: 'GET' }),
      transformResponse: (res: ResponseType<FeePaymentPartner[]>) => res.data,
      extraOptions: { suppressGlobalLoading: true },
      providesTags: ['feePartner']
    })
  })
})

export const { useGetPaymentPartnersQuery } = apiFeePartner
