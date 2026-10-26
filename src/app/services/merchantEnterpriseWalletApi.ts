import { apiMerchant } from './apiService'
import type { MerchantEnvelope, MerchantPage } from '@type/merchant'

export interface EnterpriseWalletDto {
  id: string
  registeredEmail: string
  verificationStatus: 'DRAFT' | 'PENDING_APPROVAL' | 'VERIFIED' | 'REJECTED'
  bankLinkStatus?: 'BANK_UNLINKED' | 'BANK_LINKED'
  legalName?: string
  taxCode?: string
  businessType?: 'ENTERPRISE' | 'HOUSEHOLD'
  headOfficeAddress?: string
  legalRepresentativeName?: string
  legalRepresentativeIdNumber?: string
  managerName?: string
  managerTitle?: string
  managerIdNumber?: string
  managerIdExpiryDate?: string
  otpPhone?: string
  businessLicense?: EnterpriseWalletDocument
  idCardFront?: EnterpriseWalletDocument
  idCardBack?: EnterpriseWalletDocument
  authorizationLetter?: EnterpriseWalletDocument
  internalWallet?: boolean
  kybRejectedReason?: string | null
  kybRejectedAt?: string | null
  kybRejectedBy?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface EnterpriseWalletDocument {
  id?: string
  filename?: string
  contentType?: string
  sizeBytes?: number
  url?: string | null
  urlExpiresAt?: string | null
}

export interface EnterpriseWalletQuery {
  page: number
  size: number
  query?: string
  taxCode?: string
  verificationStatus?: EnterpriseWalletDto['verificationStatus']
  bankLinkStatus?: EnterpriseWalletDto['bankLinkStatus']
  internalWallet?: boolean
}

export interface EnterpriseWalletPayload {
  registeredEmail?: string
  legalName?: string
  taxCode?: string
  businessType?: 'ENTERPRISE' | 'HOUSEHOLD'
  headOfficeAddress?: string
  legalRepresentativeName?: string
  legalRepresentativeIdNumber?: string
  managerName?: string
  managerTitle?: string
  managerIdNumber?: string
  managerIdExpiryDate?: string
  businessLicenseStagingId?: string
  idCardFrontStagingId?: string
  idCardBackStagingId?: string
  authorizationLetterStagingId?: string
  internalWallet?: boolean
  adminPassword?: string
}

export interface EnterpriseWalletRejectPayload {
  id: string
  reason: string
}

export const merchantEnterpriseWalletService = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    listEnterpriseWallets: builder.query<
      MerchantPage<EnterpriseWalletDto>,
      EnterpriseWalletQuery
    >({
      query: (params) => ({ url: '/enterprise-wallets', params }),
      transformResponse: (
        response: MerchantEnvelope<MerchantPage<EnterpriseWalletDto>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    getEnterpriseWallet: builder.query<EnterpriseWalletDto, string>({
      query: (id) => `/enterprise-wallets/${id}`,
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      providesTags: ['merchant']
    }),
    createEnterpriseWallet: builder.mutation<
      EnterpriseWalletDto,
      EnterpriseWalletPayload
    >({
      query: (body) => ({ url: '/enterprise-wallets', method: 'POST', body }),
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    saveEnterpriseWalletDraft: builder.mutation<
      EnterpriseWalletDto,
      EnterpriseWalletPayload
    >({
      query: (body) => ({
        url: '/enterprise-wallets/drafts',
        method: 'POST',
        body
      }),
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    submitEnterpriseWallet: builder.mutation<EnterpriseWalletDto, string>({
      query: (id) => ({
        url: `/enterprise-wallets/${id}/submit`,
        method: 'POST'
      }),
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    updateEnterpriseWallet: builder.mutation<
      EnterpriseWalletDto,
      { id: string; body: EnterpriseWalletPayload }
    >({
      query: ({ id, body }) => ({
        url: `/enterprise-wallets/${id}`,
        method: 'PUT',
        body
      }),
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    approveEnterpriseWallet: builder.mutation<EnterpriseWalletDto, string>({
      query: (id) => ({
        url: `/enterprise-wallets/${id}/approve`,
        method: 'POST'
      }),
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    rejectEnterpriseWallet: builder.mutation<
      EnterpriseWalletDto,
      EnterpriseWalletRejectPayload
    >({
      query: ({ id, reason }) => ({
        url: `/enterprise-wallets/${id}/reject`,
        method: 'POST',
        body: { reason }
      }),
      transformResponse: (response: MerchantEnvelope<EnterpriseWalletDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useListEnterpriseWalletsQuery,
  useGetEnterpriseWalletQuery,
  useCreateEnterpriseWalletMutation,
  useSaveEnterpriseWalletDraftMutation,
  useSubmitEnterpriseWalletMutation,
  useUpdateEnterpriseWalletMutation,
  useApproveEnterpriseWalletMutation,
  useRejectEnterpriseWalletMutation
} = merchantEnterpriseWalletService
