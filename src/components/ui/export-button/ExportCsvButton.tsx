import { DownloadOutlined } from '@components/icons'
import ButtonComponent from '@components/ui/button-component'
import TooltipComponent from '@components/ui/tooltip-component'

export interface ExportCsvButtonProps {
  onExport: () => void
  loading?: boolean
  disabled?: boolean
  /** Mặc định 'Xuất CSV' — backend trả CSV chứ không phải Excel. */
  label?: string
  /** Giải thích khác biệt giữa file tải về và bảng đang hiển thị. */
  tooltip?: string
}

export const ExportCsvButton = ({
  onExport,
  loading = false,
  disabled = false,
  label = 'Xuất CSV',
  tooltip
}: ExportCsvButtonProps) => {
  const button = (
    <ButtonComponent
      type='default'
      icon={<DownloadOutlined />}
      loading={loading}
      disabled={disabled || loading}
      onClick={onExport}
      content={label}
    />
  )

  if (!tooltip) return button

  return (
    <TooltipComponent title={tooltip}>
      <span
        className='inline-flex'
        tabIndex={disabled || loading ? 0 : undefined}
      >
        {button}
      </span>
    </TooltipComponent>
  )
}
