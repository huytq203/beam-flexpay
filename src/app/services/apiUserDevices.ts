import {
  adminUserDeviceListEnvelopeSchema,
  type AdminUserDeviceList
} from '@pages/wallet-administration/e-walletManagement/schemas/Security.schema'
import { authApiService } from './apiService'

export interface UnlockCustomerResult {
  userId: string
  enabled: boolean
  unlockedAt: string
}

export const adminUserDeviceApi = authApiService.injectEndpoints({
  endpoints: (build) => ({
    getCustomerDevices: build.query<AdminUserDeviceList, string>({
      query: (userId) => ({
        url: `users/customers/${userId}/devices`,
        method: 'GET'
      }),
      transformResponse: (response: unknown): AdminUserDeviceList =>
        adminUserDeviceListEnvelopeSchema.parse(response).data,
      providesTags: (_result, _error, userId) => [
        { type: 'UserDevices', id: userId }
      ]
    }),
    // Bật lại tài khoản app bị khóa do nhập sai nhiều lần và reset bộ đếm sai.
    unlockCustomer: build.mutation<UnlockCustomerResult, string>({
      query: (userId) => ({
        url: `users/customers/${userId}/unlock`,
        method: 'POST'
      }),
      transformResponse: (response: { data: UnlockCustomerResult }) =>
        response.data,
      invalidatesTags: (_result, _error, userId) => [
        { type: 'UserDevices', id: userId }
      ]
    })
  })
})

export const { useGetCustomerDevicesQuery, useUnlockCustomerMutation } =
  adminUserDeviceApi
