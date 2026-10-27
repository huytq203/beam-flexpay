import { useState } from 'react'
import {
  DialogModal,
  MerchantPickerDialog,
  PickerTrigger,
  Radio,
  SubMerchantPickerDialog,
  describePicked,
  toPickedEntity,
  type PickedEntity
} from '@components/index'
import { ASSIGNMENT_LEVEL_LABELS } from '../constants/merchantAssignment.constants'
import { useAssignmentActions } from '../hooks/useAssignmentActions'
import type { AssignmentLevel } from '../types/merchantAssignment.types'
import { toMasterScope, toSubScope } from '../utils/merchantAssignment.utils'
import { AssignmentReasonField } from './AssignmentReasonField'
import { UserAssignmentsList } from './UserAssignmentsList'

interface Props {
  /** `id` = Keycloak subject của tài khoản nội bộ, đúng giá trị `adminUserId` của BE. */
  user: { id: string; label: string }
  onClose: () => void
}

const LEVEL_OPTIONS = (['master', 'sub'] as const).map((level) => ({
  value: level,
  label: ASSIGNMENT_LEVEL_LABELS[level]
}))

/** Gán một người nội bộ làm Sales phụ trách Master/Sub-merchant và xem họ đang phụ trách gì. */
export function UserAssignmentDialog({ user, onClose }: Props) {
  const [level, setLevel] = useState<AssignmentLevel>('master')
  const [target, setTarget] = useState<PickedEntity>()
  const [reason, setReason] = useState('')
  const [picking, setPicking] = useState(false)
  const [targetError, setTargetError] = useState('')
  const scope = target
    ? (level === 'sub' ? toSubScope : toMasterScope)(target)
    : undefined
  const action = useAssignmentActions({ scope, onDone: onClose })
  const levelLabel = ASSIGNMENT_LEVEL_LABELS[level]

  const submit = (): void => {
    if (!target) return setTargetError(`Chọn ${levelLabel} cần gán phụ trách`)
    setTargetError('')
    void action.assign(user.id, reason)
  }

  const select = (value: PickedEntity): void => {
    setTarget(toPickedEntity(value))
    setTargetError('')
    setPicking(false)
  }

  return (
    <DialogModal
      open
      mode='CONFIRM'
      title='Gán phụ trách merchant'
      okText='Gán phụ trách'
      onOk={submit}
      onCancel={onClose}
      okButtonProps={{ loading: action.isLoading }}
    >
      <div className='space-y-3 text-sm'>
        <p className='text-muted-foreground'>
          Người phụ trách:{' '}
          <strong className='text-foreground'>{user.label}</strong>
        </p>
        <div className='flex flex-col gap-1'>
          <span className='font-medium text-foreground'>Cấp phụ trách</span>
          <Radio.Group
            aria-label='Cấp phụ trách'
            options={LEVEL_OPTIONS}
            value={level}
            onChange={(event) => {
              setLevel(event.target.value as AssignmentLevel)
              setTarget(undefined)
              setTargetError('')
            }}
          />
        </div>
        <PickerTrigger
          id='user-assignment-target'
          label={levelLabel}
          required
          value={describePicked(target)}
          placeholder={`Chọn ${levelLabel}`}
          error={targetError}
          onOpen={() => setPicking(true)}
        />
        <AssignmentReasonField
          id='user-assignment-reason'
          value={reason}
          onChange={(value) => {
            setReason(value)
            action.clearError()
          }}
        />
        <UserAssignmentsList userId={user.id} />
        {action.error && (
          <p
            role='alert'
            className='text-danger-strong'
          >
            {action.error}
          </p>
        )}
      </div>
      <MerchantPickerDialog
        open={picking && level === 'master'}
        selectedId={target?.id}
        onCancel={() => setPicking(false)}
        onSelect={select}
      />
      <SubMerchantPickerDialog
        open={picking && level === 'sub'}
        selectedId={target?.id}
        onCancel={() => setPicking(false)}
        onSelect={select}
      />
    </DialogModal>
  )
}
