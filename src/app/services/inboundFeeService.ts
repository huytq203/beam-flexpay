import type {
  InboundFeeFindAllApiArg,
  InboundFeeFindAllApiResponse,
  InboundFeeCreateApiArg,
  InboundFeeCreateApiResponse,
  InboundFeeUpdateApiArg,
  InboundFeeUpdateApiResponse,
  InboundFeeRemoveApiArg,
  InboundFeeRemoveApiResponse,
  InboundFeeFindOneApiArg,
  InboundFeeFindOneApiResponse,
  InboundFeeGetAccountGroupsApiResponse,
  InboundFeeGetAccountsApiResponse,
  InboundFeeGetBanksApiResponse,
  InboundFeeGetProvidersApiResponse,
  InboundFeeGetBanksListApiResponse,
  InboundFeeGetAccountGroupsListApiResponse,
  InboundFeeCustomerSearchApiArg,
  InboundFeeCustomerSearchApiResponse
} from '@type/inbound-fee'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService as api } from './apiService'

export const addTagTypes = [
  '[Admin] Admin Inbound Fee'
] as const

const injectedRtkApi = api
  .enhanceEndpoints({
    addTagTypes
  })
  .injectEndpoints({
    endpoints: (build) => ({
      // Get all inbound fees with filters
      inboundFeeFindAll: build.query<InboundFeeFindAllApiResponse, InboundFeeFindAllApiArg>({
        query: (params) => {
          const queryParams = new URLSearchParams()

          // Add pagination params
          if (params.page) queryParams.append('page', params.page.toString())
          if (params.take) queryParams.append('take', params.take.toString())

          // Add filter params
          if (params.method) queryParams.append('method', params.method)
          if (params.provider) queryParams.append('provider', params.provider)
          if (params.applicationType) queryParams.append('applicationType', params.applicationType)
          if (params.transactionType) queryParams.append('transactionType', params.transactionType)
          if (params.bank) queryParams.append('bank', params.bank)
          if (params.accountGroup) queryParams.append('accountGroup', params.accountGroup)
          if (params.accountId) queryParams.append('accountId', params.accountId)

          // Add date range params
          if (params.createdFrom) queryParams.append('createdFrom', params.createdFrom)
          if (params.createdTo) queryParams.append('createdTo', params.createdTo)
          if (params.appliedFrom) queryParams.append('appliedFrom', params.appliedFrom)
          if (params.appliedTo) queryParams.append('appliedTo', params.appliedTo)

          // Add search/order params
          if (params.query) queryParams.append('query', params.query)
          if (params.order) queryParams.append('order', params.order)
          if (params.orderBy) queryParams.append('orderBy', params.orderBy)

          return {
            url: `/inbound-fee?${queryParams.toString()}`,
            method: 'GET'
          }
        },
        transformResponse: fnTransformResponse
      }),

      // Get single inbound fee by ID
      inboundFeeFindOne: build.query<InboundFeeFindOneApiResponse, InboundFeeFindOneApiArg>({
        query: ({ id }) => ({
          url: `/inbound-fee/${id}`,
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Create new inbound fee
      inboundFeeCreate: build.mutation<InboundFeeCreateApiResponse, InboundFeeCreateApiArg>({
        query: ({ createInboundFeeDto }) => ({
          url: '/inbound-fee',
          method: 'POST',
          body: createInboundFeeDto
        }),
        transformResponse: fnTransformResponse
      }),

      // Update inbound fee
      inboundFeeUpdate: build.mutation<InboundFeeUpdateApiResponse, InboundFeeUpdateApiArg>({
        query: ({ id, updateInboundFeeDto }) => ({
          url: `/inbound-fee/${id}`,
          method: 'PATCH',
          body: updateInboundFeeDto
        }),
        transformResponse: fnTransformResponse
      }),

      // Delete inbound fee
      inboundFeeRemove: build.mutation<InboundFeeRemoveApiResponse, InboundFeeRemoveApiArg>({
        query: ({ id }) => ({
          url: `/inbound-fee/${id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse
      }),

      // Get account groups for dropdown
      inboundFeeGetAccountGroups: build.query<InboundFeeGetAccountGroupsApiResponse, void>({
        query: () => ({
          url: '/account-groups',
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Get accounts for dropdown
      inboundFeeGetAccounts: build.query<InboundFeeGetAccountsApiResponse, void>({
        query: () => ({
          url: '/accounts',
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Get banks for dropdown
      inboundFeeGetBanks: build.query<InboundFeeGetBanksApiResponse, void>({
        query: () => ({
          url: '/banks',
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Get providers for dropdown
      inboundFeeGetProviders: build.query<InboundFeeGetProvidersApiResponse, void>({
        query: () => ({
          url: '/providers',
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Get banks list for dropdown
      inboundFeeGetBanksList: build.query<InboundFeeGetBanksListApiResponse[], void>({
        query: () => ({
          url: '/inbound-fee/banks/list',
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Get account groups list for dropdown
      inboundFeeGetAccountGroupsList: build.query<InboundFeeGetAccountGroupsListApiResponse[], void>({
        query: () => ({
          url: '/inbound-fee/account-groups/list',
          method: 'GET'
        }),
        transformResponse: fnTransformResponse
      }),

      // Customer search for dropdown
      inboundFeeCustomerSearch: build.query<InboundFeeCustomerSearchApiResponse, InboundFeeCustomerSearchApiArg>({
        query: (queryArg) => ({
          url: '/inbound-fee/customers/search',
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

// Export hooks for usage in components
export const {
  useInboundFeeFindAllQuery,
  useInboundFeeFindOneQuery,
  useInboundFeeCreateMutation,
  useInboundFeeUpdateMutation,
  useInboundFeeRemoveMutation,
  useInboundFeeGetAccountGroupsQuery,
  useInboundFeeGetAccountsQuery,
  useInboundFeeGetBanksQuery,
  useInboundFeeGetProvidersQuery,
  useInboundFeeGetBanksListQuery,
  useInboundFeeGetAccountGroupsListQuery,
  useInboundFeeCustomerSearchQuery,
  useLazyInboundFeeCustomerSearchQuery
} = injectedRtkApi