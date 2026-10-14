import { ClockIcon } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'
import { useSchedulePermissions } from '../hooks/useSchedulePermissions'
import { isSchedulablePolicy } from '../utils/feePolicySchedule'

interface FeePolicyScheduleRowActionProps {
  status: string
  onClick: () => void
}

/** Nút hẹn giờ ở dòng chính sách; ẩn khi thiếu cả hai quyền hoặc chính sách chưa ACTIVE/INACTIVE. */
export const FeePolicyScheduleRowAction = ({
  status,
  onClick
}: FeePolicyScheduleRowActionProps) => {
  const { canSchedule } = useSchedulePermissions()
  if (!canSchedule || !isSchedulablePolicy(status)) return null

  return (
    <TooltipComponent title='Hẹn giờ khóa / mở'>
      <ButtonComponent
        type='default'
        htmlType='button'
        size='small'
        aria-label='Hẹn giờ khóa / mở'
        icon={
          <ClockIcon
            size={16}
            weight='bold'
            aria-hidden
          />
        }
        onClick={onClick}
      />
    </TooltipComponent>
  )
}
