import { apiService } from './apiService'

export const accountingService = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getAccounting: builder.query({
      query: (payload) => ({
        url: `/accounting`,
        method: 'GET',
        params: payload
      }),
      transformErrorResponse: (res) => res.data,
      providesTags: ['accounting']
    }),
    createAccounting: builder.mutation({
      query: (payload) => ({
        url: `/accounting`,
        method: 'POST',
        body: payload
      }),
      invalidatesTags: ['accounting']
    }),
    updateActive: builder.mutation({
      query: ({ id, active }) => ({
        url: `/accounting/${id}`,
        method: 'PUT',
        body: { active }
      }),
      invalidatesTags: ['accounting']
    })
  })
})

export const {
  useGetAccountingQuery,
  useCreateAccountingMutation,
  useUpdateActiveMutation
} = accountingService
