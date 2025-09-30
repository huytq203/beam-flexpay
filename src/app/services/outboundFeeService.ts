import {
  OutboundFeeCreateApiArg,
  OutboundFeeCreateApiResponse,
  OutboundFeeFindAllApiArg,
  OutboundFeeFindAllApiResponse,
  OutboundFeeUpdateApiArg,
  OutboundFeeUpdateApiResponse,
  OutboundFeeRemoveApiArg,
  OutboundFeeRemoveApiResponse,
  OutboundFeeFindOneApiArg,
  OutboundFeeFindOneApiResponse,
  OutboundFeeGetAccountGroupsApiResponse,
  OutboundFeeGetAccountsApiResponse,
  OutboundFeeGetBanksApiResponse,
  OutboundFeeGetProvidersApiResponse,
  OutboundFeeGetBanksListApiResponse,
  OutboundFeeGetAccountGroupsListApiResponse,
  OutboundFeeCustomerSearchApiArg,
  OutboundFeeCustomerSearchApiResponse
} from '@type/outbound-fee'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'

export const addTagTypes = [
  '[Admin] Admin Outbound Fee'
] as const

const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      outboundFeeCreate: build.mutation<
        OutboundFeeCreateApiResponse,
        OutboundFeeCreateApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee`,
          method: 'POST',
          body: queryArg.createOutboundFeeDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeFindAll: build.query<
        OutboundFeeFindAllApiResponse,
        OutboundFeeFindAllApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee`,
          params: {
            method: queryArg.method,
            provider: queryArg.provider,
            createdFrom: queryArg.createdFrom,
            createdTo: queryArg.createdTo,
            appliedFrom: queryArg.appliedFrom,
            appliedTo: queryArg.appliedTo,
            chargeWithin: queryArg.chargeWithin,
            applicationType: queryArg.applicationType,
            transactionType: queryArg.transactionType,
            bank: queryArg.bank,
            accountGroup: queryArg.accountGroup,
            page: queryArg.page,
            take: queryArg.take,
            order: queryArg.order,
            orderBy: queryArg.orderBy,
            query: queryArg.query
          }
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeUpdate: build.mutation<
        OutboundFeeUpdateApiResponse,
        OutboundFeeUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/${queryArg.id}`,
          method: 'PATCH',
          body: queryArg.updateOutboundFeeDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeRemove: build.mutation<
        OutboundFeeRemoveApiResponse,
        OutboundFeeRemoveApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeFindOne: build.query<
        OutboundFeeFindOneApiResponse,
        OutboundFeeFindOneApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/${queryArg.id}`
        }),
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeGetAccountGroups: build.query<
        OutboundFeeGetAccountGroupsApiResponse,
        void
      >({
        query: () => ({
          url: `/outbound-fee/account-groups`
        }),
        transformResponse: fnTransformResponse
      }),
      outboundFeeGetAccounts: build.query<
        OutboundFeeGetAccountsApiResponse,
        { search?: string }
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/accounts`,
          params: {
            search: queryArg.search
          }
        }),
        transformResponse: fnTransformResponse
      }),
      outboundFeeGetBanks: build.query<
        OutboundFeeGetBanksApiResponse,
        void
      >({
        query: () => ({
          url: `/outbound-fee/banks`
        }),
        transformResponse: fnTransformResponse
      }),
      outboundFeeGetProviders: build.query<
        OutboundFeeGetProvidersApiResponse,
        void
      >({
        query: () => ({
          url: `/outbound-fee/providers`
        }),
        transformResponse: fnTransformResponse
      }),
      outboundFeeGetBanksList: build.query<
        OutboundFeeGetBanksListApiResponse[],
        void
      >({
        query: () => ({
          url: `/outbound-fee/banks/list`
        }),
        transformResponse: fnTransformResponse
      }),
      outboundFeeGetAccountGroupsList: build.query<
        OutboundFeeGetAccountGroupsListApiResponse[],
        void
      >({
        query: () => ({
          url: `/outbound-fee/account-groups/list`
        }),
        transformResponse: fnTransformResponse
      }),
      outboundFeeCustomerSearch: build.query<
        OutboundFeeCustomerSearchApiResponse,
        OutboundFeeCustomerSearchApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/customers/search`,
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
  useOutboundFeeCreateMutation,
  useOutboundFeeFindAllQuery,
  useOutboundFeeUpdateMutation,
  useOutboundFeeRemoveMutation,
  useOutboundFeeFindOneQuery,
  useOutboundFeeGetAccountGroupsQuery,
  useOutboundFeeGetAccountsQuery,
  useOutboundFeeGetBanksQuery,
  useOutboundFeeGetProvidersQuery,
  useOutboundFeeGetBanksListQuery,
  useOutboundFeeGetAccountGroupsListQuery,
  useOutboundFeeCustomerSearchQuery,
  useLazyOutboundFeeCustomerSearchQuery
} = injectedRtkApi