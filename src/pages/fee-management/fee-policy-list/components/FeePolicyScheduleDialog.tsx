import { FormDatePicker, FormSelect, FormTextArea } from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@hooks/useMessage'
import { useCreateFeePolicyScheduleMutation } from '@services/apiFeePolicy.api'
import type { FeePolicyScheduleAction } from '@type/fee.type'
import { useForm } from 'react-hook-form'
import {
  SCHEDULE_ACTION_LABEL,
  SCHEDULE_REASON_MAX_LENGTH
} from '../constants/feePolicySchedule'
import {
  feePolicyScheduleSchema,
  type FeePolicyScheduleFormValues
} from '../schemas/feePolicySchedule.schema'
import { defaultScheduleAction, toRunAtIso } from '../utils/feePolicySchedule'

export interface SchedulingPolicy {
  id: string
  name: string
  status: string
}

interface FeePolicyScheduleDialogProps {
  policy: SchedulingPolicy | null
  allowedActions: readonly FeePolicyScheduleAction[]
  onClose: () => void
}

interface ScheduleFormProps {
  policy: SchedulingPolicy
  allowedActions: readonly FeePolicyScheduleAction[]
  onClose: () => void
}

const ScheduleForm = ({
  policy,
  allowedActions,
  onClose
}: ScheduleFormProps) => {
  const { successMess } = useMessage()
  const [createSchedule, { isLoading }] = useCreateFeePolicyScheduleMutation()
  const { control, handleSubmit } = useForm<FeePolicyScheduleFormValues>({
    defaultValues: {
      action: defaultScheduleAction(policy.status, allowedActions),
      runAt: '',
      reason: ''
    },
    resolver: zodResolver(feePolicyScheduleSchema)
  })

  const onSubmit = async (values: FeePolicyScheduleFormValues) => {
    try {
      await createSchedule({
        policyId: policy.id,
        action: values.action,
        runAt: toRunAtIso(values.runAt),
        reason: values.reason.trim()
      }).unwrap()
      successMess('Đã tạo lịch hẹn giờ')
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
        options={allowedActions.map((action) => ({
          value: action,
          label: SCHEDULE_ACTION_LABEL[action]
        }))}
      />
      <FormDatePicker
        control={control}
        name='runAt'
        label='Thời điểm chạy'
        required
        showTime
        className='flex flex-col'
        placeholder='DD/MM/YYYY HH:mm:ss'
      />
      <FormTextArea
        control={control}
        name='reason'
        label='Lý do'
        placeholder='Nhập lý do...'
        maxLength={SCHEDULE_REASON_MAX_LENGTH}
        showCount
        className='flex flex-col'
      />
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
          content='Hẹn giờ'
          className='w-full'
          loading={isLoading}
        />
      </div>
    </form>
  )
}

/** Dialog tạo lịch hẹn giờ khóa / mở một chính sách; form tự reset mỗi lần mở (destroyOnHidden). */
export const FeePolicyScheduleDialog = ({
  policy,
  allowedActions,
  onClose
}: FeePolicyScheduleDialogProps) => (
  <DialogModal
    open={Boolean(policy)}
    title='Hẹn giờ khóa / mở chính sách phí'
    footer={null}
    width={{ xs: '100%', sm: 480 }}
    closable={{ 'aria-label': 'Đóng' }}
    onOk={onClose}
    onCancel={onClose}
    content={
      policy ? (
        <ScheduleForm
          policy={policy}
          allowedActions={allowedActions}
          onClose={onClose}
        />
      ) : null
    }
  />
)
