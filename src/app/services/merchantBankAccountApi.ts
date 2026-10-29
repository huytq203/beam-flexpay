import { apiMerchant } from './apiService'
import type { MerchantEnvelope, MerchantPage } from '@type/merchant'

export type BankAccountChangeType = 'UPDATE_ACCOUNT' | 'SET_DEFAULT'

export interface BankAccountChangeRequest {
  id: string
  bankAccountId: string
  changeType: BankAccountChangeType
  status: 'PENDING' | 'APPROVED' | 'REJECTED'
  proposedBankCode?: string | null
  proposedAccountNumber?: string | null
  proposedAccountName?: string | null
  proposedBranchName?: string | null
  requestedBy: string
  requestReason?: string | null
  decidedBy?: string | null
  decidedAt?: string | null
  decisionReason?: string | null
  createdAt: string
}

/**
 * Dòng của hàng đợi `GET /merchant-bank-accounts/change-requests`: thêm thông
 * tin Merchant/Sub và giá trị hiện tại để so với `proposed*`.
 */
export interface BankAccountChangeRequestItem extends BankAccountChangeRequest {
  /** Trùng `id`. */
  changeRequestId: string
  merchantId?: string | null
  merchantName?: string | null
  subMerchantId?: string | null
  subMerchantName?: string | null
  currentBankCode?: string | null
  /** BE đã mask. */
  currentAccountNumber?: string | null
  currentAccountName?: string | null
  /** Tên đăng nhập lúc tạo yêu cầu, không phải họ tên. */
  requestedByName?: string | null
  /** Trùng `createdAt`. */
  requestedAt?: string | null
}

export type BankAccountChangeRequestStatus = BankAccountChangeRequest['status']

/** `status` bỏ trống thì BE trả PENDING; `requestedBy` là UUID người đề xuất. */
export interface BankAccountChangeRequestQuery {
  page: number
  size: number
  status?: BankAccountChangeRequestStatus
  requestedBy?: string
}

export interface BankAccountDto {
  id: string
  version?: number
  merchantId?: string
  subMerchantId?: string
  level: 'SYSTEM_DEFAULT' | 'MASTER' | 'SUB' | 'TERMINAL'
  /** Master sở hữu cây chứa tài khoản (kể cả khi tài khoản thuộc Sub). */
  owningMerchantId?: string
  bankCode: string
  accountNumber: string
  accountName: string
  branchName?: string
  isDefault: boolean
  /** Master được phép tên chủ tài khoản khác tên pháp nhân. */
  holderNameExempt?: boolean
  status: 'ACTIVE' | 'INACTIVE' | 'VERIFIED'
  linkStatus: 'PENDING_VERIFICATION' | 'LINKED' | 'LINK_FAILED'
  linkFailureReason?: string | null
  holdMode?: boolean
  holdModeReason?: string | null
  holdModeChangedAt?: string | null
  payable?: boolean
  /** Yêu cầu đổi đang chờ duyệt của tài khoản này, nếu có. */
  pendingChangeRequest?: BankAccountChangeRequest | null
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
  /**
   * Quyết định 22/10 (FR-MER-0608-01): Admin cho phép TK Master mang tên chủ TK khác tên pháp nhân
   * đã xác thực KYB. Bỏ trống/false thì BE bắt tên phải khớp pháp nhân (lỗi 5729); TK Sub bỏ qua.
   */
  allowDifferentHolderName?: boolean
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
  /** Bật/tắt ô "dùng tên khác pháp nhân" của TK Master; bỏ trống là giữ nguyên, đổi thì cần OTP. */
  allowDifferentHolderName?: boolean
  status?: BankAccountDto['status']
  reason?: string
  otp?: SensitiveOtpConfirmation
}

export interface BankAccountUpdateResult {
  account: BankAccountDto
  applied: boolean
  /** Có giá trị khi thay đổi chưa áp dụng mà đang chờ người duyệt khác. */
  pendingChangeRequest?: BankAccountChangeRequest | null
  /** Chỉ có giá trị khi thao tác là khóa tài khoản. */
  inFlightWithdrawalCount?: number | null
}

export interface BankAccountDecision {
  changeRequestId: string
  reason?: string
}

const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    challengeBankAccountOtp: builder.mutation<
      SensitiveOtpChallenge,
      { targetId?: string; operation?: SensitiveOperation }
    >({
      query: ({ targetId, operation = 'BANK_ACCOUNT_CHANGE' }) => ({
        url: '/sensitive-operations/otp-challenge',
        method: 'POST',
        body: { operation, targetId }
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (response: MerchantEnvelope<SensitiveOtpChallenge>) =>
        response.data
    }),
    getBankAccount: builder.query<BankAccountDto, string>({
      query: (id) => `/merchant-bank-accounts/${id}`,
      transformResponse: (response: MerchantEnvelope<BankAccountDto>) =>
        response.data,
      providesTags: ['merchant']
    }),
    /** Chỉ xóa được tài khoản chưa từng dùng; response không có `data`. */
    deleteBankAccount: builder.mutation<void, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/merchant-bank-accounts/${id}`,
        method: 'DELETE',
        body: { reason }
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: () => undefined,
      invalidatesTags: ['merchant']
    }),
    listBankAccounts: builder.query<
      MerchantPage<BankAccountDto>,
      BankAccountQuery
    >({
      query: (params) => ({ url: '/merchant-bank-accounts', params }),
      transformResponse: (
        response: MerchantEnvelope<MerchantPage<BankAccountDto>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    listBankAccountChangeRequests: builder.query<
      MerchantPage<BankAccountChangeRequestItem>,
      BankAccountChangeRequestQuery
    >({
      query: (params) => ({
        url: '/merchant-bank-accounts/change-requests',
        params
      }),
      transformResponse: (
        response: MerchantEnvelope<MerchantPage<BankAccountChangeRequestItem>>
      ) => response.data,
      providesTags: ['merchant']
    }),
    createBankAccount: builder.mutation<BankAccountDto, BankAccountCreate>({
      query: (body) => ({
        url: '/merchant-bank-accounts',
        method: 'POST',
        body
      }),
      transformResponse: (response: MerchantEnvelope<BankAccountDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    updateBankAccount: builder.mutation<
      BankAccountUpdateResult,
      { id: string; body: BankAccountUpdate }
    >({
      query: ({ id, body }) => ({
        url: `/merchant-bank-accounts/${id}`,
        method: 'PUT',
        body
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (
        response: MerchantEnvelope<BankAccountUpdateResult>
      ) => response.data,
      invalidatesTags: ['merchant']
    }),
    makeBankAccountDefault: builder.mutation<
      BankAccountUpdateResult,
      { id: string; reason: string; otp: SensitiveOtpConfirmation }
    >({
      query: ({ id, reason, otp }) => ({
        url: `/merchant-bank-accounts/${id}/default`,
        method: 'PUT',
        body: { reason, otp }
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (
        response: MerchantEnvelope<BankAccountUpdateResult>
      ) => response.data,
      invalidatesTags: ['merchant']
    }),
    verifyBankAccountLink: builder.mutation<
      BankAccountDto,
      { id: string; linked: boolean; reason?: string; failureReason?: string }
    >({
      query: ({ id, ...params }) => ({
        url: `/merchant-bank-accounts/${id}/link-verification`,
        method: 'POST',
        params
      }),
      extraOptions: { suppressErrorNotification: true },
      transformResponse: (response: MerchantEnvelope<BankAccountDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    setBankAccountHoldMode: builder.mutation<
      BankAccountDto,
      { id: string; enabled: boolean; reason: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/merchant-bank-accounts/${id}/hold-mode`,
        method: 'POST',
        body
      }),
      transformResponse: (response: MerchantEnvelope<BankAccountDto>) =>
        response.data,
      invalidatesTags: ['merchant']
    }),
    approveBankAccountChange: builder.mutation<
      BankAccountChangeRequest,
      BankAccountDecision
    >({
      query: ({ changeRequestId, reason }) => ({
        url: `/merchant-bank-accounts/change-requests/${changeRequestId}/approve`,
        method: 'POST',
        body: { reason }
      }),
      transformResponse: (
        response: MerchantEnvelope<BankAccountChangeRequest>
      ) => response.data,
      invalidatesTags: ['merchant']
    }),
    rejectBankAccountChange: builder.mutation<
      BankAccountChangeRequest,
      BankAccountDecision
    >({
      query: ({ changeRequestId, reason }) => ({
        url: `/merchant-bank-accounts/change-requests/${changeRequestId}/reject`,
        method: 'POST',
        body: { reason }
      }),
      transformResponse: (
        response: MerchantEnvelope<BankAccountChangeRequest>
      ) => response.data,
      invalidatesTags: ['merchant']
    })
  })
})

export const {
  useChallengeBankAccountOtpMutation,
  useListBankAccountsQuery,
  useListBankAccountChangeRequestsQuery,
  useGetBankAccountQuery,
  useDeleteBankAccountMutation,
  useCreateBankAccountMutation,
  useUpdateBankAccountMutation,
  useMakeBankAccountDefaultMutation,
  useSetBankAccountHoldModeMutation,
  useVerifyBankAccountLinkMutation,
  useApproveBankAccountChangeMutation,
  useRejectBankAccountChangeMutation
} = service
