import { apiMerchant } from './apiService'
import type { MerchantEnvelope, MerchantPage } from '@type/merchant'

export interface BankAccountDto {
  id: string
  version?: number
  merchantId?: string
  subMerchantId?: string
  level: 'SYSTEM_DEFAULT' | 'MASTER' | 'SUB' | 'TERMINAL'
  bankCode: string
  accountNumber: string
  accountName: string
  branchName?: string
  isDefault: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'VERIFIED'
  linkStatus: 'PENDING_VERIFICATION' | 'LINKED' | 'LINK_FAILED'
  holdMode?: boolean
  payable?: boolean
  createdAt?: string
  updatedAt?: string
}

export interface BankAccountQuery {
  page: number
  size: number
  merchantId?: string
  subMerchantId?: string
  level?: BankAccountDto['level']
  status?: BankAccountDto['status']
  linkStatus?: BankAccountDto['linkStatus']
  query?: string
}

export interface BankAccountCreate {
  merchantId?: string
  subMerchantId?: string
  bankCode: string
  accountNumber: string
  accountName: string
  branchName?: string
  isDefault?: boolean
  otp: SensitiveOtpConfirmation
}

export type SensitiveOperation = 'BANK_ACCOUNT_CHANGE' | 'MERCHANT_TERMINATION'

export interface SensitiveOtpConfirmation {
  otpSessionId: string
  otp: string
}

export interface SensitiveOtpChallenge {
  otpSessionId: string
  maskedRecipient: string
  expiresInSeconds: number
  canResendAfterSeconds: number
}

export interface BankAccountUpdate {
  version?: number
  bankCode?: string
  accountNumber?: string
  accountName?: string
  branchName?: string
  status?: BankAccountDto['status']
  reason?: string
  otp?: SensitiveOtpConfirmation
}

export interface BankAccountUpdateResult {
  account: BankAccountDto
  applied: boolean
  /** Chỉ có giá trị khi thao tác là khóa tài khoản. */
  inFlightWithdrawalCount?: number | null
}

const service = apiMerchant.injectEndpoints({ endpoints: (builder) => ({
  challengeBankAccountOtp: builder.mutation<SensitiveOtpChallenge, { targetId?: string; operation?: SensitiveOperation }>({
    query: ({ targetId, operation = 'BANK_ACCOUNT_CHANGE' }) => ({ url: '/sensitive-operations/otp-challenge', method: 'POST', body: { operation, targetId } }),
    extraOptions: { suppressErrorNotification: true },
    transformResponse: (response: MerchantEnvelope<SensitiveOtpChallenge>) => response.data
  }),
  listBankAccounts: builder.query<MerchantPage<BankAccountDto>, BankAccountQuery>({
    query: (params) => ({ url: '/merchant-bank-accounts', params }),
    transformResponse: (response: MerchantEnvelope<MerchantPage<BankAccountDto>>) => response.data,
    providesTags: ['merchant']
  }),
  createBankAccount: builder.mutation<BankAccountDto, BankAccountCreate>({
    query: (body) => ({ url: '/merchant-bank-accounts', method: 'POST', body }),
    transformResponse: (response: MerchantEnvelope<BankAccountDto>) => response.data,
    invalidatesTags: ['merchant']
  }),
  updateBankAccount: builder.mutation<BankAccountUpdateResult, { id: string; body: BankAccountUpdate }>({
    query: ({ id, body }) => ({ url: `/merchant-bank-accounts/${id}`, method: 'PUT', body }),
    transformResponse: (response: MerchantEnvelope<{ account: BankAccountDto; applied: boolean }>) => response.data,
    invalidatesTags: ['merchant']
  }),
  makeBankAccountDefault: builder.mutation<{ account: BankAccountDto; applied: boolean }, { id: string; reason: string; otp: SensitiveOtpConfirmation }>({
    query: ({ id, reason, otp }) => ({ url: `/merchant-bank-accounts/${id}/default`, method: 'PUT', body: { reason, otp } }),
    transformResponse: (response: MerchantEnvelope<{ account: BankAccountDto; applied: boolean }>) => response.data,
    invalidatesTags: ['merchant']
  }),
  verifyBankAccountLink: builder.mutation<BankAccountDto, { id: string; linked: boolean; reason?: string; failureReason?: string }>({
    query: ({ id, ...params }) => ({ url: `/merchant-bank-accounts/${id}/link-verification`, method: 'POST', params }),
    extraOptions: { suppressErrorNotification: true },
    transformResponse: (response: MerchantEnvelope<BankAccountDto>) => response.data,
    invalidatesTags: ['merchant']
  }),
  setBankAccountHoldMode: builder.mutation<BankAccountDto, { id: string; enabled: boolean; reason: string }>({
    query: ({ id, ...body }) => ({ url: `/merchant-bank-accounts/${id}/hold-mode`, method: 'POST', body }),
    transformResponse: (response: MerchantEnvelope<BankAccountDto>) => response.data,
    invalidatesTags: ['merchant']
  })
}) })

export const { useChallengeBankAccountOtpMutation, useListBankAccountsQuery, useCreateBankAccountMutation, useUpdateBankAccountMutation, useMakeBankAccountDefaultMutation, useSetBankAccountHoldModeMutation, useVerifyBankAccountLinkMutation } = service
