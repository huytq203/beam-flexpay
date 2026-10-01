import { useState } from 'react'
import { ButtonComponent } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useScreenAccess } from '@/app/permissions'
import {
  useApproveEKYCMutation,
  useGetEKYCByIdQuery,
  useRejectEKYCMutation
} from '@services/apiEKYC'
import { STATUS_LABEL } from '../constants/ekycHistory.constants'

interface Props {
  sessionId: string
  onUpdated?: () => void
  onSuccess?: () => void
  onCancel?: () => void
  readOnly?: boolean
  initialDecision?: 'approve' | 'reject'
}

const errorDetail = (error: unknown): string | null => {
  if (!error || typeof error !== 'object' || !('data' in error)) return null
  const data = error.data
  if (!data || typeof data !== 'object' || !('detail' in data)) return null
  return typeof data.detail === 'string' ? data.detail : null
}

export function EkycReviewPanel({
  sessionId,
  onUpdated,
  onSuccess,
  onCancel,
  readOnly = false,
  initialDecision
}: Props) {
  const { can } = useScreenAccess('CONFIRM_EKYC')
  const { successMess } = useMessage()
  const detail = useGetEKYCByIdQuery(sessionId)
  const [approve, approveState] = useApproveEKYCMutation()
  const [reject, rejectState] = useRejectEKYCMutation()
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(
    initialDecision ?? null
  )
  const [error, setError] = useState<string | null>(null)
  const isPending = detail.data?.status === 'PENDING_REVIEW'
  const canApprove =
    isPending &&
    detail.data?.approvalReady === true &&
    !detail.isFetching &&
    !detail.isError
  const isSubmitting = approveState.isLoading || rejectState.isLoading

  const submit = async () => {
    if (!decision || isSubmitting) return
    setError(null)
    try {
      if (decision === 'approve' && canApprove) {
        await approve(sessionId).unwrap()
      } else if (decision === 'reject' && isPending) {
        await reject(sessionId).unwrap()
      } else {
        return
      }
      successMess(
        decision === 'approve' ? 'Đã duyệt phiên eKYC' : 'Đã từ chối phiên eKYC'
      )
      setDecision(null)
      onUpdated?.()
      onSuccess?.()
    } catch (cause) {
      setError(
        errorDetail(cause) ??
          'Không xử lý được phiên eKYC. Vui lòng tải lại và thử lại.'
      )
      void detail.refetch()
      onUpdated?.()
    }
  }

  return (
    <section
      className='mt-3 rounded-lg border border-border bg-background p-4'
      aria-label='Xét duyệt phiên eKYC'
    >
      <div className='flex flex-wrap items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='font-semibold text-foreground'>Chi tiết phiên eKYC</h3>
          <p className='mt-1 break-all text-xs text-muted-foreground'>
            Session: {sessionId}
          </p>
        </div>
        <ButtonComponent
          type='default'
          size='small'
          content='Tải lại phiên'
          onClick={() => void detail.refetch()}
        />
      </div>
      {detail.isLoading && (
        <p
          role='status'
          className='mt-3 text-sm text-muted-foreground'
        >
          Đang tải phiên...
        </p>
      )}
      {detail.isError && (
        <p
          role='alert'
          className='mt-3 text-sm text-danger-strong'
        >
          Không tải được phiên. Vui lòng tải lại trước khi xử lý.
        </p>
      )}
      {detail.data && (
        <>
          <p className='mt-3 text-sm text-foreground'>
            Trạng thái: {STATUS_LABEL[detail.data.status] ?? detail.data.status}
          </p>
          {!readOnly && isPending && !canApprove && (
            <p className='mt-2 text-sm text-warning-strong'>
              Phiên chưa đủ điều kiện duyệt. Kiểm tra bằng chứng và tải lại
              phiên.
            </p>
          )}
          {!readOnly && !initialDecision && can('approve') && (
            <div className='mt-3 flex flex-wrap gap-2'>
              <ButtonComponent
                type='primary'
                content='Duyệt phiên'
                disabled={!canApprove || isSubmitting}
                onClick={() => setDecision('approve')}
              />
              <ButtonComponent
                type='default'
                danger
                content='Từ chối phiên'
                disabled={
                  !isPending ||
                  detail.isFetching ||
                  detail.isError ||
                  isSubmitting
                }
                onClick={() => setDecision('reject')}
              />
            </div>
          )}
        </>
      )}
      {!readOnly && decision && can('approve') && (
        <div className='mt-3 rounded-md border border-border bg-muted/40 p-3'>
          <p className='text-sm text-foreground'>
            Xác nhận {decision === 'approve' ? 'duyệt' : 'từ chối'} phiên{' '}
            {sessionId}?
          </p>
          <div className='mt-2 flex flex-wrap gap-2'>
            <ButtonComponent
              type='primary'
              danger={decision === 'reject'}
              content={
                decision === 'approve' ? 'Xác nhận duyệt' : 'Xác nhận từ chối'
              }
              disabled={
                decision === 'approve'
                  ? !canApprove || isSubmitting
                  : !isPending ||
                    detail.isFetching ||
                    detail.isError ||
                    isSubmitting
              }
              loading={isSubmitting}
              onClick={() => void submit()}
            />
            <ButtonComponent
              type='default'
              content='Hủy'
              disabled={isSubmitting}
              onClick={() => {
                setDecision(null)
                onCancel?.()
              }}
            />
          </div>
        </div>
      )}
      {error && (
        <p
          role='alert'
          className='mt-3 text-sm text-danger-strong'
        >
          {error}
        </p>
      )}
    </section>
  )
}
