import { allowsProviderCriteria } from '@pages/fee-management/fee-config/constants/feeProvider'
import { allowsMerchantCriteria } from '@utils/fee-execution'
import type { FeeAssignment } from '@type/fee.type'

interface ChannelCellProps {
  serviceType: string
  assignments: readonly FeeAssignment[] | undefined
}

const unique = (values: readonly (string | null | undefined)[]): string[] => [
  ...new Set(
    values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value))
  )
]

/**
 * Nhà cung cấp (nạp/rút), ngân hàng phát hành (và merchant với luồng thu hộ, chi hộ) mà chính sách áp vào. Ô trống ở bản gán là
 * "áp cho tất cả", nên nói ra là "Mọi ngân hàng" thay vì để một ô rỗng gây hiểu nhầm.
 */
export const ChannelCell = ({ serviceType, assignments }: ChannelCellProps) => {
  const list = assignments ?? []
  const providers = unique(list.map(({ providerCode }) => providerCode))
  const anyProvider =
    list.length === 0 || list.some(({ providerCode }) => !providerCode?.trim())
  const banks = unique(list.map(({ bankCode }) => bankCode))
  const anyBank =
    list.length === 0 || list.some(({ bankCode }) => !bankCode?.trim())
  const merchants = unique(list.map(({ merchantId }) => merchantId))
  const anyMerchant =
    list.length === 0 || list.some(({ merchantId }) => !merchantId)

  return (
    <div className='flex flex-col gap-0.5 text-[13px] text-foreground'>
      {allowsProviderCriteria(serviceType) && (
        <span>
          NCC: {providers.join(', ')}
          {providers.length > 0 && anyProvider ? ' · ' : ''}
          {anyProvider ? 'Tất cả NCC' : ''}
        </span>
      )}
      <span>
        NH:{banks.join(', ')}
        {banks.length > 0 && anyBank ? ' · ' : ''}
        {anyBank ? 'Tất cả NH phát hành ' : ''}
      </span>
      {allowsMerchantCriteria(serviceType) && (
        <span className='text-xs text-muted-foreground'>
          {merchants.length > 0 &&
            `${merchants.length} merchant riêng${anyMerchant ? ' · ' : ''}`}
          {anyMerchant ? 'Tất cả merchant' : ''}
        </span>
      )}
    </div>
  )
}
