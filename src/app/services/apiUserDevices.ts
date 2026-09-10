import {
  adminUserDeviceListEnvelopeSchema,
  type AdminUserDeviceList
} from '@pages/wallet-administration/e-walletManagement/schemas/Security.schema'
import { authApiService } from './apiService'

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
    })
  })
})

export const { useGetCustomerDevicesQuery } = adminUserDeviceApi
