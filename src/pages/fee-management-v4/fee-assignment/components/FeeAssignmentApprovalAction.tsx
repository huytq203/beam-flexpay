import { useState } from 'react'
import { Popover } from 'antd'
import { ButtonComponent } from '@components/index'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SafetyOutlined
} from '@components/icons'
import { useMessage } from '@hooks/useMessage'
import {
  usePatchApproveAssignMutation,
  usePatchRejectAssignMutation
} from '@services/apiFeeAssignment'
import type { FeeAssignment } from '../constants/feeAssignment'

interface FeeAssignmentApprovalActionProps {
  assignment: FeeAssignment
}

type Decision = 'approve' | 'reject'

const APPROVABLE_STATUS = 'INIT'

const getErrorMessage = (error: unknown, decision: Decision): string => {
  if (typeof error === 'object' && error !== null) {
    if ('status' in error && error.status === 'FETCH_ERROR') {
      return 'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
    }

    if ('data' in error) {
      const data = error.data
      if (typeof data === 'object' && data !== null) {
        if ('detail' in data && typeof data.detail === 'string') {
          return data.detail
        }
        if ('message' in data && typeof data.message === 'string') {
          return data.message
        }
      }
    }
  }

  return decision === 'approve'
    ? 'Không thể phê duyệt gán phí. Vui lòng thử lại.'
    : 'Không thể từ chối gán phí. Vui lòng thử lại.'
}

const FeeAssignmentApprovalAction = ({
  assignment
}: FeeAssignmentApprovalActionProps) => {
  const [open, setOpen] = useState(false)
  const [hasBeenProcessed, setHasBeenProcessed] = useState(false)
  const { successMess, errorMess } = useMessage()
  const [approveAssignment, { isLoading: isApproving }] =
    usePatchApproveAssignMutation()
  const [rejectAssignment, { isLoading: isRejecting }] =
    usePatchRejectAssignMutation()

  const isLoading = isApproving || isRejecting
  const isProcessed =
    hasBeenProcessed || assignment.status !== APPROVABLE_STATUS

  const handleDecision = async (decision: Decision): Promise<void> => {
    if (isLoading || isProcessed) return

    try {
      if (decision === 'approve') {
        await approveAssignment(assignment.id).unwrap()
      } else {
        await rejectAssignment(assignment.id).unwrap()
      }

      setHasBeenProcessed(true)
      setOpen(false)
      successMess(
        decision === 'approve'
          ? 'Phê duyệt gán phí thành công'
          : 'Từ chối gán phí thành công'
      )
    } catch (error) {
      errorMess(getErrorMessage(error, decision))
    }
  }

  const approvalContent = (
    <div className='flex max-w-[calc(100vw-3rem)] flex-col gap-3'>
      <p className='m-0 wrap-break-word text-sm leading-5 text-gray-700'>
        Chọn kết quả xử lý cho thiết lập gán phí này.
      </p>
      <div className='flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-end'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Hủy bỏ'
          className='w-full sm:w-auto sm:shrink-0'
          disabled={isLoading}
          onClick={() => setOpen(false)}
        />
        <ButtonComponent
          htmlType='button'
          type='default'
          danger
          content='Từ chối duyệt'
          icon={<CloseCircleOutlined />}
          className='w-full sm:w-auto sm:shrink-0'
          loading={isRejecting}
          disabled={isLoading}
          onClick={() => handleDecision('reject')}
        />
        <ButtonComponent
          htmlType='button'
          type='primary'
          content='Duyệt gán phí'
          icon={<CheckCircleOutlined />}
          className='w-full sm:w-auto sm:shrink-0'
          loading={isApproving}
          disabled={isLoading}
          onClick={() => handleDecision('approve')}
        />
      </div>
    </div>
  )

  return (
    <Popover
      title='Phê duyệt gán phí'
      content={approvalContent}
      trigger='click'
      placement='bottomRight'
      open={!isProcessed && open}
      onOpenChange={(nextOpen) => {
        if (!isLoading && !isProcessed) setOpen(nextOpen)
      }}
    >
      <span className='inline-flex'>
        <ButtonComponent
          aria-label={
            isProcessed ? 'Gán phí đã được xử lý' : 'Phê duyệt gán phí'
          }
          title={
            isProcessed
              ? 'Gán phí đã được phê duyệt hoặc từ chối'
              : 'Phê duyệt gán phí'
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
  )
}

export default FeeAssignmentApprovalAction
