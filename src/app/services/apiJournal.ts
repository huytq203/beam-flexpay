import { apiWalletCore } from "@services/apiService"
import { DataUnifiedJournal, UnifiedContentJournal } from "@type/apiResponseJournal"

export const apiJournal = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
      getUnified: build.query<DataUnifiedJournal, object>({
        query: (params) => ({
          url: `/wallet/journal/unified`,
          params: params,
          method: 'GET'
        }),
        transformResponse: (res: { data: DataUnifiedJournal }) => res.data,
        providesTags: ['Journal'],
      }),
      getUnifiedById: build.query<UnifiedContentJournal, string | undefined>({
        query: (id) => ({
          url: `/wallet/journal/unified/${id}`,
          method: 'GET'
        }),
        transformResponse: (res: { data: UnifiedContentJournal }) => res.data,
        providesTags: ['Journal'],
      }),
    })
})
export const {
  useGetUnifiedQuery,
  useGetUnifiedByIdQuery,
} = apiJournal
