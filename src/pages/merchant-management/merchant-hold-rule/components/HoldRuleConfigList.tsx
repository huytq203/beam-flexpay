import { TagComponent, TooltipComponent } from '@components/index'
import {
  CAP_BEHAVIOUR_HINT,
  FIELD_LABEL
} from '../constants/holdRule.constants'
import type { HoldRuleConfig, HoldRuleKey } from '../types/holdRule.types'
import {
  configEntries,
  formatHoldRuleValue
} from '../utils/holdRuleFormat.utils'

interface HoldRuleConfigListProps {
  config: HoldRuleConfig | null | undefined
  /** Nội dung khi `config` rỗng; ở Master/Sub rỗng nghĩa là gỡ quy tắc riêng. */
  emptyText?: string
}

function ValueText({
  fieldKey,
  value
}: {
  fieldKey: HoldRuleKey
  value: unknown
}) {
  const text = formatHoldRuleValue(fieldKey, value)
  if (fieldKey !== 'capBehaviour') return <span>{text}</span>
  return (
    <TooltipComponent title={CAP_BEHAVIOUR_HINT}>
      <span className='cursor-help'>
        <TagComponent>{text}</TagComponent>
      </span>
    </TooltipComponent>
  )
}

/** Các tham số của một đề xuất/phiên bản, nhãn tiếng Việt, đúng thứ tự khóa chuẩn. */
export function HoldRuleConfigList({
  config,
  emptyText = 'Gỡ quy tắc riêng (kế thừa lại toàn bộ)'
}: HoldRuleConfigListProps) {
  const entries = configEntries(config)
  if (entries.length === 0)
    return <span className='text-sm text-muted-foreground'>{emptyText}</span>
  return (
    <ul className='m-0 list-none space-y-0.5 p-0 text-sm'>
      {entries.map(([key, value]) => (
        <li
          key={key}
          className='flex justify-between gap-3'
        >
          <span className='text-muted-foreground'>
            {FIELD_LABEL[key] ?? key}
          </span>
          <span className='text-right tabular-nums'>
            <ValueText
              fieldKey={key}
              value={value}
            />
          </span>
        </li>
      ))}
    </ul>
  )
}
