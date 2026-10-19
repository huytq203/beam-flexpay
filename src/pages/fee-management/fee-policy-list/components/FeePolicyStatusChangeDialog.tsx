import {
  FormDatePicker,
  FormRadio,
  FormSelect,
  FormTextArea
} from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@hooks/useMessage'
import { useChangeFeePolicyStatusMutation } from '@services/apiFeePolicy.api'
import type { FeePolicyScheduleAction } from '@type/fee.type'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  SCHEDULE_ACTION_LABEL,
  SCHEDULE_REASON_MAX_LENGTH,
  STATUS_CHANGE_TIMING,
  STATUS_CHANGE_TIMING_OPTIONS
} from '../constants/feePolicySchedule'
import {
  feePolicyStatusChangeSchema,
  type FeePolicyStatusChangeFormValues
} from '../schemas/feePolicySchedule.schema'
import {
  defaultScheduleAction,
  immediateActionFor,
  toRunAtIso
} from '../utils/feePolicySchedule'

export interface StatusChangePolicy {
  id: string
  name: string
  status: string
}

interface FeePolicyStatusChangeDialogProps {
  policy: StatusChangePolicy | null
  allowedActions: readonly FeePolicyScheduleAction[]
  onClose: () => void
}

interface StatusChangeFormProps {
  policy: StatusChangePolicy
  allowedActions: readonly FeePolicyScheduleAction[]
  onClose: () => void
}

const IMMEDIATE_EFFECT: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'sẽ bắt đầu áp vào giao dịch thật ngay khi xác nhận.',
  DEACTIVATE: 'sẽ ngừng áp dụng cho giao dịch mới ngay khi xác nhận.'
}

const IMMEDIATE_BUTTON: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Kích hoạt ngay',
  DEACTIVATE: 'Ngừng áp dụng ngay'
}

const IMMEDIATE_SUCCESS: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Đã kích hoạt chính sách phí',
  DEACTIVATE: 'Đã ngừng áp dụng chính sách phí'
}

const StatusChangeForm = ({
  policy,
  allowedActions,
  onClose
}: StatusChangeFormProps) => {
  const { successMess } = useMessage()
  const [changeStatus, { isLoading }] = useChangeFeePolicyStatusMutation()

  // Làm ngay chỉ có một hành động hợp lệ: đảo trạng thái hiện tại (BE từ chối bật một chính sách đang bật).
  const immediateAction = immediateActionFor(policy.status)
  const canActNow = allowedActions.includes(immediateAction)

  const { control, handleSubmit, setValue } =
    useForm<FeePolicyStatusChangeFormValues>({
      defaultValues: {
        action: canActNow
          ? immediateAction
          : defaultScheduleAction(policy.status, allowedActions),
        timing: canActNow
          ? STATUS_CHANGE_TIMING.NOW
          : STATUS_CHANGE_TIMING.SCHEDULE,
        runAt: '',
        reason: ''
      },
      resolver: zodResolver(feePolicyStatusChangeSchema)
    })

  const timing = useWatch({ control, name: 'timing' })
  const action = useWatch({ control, name: 'action' })
  const reason = useWatch({ control, name: 'reason' }) ?? ''
  const isNow = timing === STATUS_CHANGE_TIMING.NOW

  // Chuyển sang "Thực hiện ngay" thì hành động về đúng hành động làm ngay được.
  useEffect(() => {
    if (isNow) setValue('action', immediateAction)
  }, [isNow, immediateAction, setValue])

  const actionOptions = (isNow ? [immediateAction] : allowedActions).map(
    (value) => ({ value, label: SCHEDULE_ACTION_LABEL[value] })
  )

  const onSubmit = async (values: FeePolicyStatusChangeFormValues) => {
    const now = values.timing === STATUS_CHANGE_TIMING.NOW
    try {
      await changeStatus({
        policyId: policy.id,
        action: values.action,
        runAt: now || !values.runAt ? undefined : toRunAtIso(values.runAt),
        reason: values.reason.trim()
      }).unwrap()
      successMess(now ? IMMEDIATE_SUCCESS[values.action] : 'Đã tạo lịch hẹn giờ')
      onClose()
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className='flex flex-col gap-3 pt-2'
      noValidate
    >
      <FormRadio
        control={control}
        name='timing'
        label='Thời điểm'
        className='flex flex-col'
        options={STATUS_CHANGE_TIMING_OPTIONS.map((option) => ({
          ...option,
          disabled: option.value === STATUS_CHANGE_TIMING.NOW && !canActNow
        }))}
      />
      <FormSelect
        control={control}
        name='action'
        label='Hành động'
        required
        allowClear={false}
        disabled={isNow}
        className='flex flex-col'
        options={actionOptions}
      />
      {isNow ? (
        <p className='m-0 text-sm text-muted-foreground'>
          Chính sách “{policy.name}” {IMMEDIATE_EFFECT[action ?? immediateAction]}
        </p>
      ) : (
        <FormDatePicker
          control={control}
          name='runAt'
          label='Thời điểm chạy'
          required
          showTime
          className='flex flex-col'
          placeholder='DD/MM/YYYY HH:mm:ss'
        />
      )}
      <FormTextArea
        control={control}
        name='reason'
        label='Lý do'
        placeholder='Nhập lý do...'
        maxLength={SCHEDULE_REASON_MAX_LENGTH}
        className='flex flex-col'
      />
      {/* Bộ đếm nằm trong luồng (không dùng showCount tuyệt đối của antd) để không đè lỗi hay nút bên dưới. */}
      <p className='m-0 -mt-2 mb-1 text-right text-xs tabular-nums text-muted-foreground'>
        {reason.length} / {SCHEDULE_REASON_MAX_LENGTH}
      </p>
      <div className='grid grid-cols-1 gap-2 min-[400px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Hủy bỏ'
          className='w-full'
          disabled={isLoading}
          onClick={onClose}
        />
        <ButtonComponent
          htmlType='submit'
          type='primary'
          danger={isNow && action === 'DEACTIVATE'}
          content={isNow ? IMMEDIATE_BUTTON[action ?? immediateAction] : 'Hẹn giờ'}
          className='w-full'
          loading={isLoading}
        />
      </div>
    </form>
  )
}

/**
 * Một dialog cho khóa / mở chính sách: làm ngay hoặc hẹn giờ, luôn kèm lý do.
 * Form tự reset mỗi lần mở (destroyOnHidden của DialogModal).
 */
export const FeePolicyStatusChangeDialog = ({
  policy,
  allowedActions,
  onClose
}: FeePolicyStatusChangeDialogProps) => (
  <DialogModal
    open={Boolean(policy)}
    title='Khóa / mở chính sách phí'
    footer={null}
    width={{ xs: '100%', sm: 480 }}
    closable={{ 'aria-label': 'Đóng' }}
    onOk={onClose}
    onCancel={onClose}
    content={
      policy ? (
        <StatusChangeForm
          policy={policy}
          allowedActions={allowedActions}
          onClose={onClose}
        />
      ) : null
    }
  />
)
