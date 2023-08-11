import {
  PaymentServiceCreateApiArg,
  PaymentServiceCreateApiResponse,
  PaymentServiceDeleteApiArg,
  PaymentServiceDeleteApiResponse,
  PaymentServiceFindAllApiArg,
  PaymentServiceFindAllApiResponse,
  PaymentServiceFindOneApiArg,
  PaymentServiceFindOneApiResponse,
  PaymentServiceUpdateApiArg,
  PaymentServiceUpdateApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin Payment Service'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      paymentServiceFindAll: build.query<
        PaymentServiceFindAllApiResponse,
        PaymentServiceFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/pagination`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            type: queryArg['type'],
            active: queryArg.active,
            name: queryArg.name,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Payment Service'],
        transformResponse: fnTransformResponse
      }),
      paymentServiceFindOne: build.query<
        PaymentServiceFindOneApiResponse,
        PaymentServiceFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/${queryArg.id}`
        }),
        providesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceUpdate: build.mutation<
        PaymentServiceUpdateApiResponse,
        PaymentServiceUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.formData
        }),
        invalidatesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceDelete: build.mutation<
        PaymentServiceDeleteApiResponse,
        PaymentServiceDeleteApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service/${queryArg.id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['[Admin] Admin Payment Service']
      }),
      paymentServiceCreate: build.mutation<
        PaymentServiceCreateApiResponse,
        PaymentServiceCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-service`,
          method: 'POST',
          body: queryArg
        }),
        invalidatesTags: ['[Admin] Admin Payment Service']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  usePaymentServiceFindAllQuery,
  usePaymentServiceFindOneQuery,
  usePaymentServiceUpdateMutation,
  usePaymentServiceDeleteMutation,
  usePaymentServiceCreateMutation
} = injectedRtkApi
