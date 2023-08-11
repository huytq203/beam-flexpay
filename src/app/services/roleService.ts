import {ResponseType} from '@type/api'
import {IRoles, IRolesSearch} from '@type/role'
import {apiService} from './apiService'

export const roleService = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<IRoles, IRolesSearch>({
      query: (params) => ({
        url: '/role',
        method: 'GET',
        params: params
      }),
      transformResponse: (baseQueryReturnValue): IRoles => {
        return (baseQueryReturnValue as ResponseType<IRoles>).data
      }
    })
  })
})

export const {useGetRolesQuery} = roleService
