import {
  OutboundFeeApproveApiArg,
  OutboundFeeApproveApiResponse,
  OutboundFeeCreateApiArg,
  OutboundFeeCreateApiResponse,
  OutboundFeeCustomerSearchApiArg,
  OutboundFeeCustomerSearchApiResponse,
  OutboundFeeFindAllApiArg,
  OutboundFeeFindAllApiResponse,
  OutboundFeeFindOneApiArg,
  OutboundFeeFindOneApiResponse,
  OutboundFeeGetAccountGroupsApiResponse,
  OutboundFeeGetAccountGroupsListApiResponse,
  OutboundFeeGetAccountsApiResponse,
  OutboundFeeGetBanksApiResponse,
  OutboundFeeGetBanksListApiResponse,
  OutboundFeeGetProvidersApiResponse,
  OutboundFeeRejectApiArg,
  OutboundFeeRejectApiResponse,
  OutboundFeeRemoveApiArg,
  OutboundFeeRemoveApiResponse,
  OutboundFeeUpdateApiArg,
  OutboundFeeUpdateApiResponse
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
        query: (queryArg) => {
          // Build query params manually to handle arrays correctly (same pattern as inboundFeeService)
          const queryParams = new URLSearchParams()

          // Required pagination
          queryParams.append('page', queryArg.page.toString())
          queryParams.append('take', queryArg.take.toString())

          // Optional sorting
          if (queryArg.order) queryParams.append('order', queryArg.order)
          if (queryArg.orderBy) queryParams.append('orderBy', queryArg.orderBy)

          // Date range filters
          if (queryArg.createdFrom) queryParams.append('createdFrom', queryArg.createdFrom)
          if (queryArg.createdTo) queryParams.append('createdTo', queryArg.createdTo)
          if (queryArg.appliedFrom) queryParams.append('appliedFrom', queryArg.appliedFrom)
          if (queryArg.appliedTo) queryParams.append('appliedTo', queryArg.appliedTo)

          // Single-select filters
          if (queryArg.applicationType && queryArg.applicationType !== 'all') {
            queryParams.append('applicationType', queryArg.applicationType)
          }
          if (queryArg.transactionType && queryArg.transactionType !== 'all') {
            queryParams.append('transactionType', queryArg.transactionType)
          }
          if (queryArg.customerId) {
            queryParams.append('customerId', queryArg.customerId.toString())
          }
          if (queryArg.chargeWithin !== undefined) {
            queryParams.append('chargeWithin', queryArg.chargeWithin.toString())
          }
          if (queryArg.status) {
            queryParams.append('status', queryArg.status)
          }

          // Multi-select filters (arrays) - use [] suffix for array params (same as inbound)
          if (queryArg.accountGroupIds && queryArg.accountGroupIds.length > 0) {
            queryArg.accountGroupIds.forEach(id => {
              queryParams.append('accountGroupIds[]', id.toString())
            })
          }
          if (queryArg.bankIds && queryArg.bankIds.length > 0) {
            queryArg.bankIds.forEach(id => {
              queryParams.append('bankIds[]', id.toString())
            })
          }
          if (queryArg.methods && queryArg.methods.length > 0) {
            queryArg.methods.forEach(method => {
              queryParams.append('methods[]', method)
            })
          }
          if (queryArg.providers && queryArg.providers.length > 0) {
            queryArg.providers.forEach(provider => {
              queryParams.append('providers[]', provider)
            })
          }

          return {
            url: `/outbound-fee?${queryParams.toString()}`,
            method: 'GET'
          }
        },
        transformResponse: fnTransformResponse,
        providesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeUpdate: build.mutation<
        OutboundFeeUpdateApiResponse,
        OutboundFeeUpdateApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/${queryArg.id}`,
          method: 'PUT',
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
      }),
      outboundFeeApprove: build.mutation<
        OutboundFeeApproveApiResponse,
        OutboundFeeApproveApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/${queryArg.id}/approve`,
          method: 'POST'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Outbound Fee']
      }),
      outboundFeeReject: build.mutation<
        OutboundFeeRejectApiResponse,
        OutboundFeeRejectApiArg
      >({
        query: (queryArg) => ({
          url: `/outbound-fee/${queryArg.id}/reject`,
          method: 'POST'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin Outbound Fee']
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
  useLazyOutboundFeeCustomerSearchQuery,
  useOutboundFeeApproveMutation,
  useOutboundFeeRejectMutation
} = injectedRtkApi