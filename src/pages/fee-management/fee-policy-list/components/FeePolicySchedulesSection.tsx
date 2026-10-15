import { SectionHeading } from '@pages/fee-management/fee-config/components/SectionHeading'
import { ButtonComponent, DialogModal } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import {
  useCancelFeePolicyScheduleMutation,
  useGetFeePolicySchedulesQuery
} from '@services/apiFeePolicy.api'
import type { FeePolicySchedule } from '@type/fee.type'
import { cn } from '@lib/utils/cn'
import { useState } from 'react'
import {
  SCHEDULE_ACTION_LABEL,
  SCHEDULE_STATUS_LABEL,
  SCHEDULE_STATUS_TONE
} from '../constants/feePolicySchedule'
import { useSchedulePermissions } from '../hooks/useSchedulePermissions'
import { formatScheduleTime } from '../utils/feePolicySchedule'

interface FeePolicySchedulesSectionProps {
  policyId: string
}

interface ScheduleItemProps {
  schedule: FeePolicySchedule
  canCancel: boolean
  onCancel: (schedule: FeePolicySchedule) => void
}

const ScheduleStatusTag = ({
  status
}: {
  status: FeePolicySchedule['status']
}) => (
  <span
    className={cn(
      'inline-flex w-fit items-center rounded-md px-2 py-0.5',
      'text-[11px] font-semibold uppercase tracking-wide',
      SCHEDULE_STATUS_TONE[status] ?? 'bg-muted text-muted-foreground'
    )}
  >
    {SCHEDULE_STATUS_LABEL[status] ?? status}
  </span>
)

const ScheduleItem = ({ schedule, canCancel, onCancel }: ScheduleItemProps) => {
  const showResult =
    (schedule.status === 'SKIPPED' || schedule.status === 'FAILED') &&
    Boolean(schedule.resultMessage)

  return (
    <li className='flex flex-wrap items-start justify-between gap-3 px-3 py-2.5'>
      <div className='flex min-w-0 flex-col gap-1 text-[13px] text-foreground'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='font-semibold'>
            {SCHEDULE_ACTION_LABEL[schedule.action] ?? schedule.action}
          </span>
          <span className='tabular-nums'>
            {formatScheduleTime(schedule.runAt)}
          </span>
          <ScheduleStatusTag status={schedule.status} />
        </div>
        <span className='break-words text-muted-foreground'>
          Lý do: {schedule.reason}
        </span>
        <span className='text-muted-foreground'>
          Người hẹn: {schedule.scheduledBy}
        </span>
        {showResult && (
          <span className='break-words text-danger-strong'>
            Kết quả: {schedule.resultMessage}
          </span>
        )}
      </div>
      {schedule.status === 'PENDING' && canCancel && (
        <ButtonComponent
          type='default'
          htmlType='button'
          size='small'
          danger
          content='Huỷ'
          aria-label={`Huỷ lịch ${SCHEDULE_ACTION_LABEL[schedule.action]}`}
          onClick={() => onCancel(schedule)}
        />
      )}
    </li>
  )
}

/** Danh sách lịch hẹn giờ của một chính sách; chỉ gọi API khi component được mount (dòng được mở). */
export const FeePolicySchedulesSection = ({
  policyId
}: FeePolicySchedulesSectionProps) => {
  const { successMess } = useMessage()
  const { can } = useSchedulePermissions()
  const { data, isLoading, isError, refetch } = useGetFeePolicySchedulesQuery({
    policyId
  })
  const [cancelSchedule, { isLoading: isCancelling }] =
    useCancelFeePolicyScheduleMutation()
  const [cancelling, setCancelling] = useState<FeePolicySchedule | null>(null)

  const confirmCancel = async () => {
    if (!cancelling) return
    try {
      await cancelSchedule({ policyId, scheduleId: cancelling.id }).unwrap()
      successMess('Đã huỷ lịch hẹn giờ')
      setCancelling(null)
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  const renderBody = () => {
    if (isLoading) {
      return (
        <p className='text-[13px] text-muted-foreground'>
          Đang tải lịch hẹn giờ...
        </p>
      )
    }
    if (isError) {
      return (
        <div className='flex items-center gap-3 text-[13px]'>
          <span className='text-danger-strong'>
            Không tải được lịch hẹn giờ.
          </span>
          <ButtonComponent
            type='default'
            htmlType='button'
            size='small'
            content='Thử lại'
            onClick={() => refetch()}
          />
        </div>
      )
    }
    // Lịch đã chạy xong không còn việc gì để làm nên không cần liệt kê.
    const visible = data?.filter(({ status }) => status !== 'DONE') ?? []
    if (visible.length === 0) {
      return (
        <p className='text-[13px] text-muted-foreground'>
          Chính sách chưa có lịch hẹn giờ nào.
        </p>
      )
    }
    return (
      <ul className='m-0 list-none divide-y divide-border overflow-hidden rounded-lg border border-border p-0'>
        {visible.map((schedule) => (
          <ScheduleItem
            key={schedule.id}
            schedule={schedule}
            canCancel={can(schedule.action)}
            onCancel={setCancelling}
          />
        ))}
      </ul>
    )
  }

  return (
    <div>
      <SectionHeading>Lịch hẹn giờ</SectionHeading>
      {renderBody()}
      <DialogModal
        open={Boolean(cancelling)}
        title='Huỷ lịch hẹn giờ'
        okText='Huỷ lịch'
        cancelText='Giữ lại'
        confirmLoading={isCancelling}
        onOk={confirmCancel}
        onCancel={() => setCancelling(null)}
        content={
          cancelling
            ? `Huỷ lịch “${SCHEDULE_ACTION_LABEL[cancelling.action]}” lúc ${formatScheduleTime(cancelling.runAt)}?`
            : null
        }
      />
    </div>
  )
}
