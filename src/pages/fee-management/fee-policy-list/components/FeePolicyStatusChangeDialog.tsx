import { FormDatePicker, FormTextArea } from '@components/form'
import { ButtonComponent, DialogModal } from '@components/index'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@hooks/useMessage'
import { useChangeFeePolicyStatusMutation } from '@services/apiFeePolicy.api'
import type { FeePolicyScheduleAction } from '@type/fee.type'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { SCHEDULE_REASON_MAX_LENGTH } from '../constants/feePolicySchedule'
import {
  buildStatusChangeSchema,
  type FeePolicyStatusChangeFormValues
} from '../schemas/feePolicySchedule.schema'
import { immediateActionFor, toRunAtIso } from '../utils/feePolicySchedule'

export interface StatusChangePolicy {
  id: string
  name: string
  status: string
}

interface FeePolicyStatusChangeDialogProps {
  policy: StatusChangePolicy | null
  onClose: () => void
}

interface StatusChangeFormProps {
  policy: StatusChangePolicy
  onClose: () => void
}

const DIALOG_TITLE: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Mở khóa chính sách phí',
  DEACTIVATE: 'Khóa chính sách phí'
}

const IMMEDIATE_BUTTON: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Kích hoạt ngay',
  DEACTIVATE: 'Ngừng áp dụng ngay'
}

const IMMEDIATE_SUCCESS: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Đã kích hoạt chính sách phí',
  DEACTIVATE: 'Đã ngừng áp dụng chính sách phí'
}

const SCHEDULED_SUCCESS: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Đã hẹn giờ mở khóa chính sách phí',
  DEACTIVATE: 'Đã hẹn giờ khóa chính sách phí'
}

const WINDOW_SUCCESS: Readonly<Record<FeePolicyScheduleAction, string>> = {
  ACTIVATE: 'Đã đặt khoảng mở chính sách phí, hết khoảng sẽ tự khóa lại',
  DEACTIVATE: 'Đã đặt khoảng khóa chính sách phí, hết khoảng sẽ tự mở lại'
}

const StatusChangeForm = ({ policy, onClose }: StatusChangeFormProps) => {
  const { successMess } = useMessage()
  const [changeStatus, { isLoading }] = useChangeFeePolicyStatusMutation()

  // Hành động duy nhất hợp lệ là đảo trạng thái hiện tại (BE từ chối bật một chính sách đang bật),
  // nên không cho chọn: làm ngay hay hẹn giờ đều dùng hành động này.
  const immediateAction = immediateActionFor(policy.status)
  const schema = useMemo(
    () => buildStatusChangeSchema(immediateAction),
    [immediateAction]
  )

  const { control, handleSubmit } = useForm<FeePolicyStatusChangeFormValues>({
    defaultValues: {
      action: immediateAction,
      runAt: '',
      endAt: '',
      reason: ''
    },
    resolver: zodResolver(schema)
  })

  const runAt = useWatch({ control, name: 'runAt' })
  const reason = useWatch({ control, name: 'reason' }) ?? ''
  // Không chọn thời điểm = làm ngay.
  const isNow = !runAt

  const onSubmit = async (values: FeePolicyStatusChangeFormValues) => {
    const now = !values.runAt
    try {
      await changeStatus({
        policyId: policy.id,
        action: values.action,
        runAt: now ? undefined : toRunAtIso(values.runAt as string),
        endAt: values.endAt ? toRunAtIso(values.endAt) : undefined,
        reason: values.reason.trim()
      }).unwrap()
      successMess(
        values.endAt
          ? WINDOW_SUCCESS[values.action]
          : now
            ? IMMEDIATE_SUCCESS[values.action]
            : SCHEDULED_SUCCESS[values.action]
      )
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
      {/* Khoảng thời gian: một lần đặt, BE tạo cả bước bắt đầu và bước tự đảo lại khi kết thúc. */}
      <div className='grid grid-cols-1 gap-3 min-[400px]:grid-cols-2'>
        <FormDatePicker
          control={control}
          name='runAt'
          label='Bắt đầu'
          showTime
          className='flex flex-col'
          placeholder='DD/MM/YYYY HH:mm:ss'
        />
        <FormDatePicker
          control={control}
          name='endAt'
          label='Kết thúc'
          showTime
          className='flex flex-col'
          placeholder='DD/MM/YYYY HH:mm:ss'
        />
      </div>
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
          danger={isNow && immediateAction === 'DEACTIVATE'}
          content={isNow ? IMMEDIATE_BUTTON[immediateAction] : 'Xác nhận'}
          className='w-full'
          loading={isLoading}
        />
      </div>
    </form>
  )
}

/**
 * Dialog khóa hoặc mở khóa chính sách (theo trạng thái hiện tại): làm ngay hoặc hẹn giờ, luôn kèm lý do.
 * Form tự reset mỗi lần mở (destroyOnHidden của DialogModal).
 */
export const FeePolicyStatusChangeDialog = ({
  policy,
  onClose
}: FeePolicyStatusChangeDialogProps) => (
  <DialogModal
    open={Boolean(policy)}
    title={policy ? DIALOG_TITLE[immediateActionFor(policy.status)] : ''}
    footer={null}
    width={{ xs: '100%', sm: 480 }}
    closable={{ 'aria-label': 'Đóng' }}
    onOk={onClose}
    onCancel={onClose}
    content={
      policy ? (
        <StatusChangeForm
          policy={policy}
          onClose={onClose}
        />
      ) : null
    }
  />
)
