import { apiWalletCore } from "@services/apiService";
import { ResponseType } from "@type/api";
import { LedgerResponse, LedgerEntry } from "../types/SystemLedger.type";

export const apiSystemLedger = apiWalletCore.injectEndpoints({
    endpoints: (build) => ({
        getLedgerEntries: build.query({
            query: (params) => ({
                url: `/wallet/entries`,
                params: params,
                method: 'GET'
            }),
            providesTags: ['ledgerEntries'],
            transformResponse: (res: LedgerResponse) => res.data
        }),
        getLedgerEntryById: build.query({
            query: (id) => ({
                url: `/wallet/entries/${id}`,
                method: 'GET'
            }),
            providesTags: ['ledgerEntries'],
            transformResponse: (res: ResponseType<LedgerEntry>) => res.data
        })
    })
})

export const {
    useGetLedgerEntriesQuery,
    useLazyGetLedgerEntriesQuery,
    useGetLedgerEntryByIdQuery
} = apiSystemLedger
