import type { ApplicableFeeRuleExportQuery } from '@/app/schemas/applicable-fee-rule.schema'
import {
  fetchBaseQueryCustom,
  fetchBaseQueryFee,
  fetchBaseQueryMerchant,
  fetchBaseQueryWalletCore
} from '@configs/fetchBaseQueryCustom'
import type {
  FetchBaseQueryError,
  FetchBaseQueryMeta
} from '@reduxjs/toolkit/query'
import {
  apiFeeService,
  apiMerchant,
  apiWalletCore,
  authApiService
} from '@services/apiService'
import type { NotificationListQuery } from '@services/merchantNotificationApi'
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
  /** Bỏ trống khi xuất từ màn danh sách giao dịch toàn hệ thống. */
  ownerId?: string
  /** Lọc giao dịch khi party là initiator hoặc counterparty. */
  partyId?: string
  type?: string
  status?: string
  transactionCode?: string
  fromDate?: string
  toDate?: string
  /** Thời gian giao dịch chuyển sang thành công — khác `fromDate`/`toDate`. */
  successFrom?: string
  successTo?: string
  senderUsername?: string
  receiverUsername?: string
  counterpartyUsername?: string
  sourceDomain?: string
  paymentMethod?: string
  bankCode?: string
  /**
   * Khớp CHỨA, không phân biệt hoa thường, trên mã giao dịch · mã bút toán ·
   * username người khởi tạo · username đối tác. Khác `transactionCode` và
   * `journalCode` — hai cái đó khớp BẰNG.
   */
  keyword?: string
}

/**
 * Sổ cái kép: mỗi giao dịch nở ra ít nhất hai dòng Nợ/Có. Chỉ có dòng của bút
 * toán đã hạch toán thành công, nên không có tham số lọc trạng thái.
 */
export interface ExportLedgerEntriesQuery {
  /** Bỏ trống là xuất sổ cái mọi ví; màn xem theo ví phải tự truyền. */
  accountId?: string
  ownerUsername?: string
  ownerType?: string
  glCode?: string
  direction?: string
  /** Nhận cả mã giao dịch lẫn UUID của transaction. */
  transactionCode?: string
  /** Mã bút toán của dòng sổ cái. */
  journalCode?: string
  /** Bộ mã dùng chung với màn Quản lý giao dịch: `CASH_IN`, `CASH_OUT`. */
  transactionType?: string
  minAmount?: number
  maxAmount?: number
  keyword?: string
  fromDate?: string
  toDate?: string
}

/** Bộ lọc giống hệt `GET /wallet/freezes`, chỉ bỏ pageable — file lấy trọn bộ lọc. */
export interface ExportFreezesQuery {
  /** Bỏ trống khi xuất từ màn danh sách toàn hệ thống; màn theo ví phải tự truyền. */
  accountId?: string
  type?: string
  status?: string
  displayStatus?: string
  releaseType?: string
  username?: string
  sourceTransactionCode?: string
  sourceTransactionId?: string
  shortfall?: boolean
  includeTopUps?: boolean
  fromDate?: string
  toDate?: string
}

export interface ExportVerifiedKycProfilesQuery {
  keyword?: string
  status?: string
  createdFrom?: string
  createdTo?: string
}

/** Bộ lọc của màn danh sách chính sách phí; file tự bung bản gán, component và tier. */
export interface ExportFeePoliciesQuery {
  keyword?: string
  feeDomain?: string
  feeScope?: string
  serviceType?: string
  status?: string
  effectiveStatus?: string
  appliedTarget?: string
  subjectKeyword?: string
  bankCode?: string
  paymentMethod?: string
  validFrom?: string
  validTo?: string
  createdAtFrom?: string
  createdAtTo?: string
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
    }),
    exportLedgerEntries: build.mutation<ExportedFile, ExportLedgerEntriesQuery>({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryWalletCore,
          { url: '/wallet/entries/export', params: { ...params } },
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
    }),
    exportFeePolicies: build.mutation<ExportedFile, ExportFeePoliciesQuery>({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryFee,
          { url: '/fee/policies/export', params: { ...params } },
          queryApi,
          extraOptions
        )
    })
  })
})

export const apiExportIdentityCsv = authApiService.injectEndpoints({
  endpoints: (build) => ({
    exportVerifiedKycProfiles: build.mutation<
      ExportedFile,
      ExportVerifiedKycProfilesQuery
    >({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryCustom,
          { url: '/verified-kyc-profiles/export', params: { ...params } },
          queryApi,
          extraOptions
        )
    })
  })
})

// Cấu hình thông báo Merchant: BE từ chối quá 50.000 dòng và không cắt bớt.
export const apiExportMerchantCsv = apiMerchant.injectEndpoints({
  endpoints: (build) => ({
    exportMerchantNotifications: build.mutation<
      ExportedFile,
      Omit<NotificationListQuery, 'page' | 'size'>
    >({
      queryFn: (params, queryApi, extraOptions) =>
        runExport(
          fetchBaseQueryMerchant,
          { url: '/merchants/notifications/export', params: { ...params } },
          queryApi,
          extraOptions
        )
    })
  })
})

export const { useExportMerchantNotificationsMutation } = apiExportMerchantCsv

export const {
  useExportBankLinksMutation,
  useExportTransactionsMutation,
  useExportFreezesMutation,
  useExportLedgerEntriesMutation
} = apiExportWalletCsv

export const {
  useExportApplicableFeeRulesMutation,
  useExportFeePoliciesMutation
} = apiExportFeeCsv

export const { useExportVerifiedKycProfilesMutation } = apiExportIdentityCsv
