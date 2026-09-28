import { useMerchantById } from '../hooks/useMerchantById'

interface MerchantNameTextProps {
  merchantId: string
  withCode?: boolean
}

export function MerchantNameText({
  merchantId,
  withCode = false
}: MerchantNameTextProps) {
  const { merchant, isLoading } = useMerchantById(merchantId)
  if (isLoading) return <span className='text-muted-foreground'>…</span>
  if (!merchant)
    return (
      <span className='text-muted-foreground'>Merchant không xác định</span>
    )
  if (!withCode) return <>{merchant.name}</>
  return (
    <span className='block min-w-0'>
      <span className='block truncate font-medium text-foreground'>
        {merchant.name}
      </span>
      <span className='text-xs text-muted-foreground'>{merchant.code}</span>
    </span>
  )
}
