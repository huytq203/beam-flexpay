import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Can } from '@/app/permissions'
import { ArrowLeftOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  SubjectSegmentCard,
  TextArea,
  feedback
} from '@components/index'
import {
  useApproveMerchantMutation,
  useGetMerchantByIdQuery,
  useRejectMerchantMutation,
  useSetMerchantLockedMutation,
  useSubmitMerchantMutation
} from '@services/apiMerchant'
import StatusBadge from '@components/status-badge/StatusBadge'
import { STATUS_CONFIG } from '../constants/Merchant.constant'
import { MerchantDetailsSections } from '../components/MerchantDetailsSections'

type Action = 'submit' | 'approve' | 'reject' | 'lock' | 'unlock'

const ACTION_LABEL: Record<Action, string> = {
  submit: 'Gửi duyệt hồ sơ',
  approve: 'Phê duyệt hồ sơ',
  reject: 'Từ chối hồ sơ',
  lock: 'Khóa merchant',
  unlock: 'Mở khóa merchant'
}

const MerchantDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useGetMerchantByIdQuery(
    id ?? '',
    { skip: !id }
  )
  const [submit] = useSubmitMerchantMutation()
  const [approve] = useApproveMerchantMutation()
  const [reject] = useRejectMerchantMutation()
  const [setLocked] = useSetMerchantLockedMutation()
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState('')
  const [isWorking, setIsWorking] = useState(false)

  const confirm = async () => {
    if (!id || !action) return
    if ((action === 'lock' || action === 'unlock') && !reason.trim()) {
      feedback.warning('Vui lòng nhập lý do')
      return
    }
    if (action === 'reject' && !reason.trim()) {
      feedback.warning('Vui lòng nhập lý do từ chối')
      return
    }
    setIsWorking(true)
    try {
      if (action === 'submit') await submit(id).unwrap()
      if (action === 'approve') await approve(id).unwrap()
      if (action === 'reject')
        await reject({
          id,
          detail: reason.trim(),
          reasonCode: 'OTHER'
        }).unwrap()
      if (action === 'lock' || action === 'unlock')
        await setLocked({
          id,
          lock: action === 'lock',
          reason: reason.trim()
        }).unwrap()
      feedback.success(`${ACTION_LABEL[action]} thành công`)
      setAction(null)
      setReason('')
    } catch {
      feedback.error(
        `Không thể ${ACTION_LABEL[action].toLocaleLowerCase('vi-VN')}`
      )
    } finally {
      setIsWorking(false)
    }
  }

  return (
    <main className='space-y-3! p-3! sm:p-5!'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <ButtonComponent
              aria-label='Quay lại'
              type='default'
              size='small'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(-1)}
            />
            <div>
              <h1 className='text-lg font-semibold text-foreground'>
                {data?.name ?? 'Chi tiết merchant'}
              </h1>
              <p className='text-xs text-muted-foreground'>
                {data?.code ?? '—'}
              </p>
            </div>
            {data?.status && (
              <StatusBadge
                status={data.status}
                config={STATUS_CONFIG}
              />
            )}
          </div>
          {data && (
            <div className='flex flex-wrap items-center gap-2'>
              {data.status === 'DRAFT' && (
                <Can
                  screen='MERCHANT_MANAGEMENT'
                  action='edit'
                >
                  <ButtonComponent
                    size='small'
                    content='Gửi duyệt'
                    onClick={() => setAction('submit')}
                  />
                </Can>
              )}
              {data.status === 'PENDING_APPROVAL' && (
                <Can
                  screen='MERCHANT_MANAGEMENT'
                  action='approve'
                >
                  <ButtonComponent
                    size='small'
                    content='Phê duyệt'
                    onClick={() => setAction('approve')}
                  />
                  <ButtonComponent
                    size='small'
                    type='default'
                    danger
                    content='Từ chối'
                    onClick={() => setAction('reject')}
                  />
                </Can>
              )}
              {data.status === 'ACTIVE' && (
                <Can
                  screen='MERCHANT_MANAGEMENT'
                  action='lock'
                >
                  <ButtonComponent
                    size='small'
                    type='default'
                    danger
                    content='Khóa'
                    onClick={() => setAction('lock')}
                  />
                </Can>
              )}
              {data.status === 'LOCKED' && (
                <Can
                  screen='MERCHANT_MANAGEMENT'
                  action='unlock'
                >
                  <ButtonComponent
                    size='small'
                    type='default'
                    content='Mở khóa'
                    onClick={() => setAction('unlock')}
                  />
                </Can>
              )}
            </div>
          )}
        </div>
      </CardComponent>

      {isLoading && (
        <CardComponent>
          <p
            role='status'
            className='text-sm text-muted-foreground'
          >
            Đang tải hồ sơ merchant…
          </p>
        </CardComponent>
      )}
      {isError && (
        <CardComponent>
          <div
            role='alert'
            className='flex flex-wrap items-center justify-between gap-3'
          >
            <p className='text-sm text-danger-strong'>
              Không thể tải hồ sơ merchant.
            </p>
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void refetch()}
            />
          </div>
        </CardComponent>
      )}
      {data && (
        <>
          <MerchantDetailsSections data={data} />
          <SubjectSegmentCard
            subjectType='MERCHANT'
            subjectId={data.id}
          />
        </>
      )}

      <DialogModal
        open={action !== null}
        title={action ? ACTION_LABEL[action] : ''}
        onCancel={() => {
          setAction(null)
          setReason('')
        }}
        onOk={() => void confirm()}
        okButtonProps={{ loading: isWorking }}
        okText='Xác nhận'
      >
        <p className='mb-3 text-sm text-foreground'>
          Xác nhận{' '}
          {action ? ACTION_LABEL[action].toLocaleLowerCase('vi-VN') : ''} cho{' '}
          <strong>{data?.name}</strong>?
        </p>
        {(action === 'reject' || action === 'lock' || action === 'unlock') && (
          <TextArea
            aria-label='Lý do'
            maxLength={500}
            rows={3}
            value={reason}
            placeholder='Nhập lý do'
            onChange={(event) => setReason(event.target.value)}
          />
        )}
      </DialogModal>
    </main>
  )
}

export default MerchantDetail
