import { fetchAuthBaseQueryCustom } from '@configs/fetchBaseQueryCustom'
import { createApi } from '@reduxjs/toolkit/query/react'

export const authApiService = createApi({
    reducerPath: 'authApi',
    baseQuery: fetchAuthBaseQueryCustom,
    tagTypes: ['Auth', 'Profile'],
    endpoints: () => ({}),
    refetchOnMountOrArgChange: true
})
