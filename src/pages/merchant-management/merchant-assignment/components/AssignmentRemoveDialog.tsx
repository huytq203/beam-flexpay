import { useState } from 'react'
import { DialogModal } from '@components/index'
import { useAssignmentActions } from '../hooks/useAssignmentActions'
import type {
  AdminAssignment,
  AssignmentScope
} from '../types/merchantAssignment.types'
import { AdminUserName } from './AdminUserName'
import { AssignmentReasonField } from './AssignmentReasonField'

interface Props {
  scope: AssignmentScope
  assignment: AdminAssignment
  onClose: () => void
}

export function AssignmentRemoveDialog({ scope, assignment, onClose }: Props) {
  const [reason, setReason] = useState('')
  const action = useAssignmentActions({ scope, onDone: onClose })

  return (
    <DialogModal
      open
      mode='DELETE'
      title='Gỡ Sales phụ trách'
      okText='Gỡ phụ trách'
      onOk={() => void action.remove(assignment.adminUserId, reason)}
      onCancel={onClose}
      okButtonProps={{ loading: action.isLoading }}
    >
      <div className='space-y-3 text-sm'>
        <p className='text-muted-foreground'>{scope.label}</p>
        <AdminUserName userId={assignment.adminUserId} />
        <p className='text-muted-foreground'>
          Người này sẽ mất quyền chạm tới dữ liệu chỉ có được nhờ dòng gán này.
          Dòng gán ở cấp khác của cùng người không bị ảnh hưởng.
        </p>
        <AssignmentReasonField
          id='assignment-remove-reason'
          value={reason}
          onChange={(value) => {
            setReason(value)
            action.clearError()
          }}
        />
        {action.error && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {action.error}
          </p>
        )}
      </div>
    </DialogModal>
  )
}
