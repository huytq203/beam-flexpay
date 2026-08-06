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
  usePatchApproveFeePolicyMutation,
  usePatchRejectFeePolicyMutation
} from '@services/apiFeePolicy.api'
import { statusType } from '../constants/FeeManagement.constant'
import type { FeePolicy } from '../types/FeeManagement.type'

interface FeePolicyApprovalActionProps {
  policy: FeePolicy
}

type Decision = 'approve' | 'reject'

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
    ? 'Không thể phê duyệt chính sách phí. Vui lòng thử lại.'
    : 'Không thể từ chối chính sách phí. Vui lòng thử lại.'
}

const FeePolicyApprovalAction = ({ policy }: FeePolicyApprovalActionProps) => {
  const [open, setOpen] = useState(false)
  const [hasBeenProcessed, setHasBeenProcessed] = useState(false)
  const { successMess, errorMess } = useMessage()
  const [approveFeePolicy, { isLoading: isApproving }] =
    usePatchApproveFeePolicyMutation()
  const [rejectFeePolicy, { isLoading: isRejecting }] =
    usePatchRejectFeePolicyMutation()

  const isLoading = isApproving || isRejecting
  const isProcessed =
    hasBeenProcessed || policy.status !== statusType.INIT

  const handleDecision = async (decision: Decision): Promise<void> => {
    if (isLoading || isProcessed) return

    try {
      if (decision === 'approve') {
        await approveFeePolicy(policy.id).unwrap()
      } else {
        await rejectFeePolicy(policy.id).unwrap()
      }

      setHasBeenProcessed(true)
      setOpen(false)
      successMess(
        decision === 'approve'
          ? 'Phê duyệt chính sách phí thành công'
          : 'Từ chối chính sách phí thành công'
      )
    } catch (error) {
      errorMess(getErrorMessage(error, decision))
    }
  }

  const approvalContent = (
    <div className='flex max-w-[calc(100vw-3rem)] flex-col gap-3'>
      <p className='m-0 wrap-break-word text-sm leading-5 text-gray-700'>
        Chọn kết quả xử lý cho chính sách “{policy.name}”.
      </p>
      <div className='flex flex-col gap-2 sm:flex-row sm:flex-nowrap sm:items-center sm:justify-center'>
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
          type='primary'
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
          content='Duyệt phí'
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
      title='Phê duyệt chính sách'
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
            isProcessed
              ? 'Chính sách đã được xử lý'
              : 'Phê duyệt chính sách'
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
  )
}

export default FeePolicyApprovalAction
