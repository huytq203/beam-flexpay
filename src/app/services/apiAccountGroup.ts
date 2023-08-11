import { GroupAccountInterface, ResponseGroupData } from '@type/accountGroup'
import { ResponseType } from '@type/api'
import { apiService } from './apiService'

export const accountGroup = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getListGroup: builder.query({
      query: (payload) => ({
        url: '/account-group',
        method: 'GET',
        params: payload
      }),
      transformResponse: (res: ResponseType<ResponseGroupData>) => res.data
    }),
    createAccountGroup: builder.mutation({
      query: (payload) => ({
        url: '/account-group',
        method: 'POST',
        body: payload
      })
    }),
    updateAccountGroup: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: `/account-group/${id}`,
        method: 'PATCH',
        body: payload
      })
    }),
    deleteAccountGroup: builder.query({
      query: (id) => ({
        url: `/account-group/${id}`,
        method: 'DELETE'
      }),
      transformResponse: (res: ResponseType<any>) => res.statusCode
    }),
    getDetailAccountGroup: builder.query({
      query: (id) => ({
        url: `/account-group/${id}`,
        method: 'GET'
      }),
      transformResponse: (res: ResponseType<GroupAccountInterface>) => res.data
    })
  })
})

export const {
  useCreateAccountGroupMutation,
  useGetListGroupQuery,
  useUpdateAccountGroupMutation,
  useLazyDeleteAccountGroupQuery,
  useLazyGetDetailAccountGroupQuery,
  useLazyGetListGroupQuery
} = accountGroup
