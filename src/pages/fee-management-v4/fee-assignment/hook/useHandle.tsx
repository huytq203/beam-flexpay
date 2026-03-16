import { feePolicyComponent } from '@pages/fee-management-v4/fee-assignment/constants/feePoliciesComponent'
import { useLazyGetFeeComponentPoliciesByIdQuery } from '@services/apiFeeComponent'
import { useLazyGetFeeComponentTierQuery } from '@services/apiFeeComponentTier'
import { useState, useCallback } from 'react'

const useHandle = () => {
    // res thực tế trả về là mảng (mảng các policy components)
    const [dataFeePolicyComponent, setDataFeePolicyComponent] = useState<feePolicyComponent[]>([])
    const [getDataTier, setGetDataTier] = useState<any[]>([])
    const [isFetchingTier, setIsFetchingTier] = useState<boolean>(false)

    const [getFeeComponentPoliciesById] = useLazyGetFeeComponentPoliciesByIdQuery()
    const [getFeeComponentTier] = useLazyGetFeeComponentTierQuery()

    const handleChoosePolicy = useCallback(async (id: string) => {
        if (!id) {
            setDataFeePolicyComponent([])
            setGetDataTier([])
            return;
        }
        try {
            const res = await getFeeComponentPoliciesById(id).unwrap()
            setDataFeePolicyComponent(res)

            const componentsNeedTier = res?.filter(
                (item: feePolicyComponent) =>
                    item.calculationMethod === 'PROGRESSIVE_TIER' ||
                    item.calculationMethod === 'FLAT_TIER'
            ) || []

            if (componentsNeedTier.length > 0) {
                setIsFetchingTier(true)
                try {
                    const tierPromises = componentsNeedTier.map((item: feePolicyComponent) =>
                        getFeeComponentTier(item.id).unwrap()
                    )
                    const tiersData = await Promise.all(tierPromises)

                    const flattenedTiers = tiersData.flat()
                    setGetDataTier(flattenedTiers)
                } finally {
                    setIsFetchingTier(false)
                }
            } else {
                setGetDataTier([])
            }
        } catch (error) {
            console.error(error)
        }
    }, [getFeeComponentPoliciesById, getFeeComponentTier])

    return {
        handleChoosePolicy,
        getDataTier,
        isFetchingTier,
        dataFeePolicyComponent
    }
}

export default useHandle
