import type { PaymentMethod } from '@/app/services/merchantGatewayApi'
import type { PaymentMethodCapability } from '@/app/services/merchantPaymentMethodApi'
import { Switch } from '@components/index'
import {
  METHOD_DESCRIPTIONS,
  methodOptions
} from '../constants/paymentMethod.constants'

interface PaymentMethodToggleListProps {
  /** Nhãn nguồn giá trị (kế thừa/ghi đè/mặc định) hiện trên danh sách. */
  sourceLabel?: string
  sourceHint?: string
  checkedMethods: PaymentMethod[]
  capabilities: PaymentMethodCapability[]
  locked: boolean
  onToggle: (method: PaymentMethod, checked: boolean) => void
}

export function PaymentMethodToggleList({
  sourceLabel,
  sourceHint,
  checkedMethods,
  capabilities,
  locked,
  onToggle
}: PaymentMethodToggleListProps) {
  return (
    <div>
      <h3 className='mb-2 text-sm font-semibold text-foreground'>
        Danh mục hình thức thanh toán
      </h3>
      {sourceLabel && (
        <p className='mb-1 text-xs font-medium text-primary'>{sourceLabel}</p>
      )}
      {sourceHint && (
        <p className='mb-2 text-xs text-muted-foreground'>{sourceHint}</p>
      )}
      <div className='divide-y divide-border rounded-lg border border-border'>
        {methodOptions.map(({ value, label }) => {
          const checked = checkedMethods.includes(value)
          const capability = capabilities.find((item) => item.method === value)
          const ineligible = capability?.eligible === false
          return (
            <div
              key={value}
              className='flex items-center justify-between gap-3 px-3 py-2.5'
            >
              <div className='min-w-0'>
                <p className='text-sm font-medium text-foreground'>{label}</p>
                <p className='text-xs text-muted-foreground'>
                  {METHOD_DESCRIPTIONS[value]}
                </p>
                {ineligible && !locked && (
                  <p className='text-xs text-warning-strong'>
                    Chưa đủ điều kiện bật
                    {capability.reason ? `: ${capability.reason}` : ''}
                  </p>
                )}
              </div>
              <Switch
                aria-label={label}
                className={locked ? 'opacity-100!' : undefined}
                checked={checked}
                // Cho tắt hình thức không đủ điều kiện nhưng không cho bật lại.
                disabled={locked || (ineligible && !checked)}
                onChange={(next) => onToggle(value, next)}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
