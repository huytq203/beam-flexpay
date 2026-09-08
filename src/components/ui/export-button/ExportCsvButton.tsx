import {
  buildExportLimitHint,
  isOverExportLimit
} from '@constants/export'
import { DownloadOutlined, WarningIcon } from '@components/icons'
import ButtonComponent from '@components/ui/button-component'
import TooltipComponent from '@components/ui/tooltip-component'
import type { ReactNode } from 'react'

export interface ExportCsvButtonProps {
  onExport: () => void
  loading?: boolean
  disabled?: boolean
  /** Mặc định 'Xuất CSV' — backend trả CSV chứ không phải Excel. */
  label?: string
  /** Giải thích khác biệt giữa file tải về và bảng đang hiển thị. */
  tooltip?: ReactNode
  /**
   * Tổng số dòng bộ lọc hiện tại khớp. Vượt trần thì nút bị khoá kèm lý do —
   * bấm cũng chỉ nhận 400, chặn trước đỡ một vòng gọi API.
   */
  totalRows?: number
}

export const ExportCsvButton = ({
  onExport,
  loading = false,
  disabled = false,
  label = 'Xuất CSV',
  tooltip,
  totalRows
}: ExportCsvButtonProps) => {
  const overLimit = isOverExportLimit(totalRows)
  const isBlocked = disabled || loading || overLimit

  const button = (
    <ButtonComponent
      type='default'
      icon={overLimit ? <WarningIcon size={16} /> : <DownloadOutlined />}
      loading={loading}
      disabled={isBlocked}
      onClick={onExport}
      content={label}
    />
  )

  const hint =
    overLimit && totalRows !== undefined ? (
      <span className='flex flex-col gap-1'>
        <span>{buildExportLimitHint(totalRows)}</span>
        {tooltip ? <span>{tooltip}</span> : null}
      </span>
    ) : (
      tooltip
    )

  if (!hint) return button

  return (
    <TooltipComponent title={hint}>
      <span className='inline-flex' tabIndex={isBlocked ? 0 : undefined}>
        {button}
      </span>
    </TooltipComponent>
  )
}
