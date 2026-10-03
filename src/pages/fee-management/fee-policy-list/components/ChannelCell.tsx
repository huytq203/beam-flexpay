import { allowsMerchantCriteria } from '@utils/fee-execution'
import type { FeeAssignment } from '@type/fee.type'

interface ChannelCellProps {
  serviceType: string
  assignments: readonly FeeAssignment[] | undefined
}

const unique = (values: readonly (string | null | undefined)[]): string[] => [
  ...new Set(values.map((value) => value?.trim()).filter((value): value is string => Boolean(value)))
]

/**
 * Ngân hàng (và merchant với luồng thu hộ, chi hộ) mà chính sách áp vào. Ô trống ở bản gán là
 * "áp cho tất cả", nên nói ra là "Mọi ngân hàng" thay vì để một ô rỗng gây hiểu nhầm.
 */
export const ChannelCell = ({ serviceType, assignments }: ChannelCellProps) => {
  const list = assignments ?? []
  const banks = unique(list.map(({ bankCode }) => bankCode))
  const anyBank = list.length === 0 || list.some(({ bankCode }) => !bankCode?.trim())
  const merchants = unique(list.map(({ merchantId }) => merchantId))
  const anyMerchant = list.length === 0 || list.some(({ merchantId }) => !merchantId)

  return (
    <div className='flex flex-col gap-0.5 text-[13px] text-foreground'>
      <span>
        {banks.join(', ')}
        {banks.length > 0 && anyBank ? ' · ' : ''}
        {anyBank ? 'Mọi ngân hàng' : ''}
      </span>
      {allowsMerchantCriteria(serviceType) && (
        <span className='text-xs text-muted-foreground'>
          {merchants.length > 0 &&
            `${merchants.length} merchant riêng${anyMerchant ? ' · ' : ''}`}
          {anyMerchant ? 'Mọi merchant' : ''}
        </span>
      )}
    </div>
  )
}
