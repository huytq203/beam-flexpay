import { useState } from 'react'
import { Popover } from 'antd'
import dayjs from 'dayjs'
import {
  ButtonComponent,
  ReasonDialog,
  TooltipComponent
} from '@components/index'
import { CheckOutlined } from '@components/icons'
import { useMessage } from '@hooks/useMessage'
import {
  getCustomerSegmentName,
  useCustomerSegmentNames,
  type CustomerSegmentNames
} from '@hooks/useCustomerSegmentNames'
import {
  usePatchApproveAssignMutation,
  usePatchRejectAssignMutation
} from '@services/apiFeeAssignment'
import {
  getFeeApprovalDecision,
  MISSING_REVIEW_INFO_MESSAGE
} from '@utils/fee-approval'
import {
  PAYMENT_METHOD_LABELS,
  SERVICE_TYPE_LABELS,
  getFeeLabel
} from '@constants/feeLabels'
import type { FeeAssignment } from '@type/fee.type'
import { TYPEDATE } from '@constants/date.constant'

interface FeeAssignmentApprovalActionProps {
  assignment: FeeAssignment
}

const APPROVABLE_STATUS = 'INIT'

const EMPTY_VALUE = '—'

const getAssignmentScope = (
  assignment: FeeAssignment,
  customerSegmentNames: CustomerSegmentNames
) => {
  if (assignment.subjectId) {
    const subjectLabel =
      assignment.subjectType === 'MERCHANT' ? 'Merchant' : 'Người dùng'
    return `${subjectLabel} · ${assignment.subjectId}`
  }

  if (assignment.merchantId) return `Merchant · ${assignment.merchantId}`
  if (assignment.customerGroup) {
    return getCustomerSegmentName(
      assignment.customerGroup,
      customerSegmentNames
    )
  }

  return 'Áp dụng chung'
}

const formatEffectiveDate = (value: string | null) =>
  value ? dayjs.utc(value).format(TYPEDATE.fullTime) : EMPTY_VALUE

interface ReviewItemProps {
  label: string
  value: string
}

const ReviewItem = ({ label, value }: ReviewItemProps) => (
  <div className='min-w-0'>
    <dt className='text-[11px] leading-4 font-semibold tracking-[0.06em] text-muted-foreground uppercase'>
      {label}
    </dt>
    <dd className='mt-0.5 min-w-0 text-[13px] leading-5 font-medium break-words text-foreground'>
      {value}
    </dd>
  </div>
)

export const FeeAssignmentApprovalAction = ({
  assignment
}: FeeAssignmentApprovalActionProps) => {
  const [open, setOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [hasBeenProcessed, setHasBeenProcessed] = useState(false)
  const customerSegmentNames = useCustomerSegmentNames()
  const { successMess, errorMess } = useMessage()
  const [approveAssignment, { isLoading: isApproving }] =
    usePatchApproveAssignMutation()
  const [rejectAssignment, { isLoading: isRejecting }] =
    usePatchRejectAssignMutation()

  const isLoading = isApproving || isRejecting
  const isProcessed =
    hasBeenProcessed || assignment.status !== APPROVABLE_STATUS
  // BE dùng optimistic lock: duyệt phải kèm phiên bản + mã băm bản ghi đang xem.
  const approvalDecision = getFeeApprovalDecision(assignment)

  const settle = (message: string) => {
    setHasBeenProcessed(true)
    setIsRejectOpen(false)
    setOpen(false)
    successMess(message)
  }

  const handleApprove = async (): Promise<void> => {
    if (isLoading || isProcessed) return
    if (!approvalDecision) {
      errorMess(MISSING_REVIEW_INFO_MESSAGE)
      return
    }

    try {
      await approveAssignment({
        id: assignment.id,
        ...approvalDecision
      }).unwrap()
      settle('Phê duyệt gán phí thành công')
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  const handleReject = async (reason: string): Promise<void> => {
    if (isLoading || isProcessed) return

    try {
      await rejectAssignment({ id: assignment.id, reason }).unwrap()
      settle('Từ chối gán phí thành công')
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  const approvalContent = (
    <div className='flex max-h-[calc(100dvh-32px)] w-96 max-w-full min-w-0 flex-col gap-4 overflow-y-auto'>
      <div className='flex min-w-0 flex-col gap-1'>
        <p className='m-0 min-w-0 text-[13px] leading-5 break-words text-foreground'>
          Kiểm tra phạm vi và thời gian hiệu lực trước khi duyệt.
        </p>
      </div>

      <dl className='grid min-w-0 grid-cols-1 gap-x-4 gap-y-3 rounded-lg bg-muted/60 p-3 min-[420px]:grid-cols-2'>
        <ReviewItem
          label='Loại giao dịch'
          value={getFeeLabel(assignment.serviceType, SERVICE_TYPE_LABELS)}
        />
        <ReviewItem
          label='Phạm vi áp dụng'
          value={getAssignmentScope(assignment, customerSegmentNames)}
        />
        <ReviewItem
          label='Phương thức'
          value={getFeeLabel(
            assignment.paymentMethod,
            PAYMENT_METHOD_LABELS,
            EMPTY_VALUE
          )}
        />
        <ReviewItem
          label='Ngân hàng'
          value={assignment.bankCode ?? EMPTY_VALUE}
        />
        <ReviewItem
          label='Hiệu lực từ'
          value={formatEffectiveDate(assignment.effectiveFromDate)}
        />
        <ReviewItem
          label='Hiệu lực đến'
          value={formatEffectiveDate(assignment.effectiveToDate)}
        />
      </dl>

      {!approvalDecision && (
        <p
          role='alert'
          className='m-0 min-w-0 rounded-lg bg-danger/10 px-3 py-2 text-xs leading-4 break-words text-danger-strong'
        >
          {MISSING_REVIEW_INFO_MESSAGE}
        </p>
      )}

      <div className='grid grid-cols-1 gap-2 min-[384px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          danger
          content='Từ chối'
          className='order-2 w-full pointer-coarse:h-11! min-[384px]:order-none'
          loading={isRejecting}
          disabled={isLoading}
          onClick={() => setIsRejectOpen(true)}
        />
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Duyệt'
          className='order-1 w-full pointer-coarse:h-11! min-[384px]:order-none'
          loading={isApproving}
          disabled={isLoading || !approvalDecision}
          onClick={handleApprove}
        />
      </div>
    </div>
  )

  return (
    <>
      <Popover
        title='Kiểm tra và duyệt gán phí'
        content={approvalContent}
        trigger='click'
        placement='bottomRight'
        styles={{ root: { maxWidth: 'calc(100vw - 24px)' } }}
        open={!isProcessed && !isRejectOpen && open}
        onOpenChange={(nextOpen) => {
          if (!isLoading && !isProcessed) setOpen(nextOpen)
        }}
      >
        <span className='inline-flex'>
          <TooltipComponent title='Kiểm tra và duyệt'>
            <ButtonComponent
              aria-label={
                isProcessed ? 'Gán phí đã được xử lý' : 'Phê duyệt gán phí'
              }
              htmlType='button'
              type='default'
              size='small'
              icon={<CheckOutlined />}
              loading={isLoading}
              disabled={isProcessed || isLoading}
            />
          </TooltipComponent>
        </span>
      </Popover>
      <ReasonDialog
        open={isRejectOpen}
        title='Từ chối duyệt gán phí'
        description='Thiết lập gán phí này sẽ chuyển sang trạng thái bị từ chối.'
        label='Lý do từ chối'
        placeholder='Ví dụ: sai ngân hàng áp dụng, trùng với gán phí đang hoạt động'
        okText='Xác nhận từ chối'
        danger
        confirmLoading={isRejecting}
        onConfirm={handleReject}
        onCancel={() => setIsRejectOpen(false)}
      />
    </>
  )
}

export default FeeAssignmentApprovalAction
