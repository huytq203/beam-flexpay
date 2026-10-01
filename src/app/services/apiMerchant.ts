import { apiMerchant } from './apiService'
import type {
  ContentMerchant,
  CreateMerchantPayload,
  DataMerchant,
  MerchantEnvelope,
  MerchantPage,
  MerchantSearchParams,
  SelectableWallet,
  UpdateMerchantPayload
} from '@type/merchant'

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
    exportMerchants: builder.mutation<Blob, MerchantSearchParams>({
      query: (params) => ({
        url: '/merchants/export',
        params,
        responseHandler: (response: Response) => response.blob()
      })
    }),
    getSelectableWallets: builder.query<
      MerchantPage<SelectableWallet>,
      { query?: string; page?: number; size?: number }
    >({
      query: (params) => ({ url: '/merchants/selectable-wallets', params }),
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
    getMerchantDocumentUrl: builder.query<
      { url: string; contentType: string; originalFilename: string },
      { merchantId: string; documentId: string }
    >({
      query: ({ merchantId, documentId }) => ({
        url: `/merchants/${merchantId}/documents/${documentId}/url`,
        params: { disposition: 'INLINE' }
      }),
      transformResponse: (
        response: MerchantEnvelope<{
          url: string
          contentType: string
          originalFilename: string
        }>
      ) => response.data
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
    approveMerchant: builder.mutation<ContentMerchant, string>({
      query: (id) => ({ url: `/merchants/${id}/approve`, method: 'POST' }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    rejectMerchant: builder.mutation<
      ContentMerchant,
      {
        id: string
        detail: string
        reasonCode?:
          | 'BLURRED_IMAGE'
          | 'INCORRECT_INFORMATION'
          | 'MISSING_DOCUMENT'
          | 'OTHER'
      }
    >({
      query: ({ id, ...body }) => ({
        url: `/merchants/${id}/reject`,
        method: 'POST',
        body
      }),
      transformResponse: (response: MerchantEnvelope<ContentMerchant>) =>
        response.data,
      invalidatesTags: ['merchant']
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
  useLazyGetMerchantDocumentUrlQuery,
  usePostMerchantMutation,
  usePutMerchantMutation,
  useGetMerchantByIdQuery,
  useLazyGetMerchantByIdQuery,
  useSubmitMerchantMutation,
  useApproveMerchantMutation,
  useRejectMerchantMutation,
  useSetMerchantLockedMutation
} = merchantService
