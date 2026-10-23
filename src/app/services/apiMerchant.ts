import { apiMerchant } from './apiService'
import type { ExportedFile } from './apiExportCsv'
import { parseFilenameFromDisposition } from '@utils/file-download'
import type { FetchBaseQueryMeta } from '@reduxjs/toolkit/query'
import type {
  ContentMerchant,
  CreateMerchantPayload,
  DataMerchant,
  MerchantAuditLog,
  MerchantEnvelope,
  MerchantHistoryParams,
  MerchantPage,
  MerchantRejectionReason,
  MerchantSearchParams,
  MerchantStatusHistoryItem,
  RejectMerchantBody,
  SelectableWallet,
  TerminationObligation,
  TerminationResult,
  UpdateMerchantPayload
} from '@type/merchant'
import type { SensitiveOtpConfirmation } from './merchantBankAccountApi'

/** Màn tự hiển thị lỗi (inline hoặc toast từ `detail`), tắt toast tập trung. */
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const

export const createMerchantDocumentBody = (
  file: File,
  documentType: string
): FormData => {
  const body = new FormData()
  body.append('file', file)
  body.append('documentType', documentType)
  return body
}

export const merchantService = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    getMerchant: builder.query<DataMerchant, MerchantSearchParams>({
      query: (params) => ({ url: '/merchants', params }),
      transformResponse: (response: MerchantEnvelope<DataMerchant>) =>
        response.data,
      providesTags: ['merchant']
    }),
    exportMerchants: builder.mutation<ExportedFile, MerchantSearchParams>({
      async queryFn(params, _api, _extraOptions, baseQuery) {
        const response = await baseQuery({
          url: '/merchants/export',
          params,
          responseHandler: (result: Response) => result.blob()
        })
        if (response.error) return { error: response.error }

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
    }),
    getSelectableWallets: builder.query<
      MerchantPage<SelectableWallet>,
      { query?: string; page?: number; size?: number }
    >({
      query: (params) => ({ url: '/merchants/selectable-wallets', params }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (
        response: MerchantEnvelope<MerchantPage<SelectableWallet>>
      ) => response.data
    }),
    uploadMerchantDocument: builder.mutation<
      { stagingId: string },
      {
        file: File
        documentType:
          | 'BUSINESS_LICENSE'
          | 'ID_CARD_FRONT'
          | 'ID_CARD_BACK'
          | 'AUTHORIZATION_LETTER'
          | 'MERCHANT_CONTRACT'
          | 'MERCHANT_LOGO'
          | 'MERCHANT_PRODUCT_IMAGE'
      }
    >({
      query: ({ file, documentType }) => {
        return {
          url: '/documents',
          method: 'POST',
          body: createMerchantDocumentBody(file, documentType)
        }
      },
      transformResponse: (response: MerchantEnvelope<{ stagingId: string }>) =>
        response.data
    }),
    postMerchant: builder.mutation<ContentMerchant, CreateMerchantPayload>({
      query: (body) => ({ url: '/merchants', method: 'POST', body }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    putMerchant: builder.mutation<
      ContentMerchant,
      { id: string; payload: UpdateMerchantPayload }
    >({
      query: ({ id, payload }) => ({
        url: `/merchants/${id}`,
        method: 'PUT',
        body: payload
      }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    getMerchantById: builder.query<ContentMerchant, string>({
      query: (id) => `/merchants/${id}`,
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      providesTags: ['merchant']
    }),
    submitMerchant: builder.mutation<ContentMerchant, string>({
      query: (id) => ({ url: `/merchants/${id}/submit`, method: 'POST' }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    terminateMerchant: builder.mutation<
      TerminationResult,
      {
        id: string
        body: {
          reason: string
          confirmation: string
          otp: SensitiveOtpConfirmation
        }
      }
    >({
      query: ({ id, body }) => ({
        url: `/merchants/${id}/terminate`,
        method: 'POST',
        body
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (response: MerchantEnvelope<TerminationResult>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    approveMerchant: builder.mutation<ContentMerchant, string>({
      query: (id) => ({ url: `/merchants/${id}/approve`, method: 'POST' }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    rejectMerchant: builder.mutation<
      ContentMerchant,
      { id: string } & RejectMerchantBody
    >({
      query: ({ id, reasonCode, detail }) => ({
        url: `/merchants/${id}/reject`,
        method: 'POST',
        body: reasonCode ? { reasonCode, detail } : { detail }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    getMerchantRejectionReasons: builder.query<MerchantRejectionReason[], void>(
      {
        query: () => '/merchants/rejection-reasons',
        extraOptions: OWN_ERROR_HANDLING,
        transformResponse: (
          response: MerchantEnvelope<MerchantRejectionReason[]>
        ) => response.data ?? []
      }
    ),
    getMerchantStatusHistory: builder.query<
      MerchantPage<MerchantStatusHistoryItem>,
      MerchantHistoryParams
    >({
      // BE luôn sắp occurredAt DESC, bỏ qua sortBy/sortDirection.
      query: ({ id, page, size }) => ({
        url: `/merchants/${id}/status-history`,
        params: { page, size }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (
        response: MerchantEnvelope<MerchantPage<MerchantStatusHistoryItem>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    getMerchantAuditLogs: builder.query<
      MerchantPage<MerchantAuditLog>,
      MerchantHistoryParams
    >({
      // Bắt buộc sortBy=occurredAt: mặc định createdAt không có trên AuditLog -> 400.
      query: ({ id, page, size }) => ({
        url: `/merchants/${id}/audit-logs`,
        params: { page, size, sortBy: 'occurredAt', sortDirection: 'DESC' }
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (
        response: MerchantEnvelope<MerchantPage<MerchantAuditLog>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    getTerminationObligations: builder.query<TerminationObligation[], string>({
      query: (id) => `/merchants/${id}/termination-obligations`,
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: (
        response: MerchantEnvelope<TerminationObligation[]>
      ) => response.data ?? []
    }),
    setMerchantLocked: builder.mutation<
      ContentMerchant,
      { id: string; lock: boolean; reason: string }
    >({
      query: ({ id, lock, reason }) => ({
        url: `/merchants/${id}/${lock ? 'lock' : 'unlock'}`,
        method: 'POST',
        body: { reason }
      }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useGetMerchantQuery,
  useExportMerchantsMutation,
  useGetSelectableWalletsQuery,
  useUploadMerchantDocumentMutation,
  usePostMerchantMutation,
  usePutMerchantMutation,
  useGetMerchantByIdQuery,
  useLazyGetMerchantByIdQuery,
  useSubmitMerchantMutation,
  useApproveMerchantMutation,
  useTerminateMerchantMutation,
  useRejectMerchantMutation,
  useGetMerchantRejectionReasonsQuery,
  useGetMerchantStatusHistoryQuery,
  useGetMerchantAuditLogsQuery,
  useGetTerminationObligationsQuery,
  useSetMerchantLockedMutation
} = merchantService
