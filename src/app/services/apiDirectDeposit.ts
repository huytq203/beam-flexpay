import { ResponseType } from '@type/api'
import { HistoryPolicyInterface, IPolicy, IPolicyResponse, IPolicyTable } from '@type/policyManagement'
import { apiService } from './apiService'

export const apiDirectDeposit = apiService.injectEndpoints({
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
  useLazyDeleteDirectDepositQuery,
  useGetListDirectDepositQuery,
  useGetListHistoryQuery,
  useUpdateDirectDepositMutation,
  useLazyGetDetailPolicyQuery
} = apiDirectDeposit
