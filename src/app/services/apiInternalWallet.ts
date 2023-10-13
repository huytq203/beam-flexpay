import { ResponseType } from '@type/api'
import {
    DetailPermissionPayload,
    GroupPermissionPayload,
    GroupPermissionSearchParams,
    PermissionDataType
} from '@type/permission'
import { apiService } from './apiService'
import { InternalWalletPayload, InternalWalletResponse } from '@type/internalWallet'

export const groupPermissionApi = apiService.injectEndpoints({
    endpoints: (builder) => ({
        getListWalletGroups: builder.query<
            InternalWalletResponse,
            InternalWalletPayload
        >({
            query: (payload) => ({
                url: '/balance-internal-group',
                method: 'GET',
                params: payload
            }),
            transformResponse(
                baseQueryReturnValue: ResponseType<GroupPermissionPayload>
            ): GroupPermissionPayload {
                return baseQueryReturnValue.data
            }
        }),
        createInternalWalletGroup: builder.mutation({
            query: (payload) => ({
                url: '/balance-internal-group',
                method: 'POST',
                body: payload
            })
        }),
        getListWallets: builder.query<
            InternalWalletResponse,
            InternalWalletPayload
        >({
            query: (payload) => ({
                url: '/balance-internal',
                method: 'GET',
                params: payload
            }),
            transformResponse(
                baseQueryReturnValue: ResponseType<GroupPermissionPayload>
            ): GroupPermissionPayload {
                return baseQueryReturnValue.data
            }
        }),
    })
})

export const {
    useGetListWalletGroupsQuery,
    useCreateInternalWalletGroupMutation,
    useGetListWalletsQuery,
} = groupPermissionApi
