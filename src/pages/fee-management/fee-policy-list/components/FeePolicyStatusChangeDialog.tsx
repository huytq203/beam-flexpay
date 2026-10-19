import { FormDatePicker, FormSelect, FormTextArea } from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@hooks/useMessage'
import { useChangeFeePolicyStatusMutation } from '@services/apiFeePolicy.api'
import type { FeePolicyScheduleAction } from '@type/fee.type'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  SCHEDULE_ACTION_LABEL,
  SCHEDULE_REASON_MAX_LENGTH
} from '../constants/feePolicySchedule'
import {
  buildStatusChangeSchema,
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
  const schema = useMemo(() => buildStatusChangeSchema(immediateAction), [immediateAction])

  const { control, handleSubmit } = useForm<FeePolicyStatusChangeFormValues>({
    defaultValues: {
      action: allowedActions.includes(immediateAction)
        ? immediateAction
        : defaultScheduleAction(policy.status, allowedActions),
      runAt: '',
      reason: ''
    },
    resolver: zodResolver(schema)
  })

  const action = useWatch({ control, name: 'action' })
  const runAt = useWatch({ control, name: 'runAt' })
  const reason = useWatch({ control, name: 'reason' }) ?? ''
  // Không chọn thời điểm = làm ngay; chỉ đúng khi hành động là hành động làm ngay được.
  const isNow = !runAt && action === immediateAction

  const onSubmit = async (values: FeePolicyStatusChangeFormValues) => {
    const now = !values.runAt
    try {
      await changeStatus({
        policyId: policy.id,
        action: values.action,
        runAt: now ? undefined : toRunAtIso(values.runAt as string),
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
      <FormSelect
        control={control}
        name='action'
        label='Hành động'
        required
        allowClear={false}
        className='flex flex-col'
        options={allowedActions.map((value) => ({
          value,
          label: SCHEDULE_ACTION_LABEL[value]
        }))}
      />
      <FormDatePicker
        control={control}
        name='runAt'
        label='Thời điểm chạy'
        showTime
        className='flex flex-col'
        placeholder='DD/MM/YYYY HH:mm:ss'
      />
      <p className='m-0 -mt-2 text-xs text-muted-foreground'>
        {isNow
          ? `Bỏ trống để thực hiện ngay: chính sách “${policy.name}” ${IMMEDIATE_EFFECT[immediateAction]}`
          : 'Thao tác chạy đúng thời điểm đã chọn. Bỏ trống để thực hiện ngay.'}
      </p>
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
          content={isNow ? IMMEDIATE_BUTTON[immediateAction] : 'Hẹn giờ'}
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
