import { ArrowDownIcon, ArrowUpIcon } from '@components/icons'
import { cn } from '@lib/utils/cn'
import { useRef, type KeyboardEvent } from 'react'
import {
  FEE_SCOPE,
  FEE_SCOPE_LABEL,
  FEE_SCOPES,
  feeScopePanelId,
  feeScopeTabId,
  type FeeScope
} from '../constants/feeConfigFields'

interface FeeScopeTabsProps {
  value: FeeScope
  /** Bỏ trống khi không biết số thành phần của từng luồng (ví dụ màn danh sách). */
  counts?: Readonly<Record<FeeScope, number>>
  /** Tab có tabpanel đi kèm trong cùng trang; màn lọc danh sách không có. */
  withPanels?: boolean
  onChange: (next: FeeScope) => void
}

/**
 * Hai luồng phí là hai tab riêng để đối soát từng luồng một: phí đầu ra (ví
 * thu của người dùng) và phí đầu vào (ví trả ngân hàng, đối tác). Số đếm
 * trên tab cho thấy luồng nào còn trống mà không phải mở tab đó.
 */
export const FeeScopeTabs = ({
  value,
  counts,
  withPanels = true,
  onChange
}: FeeScopeTabsProps) => {
  const refs = useRef<Partial<Record<FeeScope, HTMLButtonElement | null>>>({})

  const handleKeyDown = (event: KeyboardEvent, index: number) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return
    const next = FEE_SCOPES[(index + 1) % FEE_SCOPES.length]
    onChange(next)
    refs.current[next]?.focus()
  }

  return (
    <div
      role='tablist'
      aria-label='Luồng phí'
      className='flex overflow-x-auto border-b border-border'
    >
      {FEE_SCOPES.map((scope, index) => {
        const isActive = scope === value
        const Icon = scope === FEE_SCOPE.OUTPUT_FEE ? ArrowDownIcon : ArrowUpIcon
        return (
          <button
            key={scope}
            ref={(node) => {
              refs.current[scope] = node
            }}
            id={feeScopeTabId(scope)}
            type='button'
            role='tab'
            aria-selected={isActive}
            aria-controls={withPanels ? feeScopePanelId(scope) : undefined}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(scope)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            className={cn(
              '-mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5',
              'text-[14px] font-semibold transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
              isActive
                ? 'border-primary text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              size={16}
              weight='bold'
              aria-hidden
            />
            {FEE_SCOPE_LABEL[scope]}
            {counts && (
              <span
                className={cn(
                  'min-w-5 rounded-md px-1.5 text-center text-[11px] font-semibold tabular-nums',
                  isActive
                    ? 'bg-primary/20 text-foreground'
                    : 'bg-muted text-muted-foreground'
                )}
              >
                {counts[scope]}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
