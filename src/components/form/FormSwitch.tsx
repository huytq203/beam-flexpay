import type { ReactNode } from 'react'
import type { Control, FieldValues, Path } from 'react-hook-form'
import { Switch } from 'antd'
import type { SwitchProps } from 'antd'
import { FormField } from './FormField'

interface FormSwitchProps<T extends FieldValues>
  extends Omit<SwitchProps, 'checked' | 'defaultChecked' | 'onChange' | 'value'> {
  name: Path<T>
  control: Control<T>
  label: ReactNode
  description?: ReactNode
  className?: string
  onChange?: SwitchProps['onChange']
}

export function FormSwitch<T extends FieldValues>({
  name,
  control,
  label,
  description,
  className = '',
  onChange,
  ...rest
}: FormSwitchProps<T>) {
  const descriptionId = description ? `${name}-description` : undefined

  return (
    <FormField
      name={name}
      control={control}
      className={className}
      render={(field) => (
        <div className='flex min-h-16 items-center gap-4 rounded-lg border border-border bg-background px-4 py-3'>
          <div className='min-w-0 flex-1'>
            <label
              htmlFor={`${name}-switch`}
              className='block cursor-pointer text-sm font-medium text-foreground'
            >
              {label}
            </label>
            {description && (
              <p
                id={descriptionId}
                className='mt-1 text-xs leading-5 text-muted-foreground'
              >
                {description}
              </p>
            )}
          </div>
          <Switch
            {...rest}
            id={`${name}-switch`}
            checked={Boolean(field.value)}
            aria-describedby={descriptionId}
            onChange={(checked, event) => {
              field.onChange(checked)
              onChange?.(checked, event)
            }}
          />
        </div>
      )}
    />
  )
}
