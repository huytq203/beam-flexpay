import {
  PaymentPartnerCreateApiArg,
  PaymentPartnerCreateApiResponse,
  PaymentPartnerDeleteApiArg,
  PaymentPartnerDeleteApiResponse,
  PaymentPartnerFindAllApiArg,
  PaymentPartnerFindAllApiResponse,
  PaymentPartnerFindOneApiArg,
  PaymentPartnerFindOneApiResponse,
  PaymentPartnerGetPartnerOderDetailApiArg,
  PaymentPartnerGetPartnerOderDetailApiResponse,
  PaymentPartnerUpdateApiArg,
  PaymentPartnerUpdateApiResponse
} from '@type/application'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin Payment Partner'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      paymentPartnerFindAll: build.query<
        PaymentPartnerFindAllApiResponse,
        PaymentPartnerFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/pagination`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            active: queryArg.active,
            type: queryArg['type'],
            name: queryArg.name,
            paymentServiceId: queryArg.paymentServiceId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Payment Partner'],
        transformResponse: (response: any) => {
          return response.data
        }
      }),
      paymentPartnerGetPartnerOderDetail: build.query<
        PaymentPartnerGetPartnerOderDetailApiResponse[],
        PaymentPartnerGetPartnerOderDetailApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/get-bill-detail`,
          params: {
            paymentPartnerId: queryArg.paymentPartnerId,
            billCode: queryArg.billCode,
            type: queryArg['type']
          }
        }),
        providesTags: ['[Admin] Admin Payment Partner'],
        transformResponse: (response: any) => {
          return [response.data]
        }
      }),
      paymentPartnerFindOne: build.query<
        PaymentPartnerFindOneApiResponse,
        PaymentPartnerFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/${queryArg.id}`
        }),
        providesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerUpdate: build.mutation<
        PaymentPartnerUpdateApiResponse,
        PaymentPartnerUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.body
        }),
        invalidatesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerDelete: build.mutation<
        PaymentPartnerDeleteApiResponse,
        PaymentPartnerDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner/${queryArg.id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['[Admin] Admin Payment Partner']
      }),
      paymentPartnerCreate: build.mutation<
        PaymentPartnerCreateApiResponse,
        PaymentPartnerCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-partner`,
          method: 'POST',
          body: queryArg
        }),
        invalidatesTags: ['[Admin] Admin Payment Partner']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  usePaymentPartnerFindAllQuery,
  useLazyPaymentPartnerFindAllQuery,
  usePaymentPartnerGetPartnerOderDetailQuery,
  usePaymentPartnerFindOneQuery,
  usePaymentPartnerUpdateMutation,
  usePaymentPartnerDeleteMutation,
  usePaymentPartnerCreateMutation
} = injectedRtkApi
