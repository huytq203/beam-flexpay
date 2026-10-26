import { useState } from 'react'
import { DialogModal, PickerTrigger } from '@components/index'
import { useAssignmentActions } from '../hooks/useAssignmentActions'
import type {
  AdminAssignment,
  AdminUserOption,
  AssignmentScope
} from '../types/merchantAssignment.types'
import { AdminUserPickerDialog } from './AdminUserPickerDialog'
import { AssignmentReasonField } from './AssignmentReasonField'

interface Props {
  scope: AssignmentScope
  assigned: readonly AdminAssignment[]
  onClose: () => void
}

export function AssignmentFormDialog({ scope, assigned, onClose }: Props) {
  const [admin, setAdmin] = useState<AdminUserOption>()
  const [reason, setReason] = useState('')
  const [picking, setPicking] = useState(false)
  const [adminError, setAdminError] = useState('')
  const action = useAssignmentActions({ scope, onDone: onClose })

  const submit = (): void => {
    if (!admin) return setAdminError('Chọn người được gán phụ trách')
    // POST idempotent nhưng vẫn ghi thêm một dòng audit, nên chặn gán trùng.
    if (assigned.some((row) => row.adminUserId === admin.id))
      return setAdminError(
        'Người này đã được gán trực tiếp ở cấp này, không cần gán lại'
      )
    setAdminError('')
    void action.assign(admin.id, reason)
  }

  return (
    <DialogModal
      open
      mode='CONFIRM'
      title='Gán Sales phụ trách'
      okText='Gán phụ trách'
      onOk={submit}
      onCancel={onClose}
      okButtonProps={{ loading: action.isLoading }}
    >
      <div className='space-y-3 text-sm'>
        <p className='text-muted-foreground'>{scope.label}</p>
        <PickerTrigger
          id='assignment-admin'
          label='Người phụ trách'
          required
          value={admin ? `${admin.name} (${admin.code})` : undefined}
          placeholder='Chọn người dùng nội bộ'
          error={adminError}
          onOpen={() => setPicking(true)}
        />
        <AssignmentReasonField
          id='assignment-reason'
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
      <AdminUserPickerDialog
        open={picking}
        selectedId={admin?.id}
        onCancel={() => setPicking(false)}
        onSelect={(user) => {
          setAdmin(user)
          setAdminError('')
          setPicking(false)
        }}
      />
    </DialogModal>
  )
}
