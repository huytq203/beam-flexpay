import { WarningCircleIcon } from '@components/icons'
import type { BaseTypeSummary } from '../utils/feeComponentSummary'
import { FeeComponentReadout } from './FeeComponentReadout'

interface BaseTypePreviewProps {
  summary: BaseTypeSummary
}

/**
 * Cấu hình thật của loại phí đang được lấy làm cơ sở tính.
 *
 * Backend gom kết quả theo LOẠI chứ không theo từng thành phần: mọi thành phần
 * cùng loại được cộng lại rồi thành phần sau mới tra vào. Nên khi một loại có
 * nhiều thành phần, không có cái nào để chọn riêng — khối này bày nguyên cấu
 * hình của từng cái để người dùng thấy đúng thứ mình đang tính lên trên.
 */
export const BaseTypePreview = ({ summary }: BaseTypePreviewProps) => {
  if (summary.components.length === 0) {
    return (
      <p className='flex items-start gap-2 rounded-lg border border-border bg-muted px-4 py-3 text-[13px] text-muted-foreground'>
        <WarningCircleIcon
          size={16}
          weight='bold'
          aria-hidden
          className='mt-0.5 shrink-0'
        />
        Chưa có thành phần nào thuộc loại này đứng phía trên, nên không có gì để
        tính dựa vào.
      </p>
    )
  }

  return (
    <div className='rounded-lg border border-border bg-muted px-4 py-3'>
      <p className='text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground'>
        Cơ sở tính
      </p>
      <p className='mt-1 text-[13px] font-semibold text-foreground'>
        {summary.isSum
          ? `Tổng của ${summary.components.length} thành phần ${summary.label}`
          : summary.label}
      </p>

      <div className='mt-3 flex flex-col gap-3'>
        {summary.components.map((component, index) => (
          <div
            key={component.key}
            className='rounded-lg border border-border bg-background px-4 py-3'
          >
            {summary.isSum && (
              <p className='mb-2 text-[13px] font-semibold tabular-nums text-foreground'>
                Thành phần {index + 1}
              </p>
            )}
            <FeeComponentReadout component={component} />
          </div>
        ))}
      </div>

      {summary.isSum && (
        <p className='mt-3 text-[13px] text-muted-foreground'>
          Không chọn riêng được một trong số chúng: dịch vụ phí cộng mọi thành
          phần cùng loại rồi mới cho thành phần này tính lên trên.
        </p>
      )}
    </div>
  )
}
