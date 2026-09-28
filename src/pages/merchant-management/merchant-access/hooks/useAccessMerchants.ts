import {
  useListAccessMerchantsQuery,
  useListAccessSubMerchantsQuery
} from '@/app/services/merchantAccessApi'

// Chỉ để tra tên hiển thị; nhiều component cùng dùng nên đọc lại cache thay vì
// gọi API mỗi lần modal/drawer mount (apiMerchant bật refetchOnMountOrArgChange).
const LOOKUP_OPTIONS = { refetchOnMountOrArgChange: false } as const

export const useAccessMerchants = () => {
  const merchantsQuery = useListAccessMerchantsQuery(undefined, LOOKUP_OPTIONS)
  const subsQuery = useListAccessSubMerchantsQuery(undefined, LOOKUP_OPTIONS)
  const merchants = merchantsQuery.data ?? []
  const subMerchants = subsQuery.data ?? []
  return {
    merchants,
    subMerchants,
    getMerchant: (id: string) =>
      merchants.find((merchant) => merchant.id === id),
    getSubMerchant: (id: string) => subMerchants.find((sub) => sub.id === id)
  }
}
