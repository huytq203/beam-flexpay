import { Can } from '@/app/permissions'
import { UserSwitchOutlined } from '@components/icons'
import { ButtonComponent, TooltipComponent } from '@components/index'

interface Props {
  /** Tên hiển thị của dòng, ghép vào nhãn trợ năng. */
  name: string
  onClick: () => void
}

/** Nút "Sales phụ trách" trên dòng danh sách; chỉ hiện khi có quyền xem gán. */
export function AssignmentRowButton({ name, onClick }: Props) {
  return (
    <Can
      screen='MERCHANT_ASSIGNMENT'
      action='view'
    >
      <TooltipComponent title='Sales phụ trách'>
        <ButtonComponent
          aria-label={`Sales phụ trách ${name}`}
          size='small'
          type='default'
          htmlType='button'
          icon={<UserSwitchOutlined aria-hidden />}
          onClick={onClick}
        />
      </TooltipComponent>
    </Can>
  )
}
