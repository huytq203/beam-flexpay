import { DataLogin, UserLoginApiArg } from '@type/application'
import { fnTransformResponse } from '@utils/helperFunctions'
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
    useLogoutMutation
} = injectedRtkApi
