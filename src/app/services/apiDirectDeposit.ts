import { ResponseType } from '@type/api'
import { SystemFeeManagementCreatePolicyApiArg, SystemFeeManagementCreatePolicyApiResponse, SystemFeeManagementRemovePolicyApiArg, SystemFeeManagementRemovePolicyApiResponse, SystemFeeManagementUpdatePolicyApiArg, SystemFeeManagementUpdatePolicyApiResponse } from '@type/application'
import { HistoryPolicyInterface, IPolicy, IPolicyResponse, IPolicyTable } from '@type/policyManagement'
import { fnTransformResponse } from '@utils/helperFunctions'
import { apiService } from './apiService'
export const addTagTypes = [
  '[Admin] Admin System fee management',
] as const
export const apiDirectDeposit = apiService.enhanceEndpoints({
  addTagTypes
}).injectEndpoints({
  endpoints: (build) => ({
    getListDirectDeposit: build.query({
      query: ({applicableObjectId, ...params}) => ({
        url: '/system-fee-management/direct-deposit-list' + `?${applicableObjectId ? applicableObjectId : ''}`,
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<IPolicyResponse>) => res.data
    }),
    getListHistory: build.query({
      query: (params) => ({
        url: '/history-audit-log-management',
        method: 'GET',
        params: params
      }),
      transformResponse: (res: ResponseType<IPolicy<HistoryPolicyInterface[]>>) => res.data
    }),
    createDirectPolicy: build.mutation({
      query: (payload) => ({
        url: '/system-fee-management/create-policy',
        method: 'POST',
        body: payload
      })
    }),
    systemFeeManagementCreatePolicy: build.mutation<
      SystemFeeManagementCreatePolicyApiResponse,
      SystemFeeManagementCreatePolicyApiArg
    >({
      query: (queryArg) => {
        // In ra body để debug
        //console.log('Create Policy BODY1:', queryArg)
        return {
          url: `/system-fee-management/create-policy`,
          method: 'POST',
          body: queryArg
        }
      },
      transformResponse: fnTransformResponse,
      invalidatesTags: ['[Admin] Admin System fee management']
    }),
    systemFeeManagementUpdatePolicy: build.mutation<
        SystemFeeManagementUpdatePolicyApiResponse,
        SystemFeeManagementUpdatePolicyApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/update-policy/${queryArg.id}`,
          method: 'PUT',
          body: queryArg.updateSystemFeeManagementDto
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
    }),
    systemFeeManagementRemove: build.mutation<
        SystemFeeManagementRemovePolicyApiResponse,
        SystemFeeManagementRemovePolicyApiArg
      >({
        query: (queryArg) => ({
          url: `/system-fee-management/${queryArg.id}`,
          method: 'DELETE'
        }),
        transformResponse: fnTransformResponse,
        invalidatesTags: ['[Admin] Admin System fee management']
    }),
    createDirectDeposit: build.mutation({
      query: (payload) => ({
        url: '/system-fee-management/direct-deposit',
        method: 'POST',
        body: payload
      })
    }),
    updateDirectDeposit: build.mutation({
      query: ({ id, data }) => ({
        url: '/system-fee-management/update-direct-deposit/' + id,
        method: 'PUT',
        body: {...data}
      })
    }),
    deleteDirectDeposit: build.query({
      query: (id) => ({
        url: '/system-fee-management/' + id,
        method: 'DELETE'
      })
    }),
    getDetailPolicy: build.query({
      query: (id) => ({
        url: '/system-fee-management/' + id,
        method: 'GET'
      }),
      transformResponse: (res: ResponseType<IPolicyTable>) => res.data
    })
  })
})

export const {
  useCreateDirectDepositMutation,
  useSystemFeeManagementCreatePolicyMutation,
  useSystemFeeManagementUpdatePolicyMutation,
  useLazyDeleteDirectDepositQuery,
  useGetListDirectDepositQuery,
  useGetListHistoryQuery,
  useUpdateDirectDepositMutation,
  useLazyGetDetailPolicyQuery
} = apiDirectDeposit
