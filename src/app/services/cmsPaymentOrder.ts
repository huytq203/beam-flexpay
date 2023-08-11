import {
  PaymentOrderFindAllApiArg,
  PaymentOrderFindAllApiResponse,
  PaymentOrderFindOneApiArg,
  PaymentOrderFindOneApiResponse,
  PaymentOrderGetExportExcelApiArg,
  PaymentOrderGetExportExcelApiResponse,
  PaymentOrderUpdateApiArg,
  PaymentOrderUpdateApiResponse
} from '@type/application'
import { RootState } from '../store'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin Payment Order'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      paymentOrderFindAll: build.query<
        PaymentOrderFindAllApiResponse,
        PaymentOrderFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/pagination`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            id: queryArg.id,
            partnerOrderStatus: queryArg.partnerOrderStatus,
            customerPhone: queryArg.customerPhone,
            partnerOrderCode: queryArg.partnerOrderCode,
            from: queryArg['from'],
            to: queryArg.to,
            paymentPeriodFrom: queryArg.paymentPeriodFrom,
            paymentPeriodTo: queryArg.paymentPeriodTo,
            amount: queryArg.amount,
            partnerCustomerName: queryArg.partnerCustomerName,
            paymentServiceType: queryArg.paymentServiceType,
            partnerId: queryArg.partnerId,
            customerIdentityNumber: queryArg.customerIdentityNumber,
            transactionStatus: queryArg.transactionStatus,
            processedId: queryArg.processedId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin Payment Order'],
        transformResponse: (response: any) => {
          return response.data
        }
      }),
      paymentOrderFindOne: build.query<
        PaymentOrderFindOneApiResponse,
        PaymentOrderFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/${queryArg.id}`
        }),
        providesTags: ['[Admin] Admin Payment Order']
      }),
      paymentOrderUpdate: build.mutation<
        PaymentOrderUpdateApiResponse,
        PaymentOrderUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/payment-order/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updatePaymentOrderDto
        }),
        invalidatesTags: ['[Admin] Admin Payment Order']
      }),
      paymentOrderGetExportExcel: build.query<
        PaymentOrderGetExportExcelApiResponse,
        PaymentOrderGetExportExcelApiArg
      >({
        async queryFn(arg, api, extraOptions, baseQuery) {
          const _headers = new Headers()
          const { accessToken } = (api.getState() as RootState).auth
          _headers.append('Authorization', `Bearer ${accessToken}`)
          var requestOptions: any = {
            method: 'GET',
            headers: _headers,
            redirect: 'follow'
          }
          let args = ''
          for (const key in arg) {
            args += key + '=' + (arg as any)[key] + '&'
          }
          fetch(
            'https://cms-beam.toilacoder.click/api/admin/payment-order/export/excel?' +
              args,
            requestOptions
          ).then((response) => response.blob())
          return { data: true }
        },
        providesTags: ['[Admin] Admin Payment Order']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  usePaymentOrderFindAllQuery,
  usePaymentOrderFindOneQuery,
  usePaymentOrderUpdateMutation,
  usePaymentOrderGetExportExcelQuery,
  useLazyPaymentOrderGetExportExcelQuery
} = injectedRtkApi
