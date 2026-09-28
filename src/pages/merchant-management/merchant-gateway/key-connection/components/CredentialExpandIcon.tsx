import type { MouseEvent } from 'react'
import type { ApiCredential } from '@/app/services/merchantGatewayApi'
import { cn } from '@lib/utils/cn'

interface CredentialExpandIconProps {
  record: ApiCredential
  expanded: boolean
  onExpand: (record: ApiCredential, event: MouseEvent<HTMLElement>) => void
}

// Giữ class của antd để nút trông y như icon mặc định, chỉ thay nhãn a11y
// tiếng Việt vì app chưa cấu hình locale cho Table.
export function CredentialExpandIcon({
  record,
  expanded,
  onExpand
}: CredentialExpandIconProps) {
  return (
    <button
      type='button'
      aria-label={expanded ? 'Thu gọn chi tiết key' : 'Xem chi tiết key'}
      aria-expanded={expanded}
      className={cn(
        'ant-table-row-expand-icon',
        expanded
          ? 'ant-table-row-expand-icon-expanded'
          : 'ant-table-row-expand-icon-collapsed'
      )}
      onClick={(event) => onExpand(record, event)}
    />
  )
}
