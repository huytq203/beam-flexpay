import { LockOutlined, UnlockOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import {
  LOCK_BUTTON_LABEL,
  UNLOCK_BUTTON_LABEL
} from '../constants/feePolicySchedule'
import { useSchedulePermissions } from '../hooks/useSchedulePermissions'
import {
  immediateActionFor,
  isSchedulablePolicy
} from '../utils/feePolicySchedule'

interface FeePolicyStatusButtonProps {
  status: string
  onChangeStatus: () => void
}

/**
 * Nút khóa / mở ở dòng chính sách đang hiệu lực hoặc ngừng áp dụng: mở dialog chọn làm ngay hay
 * hẹn giờ. Ẩn khi người dùng không có quyền cho đúng thao tác đảo trạng thái đó.
 */
export const FeePolicyStatusButton = ({
  status,
  onChangeStatus
}: FeePolicyStatusButtonProps) => {
  const { can } = useSchedulePermissions()
  if (!isSchedulablePolicy(status) || !can(immediateActionFor(status)))
    return null

  const isActive = status === 'ACTIVE'
  const label = isActive ? LOCK_BUTTON_LABEL : UNLOCK_BUTTON_LABEL

  return (
    <TooltipComponent title={label}>
      <ButtonComponent
        type='default'
        htmlType='button'
        size='small'
        aria-label={label}
        danger={!isActive}
        icon={isActive ? <UnlockOutlined /> : <LockOutlined />}
        onClick={onChangeStatus}
      />
    </TooltipComponent>
  )
}
