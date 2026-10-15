import type { TerminationResult } from '@type/merchant'
import { DialogModal, TagComponent } from '@components/index'

interface TerminateResultDialogProps {
  result: TerminationResult
  onClose: () => void
}

export function TerminateResultDialog({
  result,
  onClose
}: TerminateResultDialogProps) {
  return (
    <DialogModal
      open
      title='Đã chấm dứt hợp tác'
      onCancel={onClose}
      onOk={onClose}
      okText='Đóng'
      cancelButtonProps={{ style: { display: 'none' } }}
    >
      <p className='mb-3 text-sm'>
        {result.usersScopeShrunk} User bị gỡ khỏi phạm vi merchant này,{' '}
        {result.usersLeftWithoutScope} User không còn phạm vi nào (cần gán lại
        hoặc khóa).
      </p>
      <ul className='space-y-1 text-sm'>
        {result.affectedUsers.map((user) => (
          <li
            key={user.id}
            className='flex items-center gap-2'
          >
            <span>{user.email}</span>
            {user.leftWithoutScope && (
              <TagComponent color='warning'>Không còn phạm vi</TagComponent>
            )}
          </li>
        ))}
      </ul>
    </DialogModal>
  )
}
