import { useScreenAccess } from '@/app/permissions'
import { CheckCircleOutlined, ClockIcon, StopOutlined } from '@components/icons'
import { ButtonComponent, DropDownComponent } from '@components/index'
import type { MenuProps } from 'antd'
import { useSchedulePermissions } from '../hooks/useSchedulePermissions'
import { isSchedulablePolicy } from '../utils/feePolicySchedule'

interface FeePolicyStatusMenuProps {
  status: string
  busy?: boolean
  onActivate: () => void
  onDeactivate: () => void
  onSchedule: () => void
}

/**
 * Gộp các thao tác vòng đời của chính sách đang hiệu lực / ngừng áp dụng vào một
 * menu: đổi trạng thái ngay hoặc hẹn giờ. Mỗi mục tự ẩn theo quyền của nó.
 */
export const FeePolicyStatusMenu = ({
  status,
  busy = false,
  onActivate,
  onDeactivate,
  onSchedule
}: FeePolicyStatusMenuProps) => {
  const { can } = useScreenAccess('FEE_CONFIG')
  const { canSchedule } = useSchedulePermissions()

  const items: NonNullable<MenuProps['items']> = []
  if (status === 'ACTIVE' && can('deactivate')) {
    items.push({
      key: 'deactivate',
      danger: true,
      icon: <StopOutlined />,
      label: 'Ngừng áp dụng ngay',
      onClick: onDeactivate
    })
  }
  if (status === 'INACTIVE' && can('activate')) {
    items.push({
      key: 'activate',
      icon: <CheckCircleOutlined />,
      label: 'Kích hoạt ngay',
      onClick: onActivate
    })
  }
  if (canSchedule && isSchedulablePolicy(status)) {
    items.push({
      key: 'schedule',
      icon: (
        <ClockIcon
          size={16}
          weight='bold'
          aria-hidden
        />
      ),
      label: 'Hẹn giờ khóa / mở',
      onClick: onSchedule
    })
  }
  if (items.length === 0) return null

  return (
    <DropDownComponent
      items={items}
      content={
        <ButtonComponent
          type='default'
          htmlType='button'
          size='small'
          aria-label='Thao tác trạng thái chính sách'
          danger={status === 'ACTIVE'}
          loading={busy}
          icon={
            status === 'ACTIVE' ? <StopOutlined /> : <CheckCircleOutlined />
          }
        />
      }
    />
  )
}
