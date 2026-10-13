import type { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { ButtonComponent, TooltipComponent } from '@components/index'

const ekycIconButton = tv({
  base: 'inline-flex items-center justify-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
  variants: {
    tone: {
      neutral: '',
      success: 'hover:border-success-strong! hover:text-success-strong!',
      danger: ''
    }
  },
  defaultVariants: { tone: 'neutral' }
})

interface EkycIconButtonProps
  extends Omit<
      ComponentProps<typeof ButtonComponent>,
      'type' | 'content' | 'title'
    >,
    VariantProps<typeof ekycIconButton> {
  label: string
}

/** Nút icon có viền, cùng kiểu với các cột thao tác khác; tone danger dùng nút `danger` của antd. */
export const EkycIconButton = ({
  label,
  tone,
  className,
  ...rest
}: EkycIconButtonProps) => (
  <TooltipComponent title={label}>
    <ButtonComponent
      {...rest}
      type='default'
      size='small'
      danger={tone === 'danger'}
      aria-label={rest['aria-label'] ?? label}
      className={ekycIconButton({ tone, className })}
    />
  </TooltipComponent>
)
