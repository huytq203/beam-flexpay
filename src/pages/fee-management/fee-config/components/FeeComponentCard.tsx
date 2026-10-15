import { NotePencilIcon, TrashIcon } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { COMPONENT_TYPE_LABELS, getFeeLabel } from '@constants/feeLabels'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import { FeeComponentReadout } from './FeeComponentReadout'

interface FeeComponentCardProps {
  component: FeeComponentFormValues
  /** Thành phần người nhận khi cả hai bên cùng chịu; hiện chung một thẻ. */
  partner?: FeeComponentFormValues | null
  index: number
  onEdit: () => void
  onRemove: () => void
  readOnly?: boolean
}

/**
 * Một khối thành phần phí đã cấu hình, đọc được mà không phải mở lại hộp thoại.
 */
export const FeeComponentCard = ({
  component,
  partner = null,
  index,
  onEdit,
  onRemove,
  readOnly = false
}: FeeComponentCardProps) => (
  <article className='rounded-lg border border-border bg-background'>
    <header className='flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3'>
      <h3 className='text-[15px] font-semibold text-foreground'>
        {index + 1}.{' '}
        {getFeeLabel(component.componentType, COMPONENT_TYPE_LABELS)}
        {partner && (
          <span className='ml-2 rounded-full bg-muted px-2 py-0.5 align-middle text-[12px] font-medium text-muted-foreground'>
            Hai bên cùng chịu
          </span>
        )}
      </h3>
      {!readOnly && (
        <div className='flex gap-2'>
          <TooltipComponent title='Sửa thành phần'>
            <ButtonComponent
              htmlType='button'
              type='default'
              aria-label='Sửa thành phần'
              icon={
                <NotePencilIcon
                  size={15}
                  weight='bold'
                  aria-hidden
                />
              }
              onClick={onEdit}
            />
          </TooltipComponent>
          <TooltipComponent title='Xoá thành phần'>
            <ButtonComponent
              htmlType='button'
              type='default'
              aria-label='Xoá thành phần'
              icon={
                <TrashIcon
                  size={15}
                  weight='bold'
                  aria-hidden
                />
              }
              onClick={onRemove}
            />
          </TooltipComponent>
        </div>
      )}
    </header>

    <div className='px-4 py-3'>
      <FeeComponentReadout component={component} />
    </div>
    {partner && (
      <div className='border-t border-dashed border-border px-4 py-3'>
        <FeeComponentReadout component={partner} />
      </div>
    )}
  </article>
)
