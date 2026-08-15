import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type { ResponseType } from '@type/api'

/** Một liên kết ngân hàng trả về trong display-info (AdminWalletDisplayInfoResponse). */
export interface WalletDisplayLinkedBank {
  id: string
  bankCode: string | null
  linkType: string | null
  cardNumberMask: string | null
  accountNumberMask: string | null
  accountName: string | null
  status: string | null
  isDefault: boolean | null
  isSalaryAccount: boolean | null
  linkedAt: string | null
}

export interface WalletDisplayInfo {
  userId: string
  linkedBanks: WalletDisplayLinkedBank[]
  salaryAdvanceEnabled: boolean | null
}

export const apiUserInfo = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    /** GET /user-wallets/{userId}/display-info — userId chính là ownerId của ví. */
    getWalletDisplayInfo: build.query<WalletDisplayInfo, string>({
      async queryFn(userId, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          {
            url: `/user-wallets/${userId}/display-info`,
            method: 'GET'
          },
          queryApi,
          extraOptions
        )

        if (response.error) return { error: response.error }

        const data = (response.data as ResponseType<WalletDisplayInfo>).data

        return {
          data: {
            userId: data?.userId ?? userId,
            linkedBanks: data?.linkedBanks ?? [],
            salaryAdvanceEnabled: data?.salaryAdvanceEnabled ?? null
          }
        }
      },
      providesTags: ['Wallet']
    })
  })
})

export const { useGetWalletDisplayInfoQuery } = apiUserInfo
