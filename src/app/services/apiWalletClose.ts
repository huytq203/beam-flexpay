import { fetchBaseQueryUserWallet } from '@configs/fetchBaseQueryCustom'
import { apiWalletCore } from '@services/apiService'
import type { ResponseType } from '@type/api'
import type {
  CloseUserWalletRequest,
  CloseUserWalletResult,
  WalletClosureCheck
} from '@pages/wallet-administration/e-walletManagement/types/WalletClose.type'

export const apiWalletClose = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    /** Số dư real-time: không cache, mỗi lần mở popup gọi lại. */
    getWalletClosureCheck: build.query<WalletClosureCheck, string>({
      async queryFn(userId, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          { url: `/user-wallets/${userId}/closure-check`, method: 'GET' },
          queryApi,
          // Popup tự hiển thị `detail` của lỗi.
          { ...extraOptions, suppressErrorNotification: true }
        )
        if (response.error) return { error: response.error }
        return {
          data: (response.data as ResponseType<WalletClosureCheck>).data
        }
      },
      keepUnusedDataFor: 0
    }),
    closeUserWallet: build.mutation<
      CloseUserWalletResult,
      CloseUserWalletRequest
    >({
      async queryFn({ userId, ...body }, queryApi, extraOptions) {
        const response = await fetchBaseQueryUserWallet(
          { url: `/user-wallets/${userId}/close`, method: 'POST', body },
          queryApi,
          { ...extraOptions, suppressErrorNotification: true }
        )
        if (response.error) return { error: response.error }
        return {
          data: (response.data as ResponseType<CloseUserWalletResult>).data
        }
      },
      invalidatesTags: ['Wallet']
    })
  })
})

export const { useGetWalletClosureCheckQuery, useCloseUserWalletMutation } =
  apiWalletClose
