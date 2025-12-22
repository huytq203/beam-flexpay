import {ResponseType} from '@type/api'
import {apiService} from './apiService'
 export const exam=apiService.injectEndpoints({
    endpoints: (build) => ({
        getExam:build.query({
            query:()=>({
                url:'https://identity.ewallet.devops.beamewa.com.vn/api/v1/admin/examples',
                method:'GET'
            })
        })
    })
 })
 export const{
    useGetExamQuery
 }=exam