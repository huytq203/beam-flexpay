import { apiService } from './apiService'

const freezeAndUnfreezeAccountApi = apiService.injectEndpoints({
  endpoints: (builder) => ({
    freezeAccountMutation: builder.mutation({
      query: (params) => ({
        url: `/freeze-balance-history`,
        method: 'POST',
        body: params
      })
    }),
    unFreezeAccountMutation: builder.mutation({
      query: (params) => ({
        url: `/freeze-balance-history/open-freeze-balance`,
        method: 'POST',
        body: params
      })
    })
  })
})

export const {
  useFreezeAccountMutationMutation,
  useUnFreezeAccountMutationMutation
} = freezeAndUnfreezeAccountApi
