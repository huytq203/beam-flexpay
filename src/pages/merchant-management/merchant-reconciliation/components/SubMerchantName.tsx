import { useGetSubMerchantDetailQuery } from '@/app/services/merchantHierarchyApi'

/** `GET /pauses` không trả mã/tên Sub nên tự tra từ chi tiết Sub-merchant. */
export function SubMerchantName({ subId }: { subId: string }) {
  const { data } = useGetSubMerchantDetailQuery(subId)
  return (
    <div className='min-w-0'>
      <div className='text-sm font-medium'>
        {data ? `${data.code} — ${data.name}` : subId}
      </div>
      {data?.merchantName && (
        <div className='truncate text-xs text-muted-foreground'>
          {data.merchantName}
        </div>
      )}
    </div>
  )
}
