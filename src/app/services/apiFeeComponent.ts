import { apiService } from "./apiService";
import { ResponseType } from '@type/api'
import { feePolicyComponent, FeeComponentResponse } from '@type/feePoliciesComponent'
import { method } from "lodash";
export const feeComponentApi = apiService.injectEndpoints({
    endpoints: (build) => ({
        getFeeComponentPolicies: build.query({
            query: (params) => ({
                url: `${import.meta.env.VITE_FEE_API_URL}/fee/policy-components`,
                method: "GET",
                params: params
            }),
            transformResponse:(res:ResponseType<FeeComponentResponse>)=>res.data
        }),
       
    }),
});
export const{
    useGetFeeComponentPoliciesQuery,
    
}=feeComponentApi