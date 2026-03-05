import { apiWalletCore } from "@services/apiService"
import { ContentJournal, DataJournal, DataUnifiedJournal, UnifiedContentJournal } from "@type/apiResponseJournal"

export const apiJournal = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
      getJournal: build.query<DataJournal, object>({
        query: (params) => ({
          url: `/wallet/journal`,
          params: params,
          method: 'GET'
        }),
        transformResponse: (res: { data: DataJournal }) => res.data,
        providesTags: ['Journal'],
      }),
      getUnified: build.query<DataUnifiedJournal, object>({
        query: (params) => ({
          url: `/wallet/journal/unified`,
          params: params,
          method: 'GET'
        }),
        transformResponse: (res: { data: DataUnifiedJournal }) => res.data,
        providesTags: ['Journal'],
      }),
      getJournalById: build.query<ContentJournal, string | undefined>({
        query: (id) => ({
          url: `/wallet/journal/${id}`,
          method: 'GET'
        }),
        transformResponse: (res: { data: ContentJournal }) => res.data,
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
  useGetJournalQuery,
  useGetUnifiedQuery,
  useGetJournalByIdQuery,
  useGetUnifiedByIdQuery,
} = apiJournal
