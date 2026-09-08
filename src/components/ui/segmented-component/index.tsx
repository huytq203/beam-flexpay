import { cn } from '@lib/utils/cn'
import { Segmented, type SegmentedProps } from 'antd'

export interface SegmentedComponentProps<T extends string>
  extends Omit<SegmentedProps<T>, 'onChange' | 'options'> {
  options: SegmentedProps<T>['options']
  onChange?: (value: T) => void
  /** Nhãn đọc cho screen reader — Segmented không tự sinh nhóm có tên. */
  ariaLabel?: string
}

const SegmentedComponent = <T extends string>({
  options,
  onChange,
  className,
  ariaLabel,
  ...rest
}: SegmentedComponentProps<T>) => (
  <Segmented<T>
    options={options}
    onChange={onChange}
    aria-label={ariaLabel}
    className={cn(
      'rounded-xl! bg-slate-100! p-1!',
      '[&_.ant-segmented-item-selected]:rounded-lg!',
      '[&_.ant-segmented-item]:rounded-lg!',
      className
    )}
    {...rest}
  />
)

export default SegmentedComponent
