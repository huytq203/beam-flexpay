import {
  CheckboxComponent,
  InputNumber,
  SelectComponent,
  Switch,
  TooltipComponent
} from '@components/index'
import {
  CALCULATION_MODE_OPTIONS,
  CAP_BEHAVIOUR_HINT,
  CAP_BEHAVIOUR_OPTIONS,
  CAP_MODE_OPTIONS,
  FIELD_LABEL,
  LEVEL_LABEL,
  PAYMENT_METHOD_OPTIONS
} from '../constants/holdRule.constants'
import type {
  HoldRuleKey,
  HoldRuleLevel,
  HoldRulePolicy
} from '../types/holdRule.types'
import { formatHoldRuleValue } from '../utils/holdRuleFormat.utils'

interface HoldRuleFieldRowProps {
  fieldKey: HoldRuleKey
  level: HoldRuleLevel
  own: boolean
  value: unknown
  policy?: HoldRulePolicy
  error?: string
  onToggle: (own: boolean) => void
  onChange: (value: unknown) => void
}

const ENUM_OPTIONS: Partial<
  Record<HoldRuleKey, { value: string; label: string }[]>
> = {
  calculationMode: CALCULATION_MODE_OPTIONS,
  capMode: CAP_MODE_OPTIONS,
  capBehaviour: CAP_BEHAVIOUR_OPTIONS
}

const NUMBER_RULES: Partial<
  Record<HoldRuleKey, { min: number; max?: number; precision: number }>
> = {
  ratePercent: { min: 0, max: 100, precision: 2 },
  capPercent: { min: 1, max: 100, precision: 2 },
  fixedAmount: { min: 1, precision: 0 },
  capAmount: { min: 1, precision: 0 },
  minimumGrossAmount: { min: 0, precision: 0 },
  holdDays: { min: 1, max: 365, precision: 0 }
}

function inheritedHint(
  key: HoldRuleKey,
  level: HoldRuleLevel,
  policy?: HoldRulePolicy
) {
  const source = policy?.sources?.[key]
  if (!source || (level === 'SYSTEM' && source === 'SYSTEM'))
    return 'Chưa đặt ở cấp nào'
  return `Đang kế thừa: ${formatHoldRuleValue(key, policy?.[key])} (${LEVEL_LABEL[source]})`
}

function FieldControl({
  fieldKey,
  value,
  disabled,
  onChange
}: Pick<HoldRuleFieldRowProps, 'fieldKey' | 'value' | 'onChange'> & {
  disabled: boolean
}) {
  const label = FIELD_LABEL[fieldKey]
  if (fieldKey === 'enabled' || fieldKey === 'capEnabled')
    return (
      <Switch
        aria-label={label}
        checked={value === true}
        checkedChildren='Bật'
        disabled={disabled}
        onChange={onChange}
        unCheckedChildren='Tắt'
      />
    )
  if (fieldKey === 'paymentMethods')
    return (
      <SelectComponent<string[]>
        aria-label={label}
        className='w-full'
        disabled={disabled}
        mode='multiple'
        onChange={onChange}
        options={PAYMENT_METHOD_OPTIONS}
        placeholder='Để trống = tất cả hình thức'
        value={Array.isArray(value) ? (value as string[]) : []}
      />
    )
  const options = ENUM_OPTIONS[fieldKey]
  if (options)
    return (
      <SelectComponent<string>
        aria-label={label}
        className='w-full'
        disabled={disabled}
        onChange={onChange}
        options={options}
        placeholder='Chọn giá trị'
        value={typeof value === 'string' ? value : undefined}
      />
    )
  const rule = NUMBER_RULES[fieldKey]
  return (
    <InputNumber
      aria-label={label}
      disabled={disabled}
      max={rule?.max}
      min={rule?.min}
      onChange={onChange}
      precision={rule?.precision}
      value={typeof value === 'number' ? value : null}
    />
  )
}

export function HoldRuleFieldRow(props: HoldRuleFieldRowProps) {
  const { fieldKey, level, own, policy, error, onToggle } = props
  return (
    <div className='grid grid-cols-12 items-start gap-3 border-b border-border py-3'>
      <div className='col-span-12 md:col-span-4'>
        <p className='text-sm font-medium'>{FIELD_LABEL[fieldKey]}</p>
        <CheckboxComponent
          checked={own}
          onChange={(event) => onToggle(event.target.checked)}
        >
          <span className='text-xs'>
            {level === 'SYSTEM' ? 'Đặt giá trị' : 'Đặt riêng ở cấp này'}
          </span>
        </CheckboxComponent>
      </div>
      <div className='col-span-12 flex flex-col gap-1 md:col-span-8'>
        <div className='flex items-center gap-2'>
          <div className='min-w-0 flex-1'>
            <FieldControl
              disabled={!own}
              fieldKey={fieldKey}
              onChange={props.onChange}
              value={props.value}
            />
          </div>
          {fieldKey === 'capBehaviour' && (
            <TooltipComponent title={CAP_BEHAVIOUR_HINT}>
              <span
                aria-label='Giải thích hành vi khi chạm trần'
                className='cursor-help text-xs text-muted-foreground'
              >
                (?)
              </span>
            </TooltipComponent>
          )}
        </div>
        {!own && (
          <p className='text-xs text-muted-foreground'>
            {inheritedHint(fieldKey, level, policy)}
          </p>
        )}
        {error && (
          <p
            className='text-xs text-danger-strong'
            role='alert'
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
