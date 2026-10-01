import type {
  PaymentMethod,
  PaymentMethodSummary
} from '@/app/services/merchantGatewayApi'
import { cn } from '@lib/utils/cn'
import { methodOptions } from '../constants/paymentMethod.constants'

const LEVEL_LABELS: Record<string, string> = {
  SYSTEM_DEFAULT: 'Mặc định hệ thống',
  MASTER: 'Master',
  SUB: 'Sub-merchant',
  TERMINAL: 'Terminal'
}

const methodLabel = (code: PaymentMethod) =>
  methodOptions.find((item) => item.value === code)?.label ?? code

const chipBase =
  'inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium leading-5'

export function MerchantCell({ row }: { row: PaymentMethodSummary }) {
  return (
    <div className='min-w-0'>
      <div className='truncate text-sm font-semibold text-foreground'>
        {row.merchantName}
      </div>
      <div className='font-mono text-xs text-muted-foreground'>
        {row.merchantCode}
      </div>
    </div>
  )
}

export function LevelCell({ row }: { row: PaymentMethodSummary }) {
  const label = LEVEL_LABELS[row.appliedLevel] ?? (row.appliedLevel || '—')
  const isOwnConfig = row.appliedLevel !== 'SYSTEM_DEFAULT'
  return (
    <div className='flex flex-col items-start gap-1'>
      <span
        className={cn(
          chipBase,
          isOwnConfig
            ? 'border-primary/40 bg-primary/10 text-foreground'
            : 'border-border bg-muted text-muted-foreground'
        )}
      >
        {label}
      </span>
      {!row.configured && (
        <span className='text-xs text-muted-foreground'>Chưa thiết lập</span>
      )}
    </div>
  )
}

export function MethodsCell({ row }: { row: PaymentMethodSummary }) {
  const enabled = row.enabledMethods ?? []
  if (enabled.length === 0)
    return (
      <span className='text-xs font-medium text-warning-strong'>
        Chưa bật hình thức nào
      </span>
    )
  return (
    <div className='flex flex-wrap items-center gap-1.5'>
      <span
        className='mr-1 text-xs font-medium text-muted-foreground tabular-nums'
        aria-label={`${enabled.length} trên ${methodOptions.length} hình thức`}
      >
        {enabled.length}/{methodOptions.length}
      </span>
      {enabled.map((method) => (
        <span
          key={method}
          className={cn(
            chipBase,
            'border-border bg-background text-foreground'
          )}
        >
          {methodLabel(method)}
        </span>
      ))}
    </div>
  )
}

export function StatusCell({ active }: { active: boolean }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-2 text-sm font-medium',
        active ? 'text-success-strong' : 'text-muted-foreground'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'size-2 rounded-full',
          active ? 'bg-success-strong' : 'bg-muted-foreground/50'
        )}
      />
      {active ? 'Đang dùng' : 'Ngừng'}
    </span>
  )
}
