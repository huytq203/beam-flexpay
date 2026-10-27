import type { MerchantEnvelope } from '@type/merchant'
import type {
  SettlementItemDetail,
  SettlementItemListParams,
  SettlementItemQuery,
  SettlementItemRow,
  SettlementItemTotals
} from '@/pages/merchant-management/merchant-settlement-item/types/settlementItem.types'
import type { GatewayPage } from './merchantGatewayApi'
import { apiMerchant } from './apiService'

// BE trả `message` là tên mã lỗi; màn tự map sang câu tiếng Việt.
const OWN_ERROR_HANDLING = { suppressErrorNotification: true } as const
const unwrap = <T>(response: MerchantEnvelope<T>): T => response.data
const ITEMS_TAG = { type: 'merchant' as const, id: 'settlement-items' }

// Chỉ đọc. Sắp xếp qua `sortBy`/`sortDirection` (list và export); tham số `sort` kiểu Spring không còn tác dụng nên không gửi.
const service = apiMerchant.injectEndpoints({
  endpoints: (builder) => ({
    listSettlementItems: builder.query<
      GatewayPage<SettlementItemRow>,
      SettlementItemListParams
    >({
      query: (params) => ({
        url: '/merchant-settlement-items',
        method: 'GET',
        params
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<GatewayPage<SettlementItemRow>>,
      providesTags: [ITEMS_TAG]
    }),
    getSettlementItemTotals: builder.query<
      SettlementItemTotals,
      SettlementItemQuery
    >({
      query: (params) => ({
        url: '/merchant-settlement-items/totals',
        method: 'GET',
        params
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementItemTotals>,
      providesTags: [ITEMS_TAG]
    }),
    getSettlementItemDetail: builder.query<SettlementItemDetail, string>({
      query: (id) => ({
        url: `/merchant-settlement-items/${id}`,
        method: 'GET'
      }),
      extraOptions: OWN_ERROR_HANDLING,
      transformResponse: unwrap<SettlementItemDetail>,
      providesTags: [ITEMS_TAG]
    })
  })
})

export const {
  useListSettlementItemsQuery,
  useGetSettlementItemTotalsQuery,
  useGetSettlementItemDetailQuery
} = service
