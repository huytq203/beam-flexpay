import type { ComponentProps } from 'react'
import { tv, type VariantProps } from 'tailwind-variants'
import { ButtonComponent, TooltipComponent } from '@components/index'

const ekycIconButton = tv({
  base: 'inline-flex size-8! min-w-0! items-center justify-center rounded-lg! border-0! bg-transparent! p-0! text-muted-foreground! shadow-none! transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary',
  variants: {
    tone: {
      neutral: 'hover:bg-accent! hover:text-foreground!',
      success: 'hover:bg-success-strong/10! hover:text-success-strong!',
      danger: 'hover:bg-danger-strong/10! hover:text-danger-strong!'
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

/** Nút icon ghost 32px dùng chung cho cột thao tác bảng eKYC. */
export const EkycIconButton = ({
  label,
  tone,
  className,
  ...rest
}: EkycIconButtonProps) => (
  <TooltipComponent title={label}>
    <ButtonComponent
      {...rest}
      type='text'
      aria-label={rest['aria-label'] ?? label}
      className={ekycIconButton({ tone, className })}
    />
  </TooltipComponent>
)
