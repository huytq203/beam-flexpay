import { DataLogin, OtpDataDto, UserLoginApiArg, UserLoginApiResponse } from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { url } from 'inspector';
import { authApiService } from './apiService';


const injectedRtkApi = authApiService
    .enhanceEndpoints({
        addTagTypes: ['Auth', 'Profile']
    })
    .injectEndpoints({
        endpoints: (build) => ({
            userLogin: build.mutation<DataLogin, UserLoginApiArg>({
                query: (queryArg) => ({
                    url: `/auth/login`,
                    method: 'POST',
                    body: queryArg.userLoginDto
                }),
                transformResponse: fnTransformResponse
            }),
            refreshToken: build.mutation<{ accessToken: string; refreshToken?: string }, { refreshToken: string }>({
                query: (body) => ({
                    url: `/auth/refresh`,
                    method: 'POST',
                    body: body
                }),
                transformResponse: fnTransformResponse
            }),
            logout: build.mutation({
                query: (body) => ({
                    url: '/auth/logout',
                    method: 'POST',
                    body: body
                })
            })
        }),
        overrideExisting: false
    })

export { injectedRtkApi as enhancedAuthApi }

export const {
    useUserLoginMutation,
    useRefreshTokenMutation,
    useLogoutMutation
} = injectedRtkApi
