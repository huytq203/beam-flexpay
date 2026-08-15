import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type { ResponseType } from '@type/api'

export interface BankLink {
  id: string
  userId: string
  bankCode: string
  walletId: string
  accountName: string | null
  accountNumberMask: string | null
  cardNumberMask: string | null
  linkType: string
  isDefault: boolean | null
  status: string
  linkedAt: string | null
  unlinkedAt: string | null
}

export interface AdminUnlinkBankLinkResponse {
  userId: string
  bankCode: string
  unlinkedLinks: BankLink[]
  bankSyncStatus: 'SUCCESS' | 'FAILED' | string
  unlinkedAt: string
}

export interface GetBankLinksRequest {
  userId?: string
  bankCode?: string
  walletId?: string
  linkType?: string
  status?: string
  accountName?: string
  /** Số tài khoản đầy đủ chỉ được gửi để đối chiếu; không ghi log hoặc hiển thị. */
  accountNumber?: string
  linkedAtFrom?: string
  linkedAtTo?: string
  unlinkedAtFrom?: string
  unlinkedAtTo?: string
  page?: number
  size?: number
  sortBy?: string
  sortDirection?: 'ASC' | 'DESC'
}

interface PageSort {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}

interface Pageable {
  pageNumber: number
  pageSize: number
  sort: PageSort
  offset: number
  paged: boolean
  unpaged: boolean
}

export interface BankLinkPage {
  content: BankLink[]
  pageable: Pageable
  totalPages: number
  totalElements: number
  last: boolean
  size: number
  number: number
  sort: PageSort
  numberOfElements: number
  first: boolean
  empty: boolean
}

export const apiBankLink = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    getBankLinks: build.query<BankLinkPage, GetBankLinksRequest>({
      async queryFn(params, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          {
            url: '/bank-links',
            method: 'GET',
            params
          },
          queryApi,
          extraOptions
        )

        if (response.error) return { error: response.error }

        return {
          data: (response.data as ResponseType<BankLinkPage>).data
        }
      },
      providesTags: ['Wallet']
    }),
    unlinkBankLink: build.mutation<AdminUnlinkBankLinkResponse, string>({
      async queryFn(id, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          {
            url: `/bank-links/${id}/unlink`,
            method: 'POST'
          },
          queryApi,
          extraOptions
        )

        if (response.error) return { error: response.error }

        return {
          data: (response.data as ResponseType<AdminUnlinkBankLinkResponse>).data
        }
      },
      invalidatesTags: ['Wallet']
    })
  })
})

export const { useGetBankLinksQuery, useUnlinkBankLinkMutation } = apiBankLink
