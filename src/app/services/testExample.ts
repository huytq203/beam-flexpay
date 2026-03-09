import {ResponseType} from '@type/api'
import {apiFeeService, apiService} from './apiService'
 export const exam=apiFeeService.injectEndpoints({
    endpoints: (build) => ({
        getExam:build.query({
            query:()=>({
                url:'https://identity.ewallet.devops.beamewa.com.vn/api/v1/admin/examples',
                method:'GET'
            })
        }),
        getPermisson:build.query({
            query:()=>({
                url:'https://identity.ewallet.devops.beamewa.com.vn/api/v1/admin/permissions',
                method:'GET'
            })
        })
    })
 })
 export const{
    useGetExamQuery,
    useGetPermissonQuery
 }=exam
