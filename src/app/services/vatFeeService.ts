import {
  VatFeeCreateApiArg,
  VatFeeCreateApiResponse,
  VatFeeFindAllApiArg,
  VatFeeFindAllApiResponse,
  VatFeeUpdateApiArg,
  VatFeeUpdateApiResponse,
  VatFeeRemoveApiArg,
  VatFeeRemoveApiResponse,
  VatFeeFindOneApiArg,
  VatFeeFindOneApiResponse,
  VatFeeGetAccountGroupsApiResponse,
  VatFeeGetAccountsApiArg,
  VatFeeGetAccountsApiResponse
} from '@type/vat-fee'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'

export const addTagTypes = [
  '[Admin] Admin VAT Fee'
] as const

const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      vatFeeCreate: build.mutation<
        VatFeeCreateApiResponse,
        VatFeeCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/vat-fee`,
          method: 'POST',
          body: queryArg.createVatFeeDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin VAT Fee']
      }),
      vatFeeFindAll: build.query<
        VatFeeFindAllApiResponse,
        VatFeeFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/vat-fee`,
          params: {
            applicationType: queryArg.applicationType,
            accountGroup: queryArg.accountGroup,
            accountNumber: queryArg.accountNumber,
            status: queryArg.status,
            createdFrom: queryArg.createdFrom,
            createdTo: queryArg.createdTo,
            appliedFrom: queryArg.appliedFrom,
            appliedTo: queryArg.appliedTo,
            page: queryArg.page,
            take: queryArg.take,
            order: queryArg.order,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin VAT Fee']
      }),
      vatFeeUpdate: build.mutation<
        VatFeeUpdateApiResponse,
        VatFeeUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/vat-fee/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateVatFeeDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin VAT Fee']
      }),
      vatFeeRemove: build.mutation<
        VatFeeRemoveApiResponse,
        VatFeeRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/vat-fee/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin VAT Fee']
      }),
      vatFeeFindOne: build.query<
        VatFeeFindOneApiResponse,
        VatFeeFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/vat-fee/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin VAT Fee']
      }),
      vatFeeGetAccountGroups: build.query<
        VatFeeGetAccountGroupsApiResponse,
        void
      >({
        query: () => ({
          url: `/vat-fee/account-groups/list`
        }),
        transformResponse: fnTransformResponse
      }),
      vatFeeGetAccounts: build.query<
        VatFeeGetAccountsApiResponse,
        VatFeeGetAccountsApiArg
      >({
        query: (queryArg) => ({
          url: `/vat-fee/customers/search`,
          params: {
            query: queryArg.query,
            page: queryArg.page,
            take: queryArg.take,
            order: queryArg.order,
            orderBy: queryArg.orderBy
          }
        }),
        transformResponse: fnTransformResponse
      })
    })
  })

export const {
  useVatFeeCreateMutation,
  useVatFeeFindAllQuery,
  useVatFeeUpdateMutation,
  useVatFeeRemoveMutation,
  useVatFeeFindOneQuery,
  useVatFeeGetAccountGroupsQuery,
  useVatFeeGetAccountsQuery
} = injectedRtkApi