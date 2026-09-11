import { useState } from 'react'
import { Popover } from 'antd'
import { ButtonComponent, ReasonDialog } from '@components/index'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined
} from '@components/icons'
import { useMessage } from '@hooks/useMessage'
import {
  usePatchApproveFeePolicyMutation,
  usePatchRejectFeePolicyMutation
} from '@services/apiFeePolicy.api'
import {
  getFeeApprovalDecision,
  MISSING_REVIEW_INFO_MESSAGE
} from '@utils/fee-approval'
import type { FeePolicy } from '@type/fee.type'

interface FeePolicyApprovalActionProps {
  policy: FeePolicy
}

export const FeePolicyApprovalAction = ({ policy }: FeePolicyApprovalActionProps) => {
  const [open, setOpen] = useState(false)
  const [isRejectOpen, setIsRejectOpen] = useState(false)
  const [hasBeenProcessed, setHasBeenProcessed] = useState(false)
  const { successMess, errorMess } = useMessage()
  const [approveFeePolicy, { isLoading: isApproving }] =
    usePatchApproveFeePolicyMutation()
  const [rejectFeePolicy, { isLoading: isRejecting }] =
    usePatchRejectFeePolicyMutation()

  const isLoading = isApproving || isRejecting
  const isProcessed = hasBeenProcessed || policy.status !== 'INIT'
  // BE dùng optimistic lock: duyệt phải kèm phiên bản + mã băm bản ghi đang xem.
  const approvalDecision = getFeeApprovalDecision(policy)

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
      await approveFeePolicy({ id: policy.id, ...approvalDecision }).unwrap()
      settle('Phê duyệt chính sách phí thành công')
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  const handleReject = async (reason: string): Promise<void> => {
    if (isLoading || isProcessed) return

    try {
      await rejectFeePolicy({ id: policy.id, reason }).unwrap()
      settle('Từ chối chính sách phí thành công')
    } catch {
      // fetchBaseQueryCustom đã bắn notification lỗi tập trung.
    }
  }

  const approvalContent = (
    <div className='flex w-80 max-w-full min-w-0 flex-col gap-3'>
      <div className='flex min-w-0 flex-col gap-1'>
        <p className='m-0 max-h-25 min-w-0 overflow-y-auto text-[13px] leading-5 break-words text-foreground'>
          Chọn kết quả xử lý cho chính sách{' '}
          <span className='font-semibold'>“{policy.name}”</span>.
        </p>
        {approvalDecision ? (
          <p className='m-0 min-w-0 text-xs leading-4 break-words text-muted-foreground'>
            Phiên bản{' '}
            <span className='tabular-nums'>
              #{approvalDecision.expectedLockVersion}
            </span>{' '}
            · Mã kiểm duyệt{' '}
            <span className='font-mono'>
              {approvalDecision.expectedReviewHash.slice(0, 8)}
            </span>
          </p>
        ) : (
          <p className='m-0 min-w-0 text-xs leading-4 break-words text-danger-strong'>
            {MISSING_REVIEW_INFO_MESSAGE}
          </p>
        )}
      </div>
      <div className='grid grid-cols-1 gap-2 min-[384px]:grid-cols-2'>
        <ButtonComponent
          htmlType='button'
          type='primary'
          danger
          content='Từ chối duyệt'
          icon={<CloseCircleOutlined />}
          className='order-2 w-full pointer-coarse:h-11! min-[384px]:order-none'
          loading={isRejecting}
          disabled={isLoading}
          onClick={() => setIsRejectOpen(true)}
        />
        <ButtonComponent
          htmlType='button'
          type='primary'
          content='Duyệt phí'
          icon={<CheckCircleOutlined />}
          className='order-1 w-full pointer-coarse:h-11! min-[384px]:order-none'
          loading={isApproving}
          disabled={isLoading || !approvalDecision}
          onClick={handleApprove}
        />
      </div>
      <ButtonComponent
        htmlType='button'
        type='text'
        content='Hủy bỏ'
        className='w-full pointer-coarse:h-11! min-[384px]:w-auto min-[384px]:self-center'
        disabled={isLoading}
        onClick={() => setOpen(false)}
      />
    </div>
  )

  return (
    <>
      <Popover
        title='Phê duyệt chính sách'
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
          <ButtonComponent
            aria-label={
              isProcessed ? 'Chính sách đã được xử lý' : 'Phê duyệt chính sách'
            }
            title={
              isProcessed
                ? 'Chính sách đã được phê duyệt hoặc từ chối'
                : 'Phê duyệt chính sách'
            }
            htmlType='button'
            type='default'
            size='small'
            icon={<SafetyOutlined />}
            loading={isLoading}
            disabled={isProcessed || isLoading}
          />
        </span>
      </Popover>
      <ReasonDialog
        open={isRejectOpen}
        title='Từ chối duyệt chính sách phí'
        description={`Chính sách “${policy.name}” sẽ chuyển sang trạng thái bị từ chối.`}
        label='Lý do từ chối'
        placeholder='Ví dụ: sai bậc phí luỹ tiến, chờ xác nhận lại với đối tác'
        okText='Xác nhận từ chối'
        danger
        confirmLoading={isRejecting}
        onConfirm={handleReject}
        onCancel={() => setIsRejectOpen(false)}
      />
    </>
  )
}

export default FeePolicyApprovalAction
