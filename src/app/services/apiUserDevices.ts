import {
  adminLogoutAllDevicesEnvelopeSchema,
  adminUserDeviceListEnvelopeSchema,
  type AdminLogoutAllDevices,
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
    }),
    logoutAllCustomerDevices: build.mutation<AdminLogoutAllDevices, string>({
      query: (userId) => ({
        url: `users/customers/${userId}/logout-all`,
        method: 'POST'
      }),
      transformResponse: (response: unknown): AdminLogoutAllDevices =>
        adminLogoutAllDevicesEnvelopeSchema.parse(response).data,
      invalidatesTags: (_result, _error, userId) => [
        { type: 'UserDevices', id: userId }
      ]
    })
  })
})

export const {
  useGetCustomerDevicesQuery,
  useLogoutAllCustomerDevicesMutation
} = adminUserDeviceApi
