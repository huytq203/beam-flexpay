import { useGetHierarchyParentByIdQuery } from '@/app/services/merchantHierarchyApi'

// Tra một Merchant theo id thay cho danh sách tải sẵn 100 bản ghi. RTK Query
// gom request trùng id; tắt refetch khi mount để các ô cùng id dùng lại cache.
export const useMerchantById = (merchantId?: string | null) => {
  const query = useGetHierarchyParentByIdQuery(merchantId ?? '', {
    skip: !merchantId,
    refetchOnMountOrArgChange: false
  })
  return { merchant: query.data, isLoading: query.isLoading }
}
