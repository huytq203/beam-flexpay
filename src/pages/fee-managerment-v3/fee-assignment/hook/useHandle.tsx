import { useGetFeeComponentPoliciesByIdQuery, useLazyGetFeeComponentPoliciesByIdQuery } from '@services/apiFeeComponent'
import React from 'react'

const useHandle = () => {

    const [getFeeComponentPoliciesById] = useLazyGetFeeComponentPoliciesByIdQuery()
    // Query để lấy dữ liệu tier cho PROGRESSIVE_TIER và FLAT_TIER
    // const { data: editTierData, isFetching: isFetchingTier } = useGetFeeComponentTierQuery(
    //     selectedComponent?.id ?? '',
    //     {
    //         skip:
    //             !selectedComponent?.id ||
    //             (selectedComponent?.calculationMethod !== 'PROGRESSIVE_TIER' &&
    //                 selectedComponent?.calculationMethod !== 'FLAT_TIER')
    //     }
    // )

    const handleChangePolicy = async (id: string) => {
        try {
            const res = await getFeeComponentPoliciesById(id).unwrap()
            console.log(res)
        } catch {
        }
    }
    return {
        handleChangePolicy
    }
}

export default useHandle