import { LIMIT_FIELD_LABEL } from '../constants/withdrawalLimit.constants'
import type { WithdrawalLimitConfig } from '../types/withdrawalLimit.types'
import { formatVnd } from '../utils/money'

const COUNT_KEY = 'maximumDailyWithdrawalCount'
const FIELD_KEYS = Object.keys(
  LIMIT_FIELD_LABEL
) as (keyof WithdrawalLimitConfig)[]

export function LimitConfigList({ config }: { config: WithdrawalLimitConfig }) {
  const entries = FIELD_KEYS.filter((key) => config[key] !== undefined)
  if (entries.length === 0) return <span>—</span>
  return (
    <ul className='space-y-0.5 text-sm'>
      {entries.map((key) => (
        <li
          key={key}
          className='flex justify-between gap-3'
        >
          <span className='text-muted-foreground'>
            {LIMIT_FIELD_LABEL[key]}
          </span>
          <span className='text-right tabular-nums'>
            {key === COUNT_KEY
              ? `${config[key]} lệnh`
              : formatVnd(config[key] as number)}
          </span>
        </li>
      ))}
    </ul>
  )
}
