import {
  SystemFeeManagementCreatePolicyPaymentWithBankCardApiArg,
  SystemFeeManagementCreatePolicyPaymentWithBankCardApiResponse,
  SystemFeeManagementCreatePolicyPaymentWithFlexpayApiArg,
  SystemFeeManagementCreatePolicyPaymentWithFlexpayApiResponse,
  SystemFeeManagementCreatePolicyTransferInternalApiArg,
  SystemFeeManagementCreatePolicyTransferInternalApiResponse,
  SystemFeeManagementCreatePolicyWithDrawApiArg,
  SystemFeeManagementCreatePolicyWithDrawApiResponse,
  SystemFeeManagementDirectDepositApiArg,
  SystemFeeManagementDirectDepositApiResponse,
  SystemFeeManagementFindOneApiArg,
  SystemFeeManagementFindOneApiResponse,
  SystemFeeManagementGetDirectDepositListApiArg,
  SystemFeeManagementGetDirectDepositListApiResponse,
  SystemFeeManagementGetPolicyPaymentWithBankCardListApiArg,
  SystemFeeManagementGetPolicyPaymentWithBankCardListApiResponse,
  SystemFeeManagementGetPolicyPaymentWithFlexpayListApiArg,
  SystemFeeManagementGetPolicyPaymentWithFlexpayListApiResponse,
  SystemFeeManagementGetPolicyPolicyTransferInternalListApiArg,
  SystemFeeManagementGetPolicyPolicyTransferInternalListApiResponse,
  SystemFeeManagementGetPolicyWithDrawListApiArg,
  SystemFeeManagementGetPolicyWithDrawListApiResponse,
  SystemFeeManagementRemoveApiArg,
  SystemFeeManagementRemoveApiResponse,
  SystemFeeManagementUpdateDirectDepositApiArg,
  SystemFeeManagementUpdateDirectDepositApiResponse,
  SystemFeeManagementUpdatePolicyPaymentWithBankCardApiArg,
  SystemFeeManagementUpdatePolicyPaymentWithBankCardApiResponse,
  SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiArg,
  SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiResponse,
  SystemFeeManagementUpdatePolicyTransferInternalApiArg,
  SystemFeeManagementUpdatePolicyTransferInternalApiResponse,
  SystemFeeManagementUpdatePolicyWithDrawApiArg,
  SystemFeeManagementUpdatePolicyWithDrawApiResponse
} from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'
export const addTagTypes = ['[Admin] Admin System fee management'] as const
const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      systemFeeManagementDirectDeposit: build.mutation<
        SystemFeeManagementDirectDepositApiResponse,
        SystemFeeManagementDirectDepositApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/direct-deposit`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyPaymentWithBankCard: build.mutation<
        SystemFeeManagementCreatePolicyPaymentWithBankCardApiResponse,
        SystemFeeManagementCreatePolicyPaymentWithBankCardApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-transfer-with-bank-card`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyTransferInternal: build.mutation<
        SystemFeeManagementCreatePolicyTransferInternalApiResponse,
        SystemFeeManagementCreatePolicyTransferInternalApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-transfer-internal`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyPaymentWithFlexpay: build.mutation<
        SystemFeeManagementCreatePolicyPaymentWithFlexpayApiResponse,
        SystemFeeManagementCreatePolicyPaymentWithFlexpayApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-transfer-with-FLEXPAY`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementCreatePolicyWithDraw: build.mutation<
        SystemFeeManagementCreatePolicyWithDrawApiResponse,
        SystemFeeManagementCreatePolicyWithDrawApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/create-policy-withdraw`,
          method: 'POST',
          body: queryArg.createSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetDirectDepositList: build.query<
        SystemFeeManagementGetDirectDepositListApiResponse,
        SystemFeeManagementGetDirectDepositListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/direct-deposit-list`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetPolicyPaymentWithBankCardList: build.query<
        SystemFeeManagementGetPolicyPaymentWithBankCardListApiResponse,
        SystemFeeManagementGetPolicyPaymentWithBankCardListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-transfer-with-bank-card`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin System fee management'],
        transformResponse: fnTransformResponse
      }),
      systemFeeManagementGetPolicyPolicyTransferInternalList: build.query<
        SystemFeeManagementGetPolicyPolicyTransferInternalListApiResponse,
        SystemFeeManagementGetPolicyPolicyTransferInternalListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-transfer-internal`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementGetPolicyPaymentWithFlexpayList: build.query<
        SystemFeeManagementGetPolicyPaymentWithFlexpayListApiResponse,
        SystemFeeManagementGetPolicyPaymentWithFlexpayListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-transfer-with-FLEXPAY`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin System fee management'],
        transformResponse: fnTransformResponse
      }),
      systemFeeManagementGetPolicyWithDrawList: build.query<
        SystemFeeManagementGetPolicyWithDrawListApiResponse,
        SystemFeeManagementGetPolicyWithDrawListApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/get-policy-withdraw`,
          params: {
            order: queryArg.order,
            page: queryArg.page,
            take: queryArg.take,
            query: queryArg.query,
            depositMethod: queryArg.depositMethod,
            applicableObject: queryArg.applicableObject,
            applicableObjectId: queryArg.applicableObjectId,
            orderBy: queryArg.orderBy
          }
        }),
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdateDirectDeposit: build.mutation<
        SystemFeeManagementUpdateDirectDepositApiResponse,
        SystemFeeManagementUpdateDirectDepositApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-direct-deposit/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyPaymentWithBankCard: build.mutation<
        SystemFeeManagementUpdatePolicyPaymentWithBankCardApiResponse,
        SystemFeeManagementUpdatePolicyPaymentWithBankCardApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-transfer-with-bank-card/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyTransferInternal: build.mutation<
        SystemFeeManagementUpdatePolicyTransferInternalApiResponse,
        SystemFeeManagementUpdatePolicyTransferInternalApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-transfer-internal/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyPaymentWithFlexpay: build.mutation<
        SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiResponse,
        SystemFeeManagementUpdatePolicyPaymentWithFlexpayApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-transfer-with-FLEXPAY/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementUpdatePolicyWithDraw: build.mutation<
        SystemFeeManagementUpdatePolicyWithDrawApiResponse,
        SystemFeeManagementUpdatePolicyWithDrawApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy-withdraw/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementFindOne: build.query<
        SystemFeeManagementFindOneApiResponse,
        SystemFeeManagementFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/${queryArg.id}`
        }),
        providesTags: ['[Admin] Admin System fee management']
      }),
      systemFeeManagementRemove: build.mutation<
        SystemFeeManagementRemoveApiResponse,
        SystemFeeManagementRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/${queryArg.id}`,
          method: 'DELETE'
        }),
        invalidatesTags: ['[Admin] Admin System fee management']
      })
    }),
    overrideExisting: false
  })
export { injectedRtkApi as enhancedApi }
export const {
  useSystemFeeManagementDirectDepositMutation,
  useSystemFeeManagementCreatePolicyPaymentWithBankCardMutation,
  useSystemFeeManagementCreatePolicyTransferInternalMutation,
  useSystemFeeManagementCreatePolicyPaymentWithFlexpayMutation,
  useSystemFeeManagementCreatePolicyWithDrawMutation,
  useSystemFeeManagementGetDirectDepositListQuery,
  useSystemFeeManagementGetPolicyPaymentWithBankCardListQuery,
  useSystemFeeManagementGetPolicyPolicyTransferInternalListQuery,
  useSystemFeeManagementGetPolicyPaymentWithFlexpayListQuery,
  useSystemFeeManagementGetPolicyWithDrawListQuery,
  useSystemFeeManagementUpdateDirectDepositMutation,
  useSystemFeeManagementUpdatePolicyPaymentWithBankCardMutation,
  useSystemFeeManagementUpdatePolicyTransferInternalMutation,
  useSystemFeeManagementUpdatePolicyPaymentWithFlexpayMutation,
  useSystemFeeManagementUpdatePolicyWithDrawMutation,
  useSystemFeeManagementFindOneQuery,
  useSystemFeeManagementRemoveMutation
} = injectedRtkApi
