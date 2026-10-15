import { DialogModal, TextArea } from '@components/index'
import type { useLimitDecisions } from '../hooks/useLimitDecisions'

interface LimitDecisionDialogProps {
  flow: ReturnType<typeof useLimitDecisions>
}

const COPY = {
  approve: { title: 'Phê duyệt hạn mức', ok: 'Duyệt' },
  reject: { title: 'Từ chối đề xuất', ok: 'Từ chối' },
  deactivate: { title: 'Gỡ hạn mức', ok: 'Gỡ' }
} as const

export function LimitDecisionDialog({ flow }: LimitDecisionDialogProps) {
  const kind = flow.decision?.kind
  return (
    <DialogModal
      open={flow.decision !== null}
      title={kind ? COPY[kind].title : ''}
      okText={kind ? COPY[kind].ok : 'Xác nhận'}
      okButtonProps={{ loading: flow.isLoading, danger: kind !== 'approve' }}
      onCancel={flow.close}
      onOk={() => void flow.confirm()}
    >
      {kind === 'approve' ? (
        <p className='text-sm'>Áp dụng thay đổi hạn mức này?</p>
      ) : (
        <TextArea
          aria-label='Lý do'
          maxLength={500}
          onChange={(event) => flow.setReason(event.target.value)}
          placeholder='Nhập lý do'
          rows={3}
          value={flow.reason}
        />
      )}
    </DialogModal>
  )
}
