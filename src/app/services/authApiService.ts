import { fetchBaseQueryCustom } from '@configs/fetchBaseQueryCustom'
import { createApi } from '@reduxjs/toolkit/query/react'

export const authApiService = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchBaseQueryCustom,
    tagTypes: ['Auth', 'Profile', 'roleManagement','Permission','PermissionAssign'],
    endpoints: () => ({}),
    refetchOnMountOrArgChange: true
})
