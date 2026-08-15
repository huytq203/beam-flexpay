import type { ApplicableFeeRuleExportQuery } from '@/app/schemas/applicable-fee-rule.schema'
import {
  fetchBaseQueryFee,
  fetchBaseQueryWalletCore
} from '@configs/fetchBaseQueryCustom'
import type {
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query'
import { apiFeeService, apiWalletCore } from '@services/apiService'
import { parseFilenameFromDisposition } from '@utils/file-download'

export interface ExportedFile {
  blob: Blob
  /** Tên backend đặt; `null` khi header không có hoặc bị CORS chặn. */
  filename: string | null
}

export interface ExportBankLinksQuery {
  walletAccountId: string
}

export interface ExportTransactionsQuery {
  ownerId: string
  type?: string
  status?: string
  transactionCode?: string
  fromDate?: string
  toDate?: string
}

export interface ExportFreezesQuery {
  accountId: string
  type?: string
  status?: string
  fromDate?: string
  toDate?: string
}

type ExportBaseQuery = typeof fetchBaseQueryWalletCore
type ExportQueryApi = Parameters<ExportBaseQuery>[1]
type ExportExtraOptions = Parameters<ExportBaseQuery>[2]

/** Chuyển body lỗi binary thành object để middleware đọc được message/detail. */
const toApiError = async (
  error: FetchBaseQueryError
): Promise<FetchBaseQueryError> => {
  if (typeof error.status !== 'number') return error
  if (!(error.data instanceof Blob)) return error

  const rawBody = await error.data.text()
  try {
    const data: unknown = JSON.parse(rawBody)
    return { status: error.status, data }
  } catch {
    return {
      status: error.status,
      data: rawBody ? { message: rawBody } : undefined
    }
  }
}

const runExport = async (
  baseQuery: ExportBaseQuery,
  args: { url: string; params?: Record<string, unknown> },
  queryApi: ExportQueryApi,
  extraOptions: ExportExtraOptions
): Promise<{ data: ExportedFile } | { error: FetchBaseQueryError }> => {
  const response = await baseQuery(
    { ...args, method: 'GET', responseHandler: (res) => res.blob() },
    queryApi,
    extraOptions
  )

  if (response.error) return { error: await toApiError(response.error) }

  const meta = response.meta as FetchBaseQueryMeta | undefined

  return {
    data: {
      blob: response.data as Blob,
      filename: parseFilenameFromDisposition(
        meta?.response?.headers.get('content-disposition') ?? null
      )
    }
  }
}

export const apiExportWalletCsv = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    exportBankLinks: build.mutation<ExportedFile, ExportBankLinksQuery>({
      queryFn: ({ walletAccountId }, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: `/wallet/accounts/${walletAccountId}/bank-links/export` },
          queryApi,
          extraOptions
        )
    }),
    exportTransactions: build.mutation<ExportedFile, ExportTransactionsQuery>({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: '/wallet/transactions/export', params: { ...params } },
          queryApi,
          extraOptions
        )
    }),
    exportFreezes: build.mutation<ExportedFile, ExportFreezesQuery>({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: '/wallet/freezes/export', params: { ...params } },
          queryApi,
          extraOptions
        )
    })
  })
})

export const apiExportFeeCsv = apiFeeService.injectEndpoints({
  endpoints: (build) => ({
    exportApplicableFeeRules: build.mutation<
      ExportedFile,
      ApplicableFeeRuleExportQuery
    >({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryFee,
          { url: '/fee/applicable-rules/export', params },
          queryApi,
          extraOptions
        )
    })
  })
})

export const {
  useExportBankLinksMutation,
  useExportTransactionsMutation,
  useExportFreezesMutation
} = apiExportWalletCsv

export const { useExportApplicableFeeRulesMutation } = apiExportFeeCsv
