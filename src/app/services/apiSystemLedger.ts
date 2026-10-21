import { apiWalletCore } from '@services/apiService'
import type { ResponseType } from '@type/api'
import type {
  FormSearchValues,
  LedgerEntry,
  LedgerPage,
  LedgerResponse
} from '@type/systemLedger'

export interface LedgerEntriesParams extends FormSearchValues {
  page: number
  size: number
  /** Xin kèm khối `summary` (tổng bút toán, tổng Nợ, tổng Có) theo đúng bộ lọc. */
  includeSummary?: boolean
}

export const apiSystemLedger = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    getLedgerEntries: build.query<LedgerPage, LedgerEntriesParams>({
      query: (params) => ({
        url: '/wallet/entries',
        params,
        method: 'GET'
      }),
      providesTags: [{ type: 'ledgerEntries', id: 'LIST' }],
      transformResponse: (res: LedgerResponse) => res.data
    }),
    getLedgerEntryById: build.query<LedgerEntry, string>({
      query: (id) => ({
        url: `/wallet/entries/${encodeURIComponent(id)}`,
        method: 'GET'
      }),
      providesTags: (_result, _error, id) => [{ type: 'ledgerEntries', id }],
      transformResponse: (res: ResponseType<LedgerEntry>) => res.data
    })
  })
})

export const { useGetLedgerEntriesQuery, useGetLedgerEntryByIdQuery } =
  apiSystemLedger
