import type { TagProps } from 'antd'
import {
  StatusToneBadge,
  type StatusTone
} from '@components/status-badge/StatusToneBadge'

export interface TagComponentProps extends TagProps {
  className?: string
}

const TONE_BY_COLOR: Record<string, StatusTone> = {
  success: 'success',
  green: 'success',
  error: 'danger',
  danger: 'danger',
  red: 'danger',
  warning: 'warning',
  orange: 'warning',
  gold: 'warning',
  yellow: 'warning',
  processing: 'info',
  info: 'info',
  blue: 'info',
  cyan: 'info',
  geekblue: 'info',
  purple: 'info',
  magenta: 'info'
}

/** Tag dùng chung một kiểu badge của hệ thống; màu antd được quy về tông chuẩn. */
const TagComponent = ({
  color,
  icon,
  className,
  style,
  children
}: TagComponentProps) => (
  <StatusToneBadge
    tone={(color && TONE_BY_COLOR[color]) || 'normal'}
    className={className}
  >
    <span style={style}>
      {icon}
      {children}
    </span>
  </StatusToneBadge>
)

export default TagComponent
