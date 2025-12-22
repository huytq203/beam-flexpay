import { DataLogin, OtpDataDto, UserLoginApiArg, UserLoginApiResponse } from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
import { authApiService as api } from './authApiService'


const injectedRtkApi = api
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
                    body:body
                }),
                transformResponse: fnTransformResponse
            })
        }),
        overrideExisting: false
    })

export { injectedRtkApi as enhancedAuthApi }

export const {
    useUserLoginMutation,
    useRefreshTokenMutation
} = injectedRtkApi
