import { cn } from '@lib/utils/cn'
import { formatCurrency } from '@utils/formatNumber'
import type { GrossProfitView } from '../utils/grossProfit'

interface GrossProfitCardProps {
  profit: GrossProfitView
  currency: string
}

export const GrossProfitCard = ({ profit, currency }: GrossProfitCardProps) => {
  const { amount, label, isProviderCostDeducted } = profit
  return (
    <div className='flex min-h-36 flex-col items-center justify-center rounded-md border border-blue-300 bg-blue-50 px-4 py-5 text-center'>
      <p className='font-semibold text-blue-950'>{label}</p>
      <p
        className={cn(
          'mt-2 text-xl font-semibold tabular-nums',
          amount != null && amount < 0 ? 'text-red-700' : 'text-green-700'
        )}
      >
        {amount == null
          ? '--'
          : formatCurrency(amount, { symbol: currency, position: 'after' })}
      </p>
      {!isProviderCostDeducted && (
        <p className='mt-1 text-sm text-blue-800'>
          Chưa có dữ liệu chi phí nhà cung cấp.
        </p>
      )}
    </div>
  )
}
