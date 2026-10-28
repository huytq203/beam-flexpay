import { useNavigate, useParams } from 'react-router-dom'
import { Can } from '@/app/permissions'
import { ArrowLeftOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  SubjectSegmentCard
} from '@components/index'
import { useGetMerchantByIdQuery } from '@services/apiMerchant'
import StatusBadge from '@components/status-badge/StatusBadge'
import { STATUS_CONFIG } from '../constants/Merchant.constant'
import { MerchantDetailsSections } from '../components/MerchantDetailsSections'
import { MerchantActionDialog } from '../components/MerchantActionDialog'
import { MerchantFeeRulesCard } from '../components/MerchantFeeRulesCard'
import { MerchantHistoryTabs } from '../components/MerchantHistoryTabs'
import { useMerchantDetailActions } from '../hooks/useMerchantDetailActions'

const MerchantDetail = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, isError, refetch } = useGetMerchantByIdQuery(
    id ?? '',
    { skip: !id }
  )
  const actions = useMerchantDetailActions(id)
  const setAction = actions.open

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
          <Can
            screen='MERCHANT_FEE_CONFIG'
            action='view'
          >
            <MerchantFeeRulesCard
              merchantId={data.id}
              merchantLabel={data.name}
            />
          </Can>
          <Can
            screen='MERCHANT_MANAGEMENT'
            action='viewHistory'
          >
            <MerchantHistoryTabs merchantId={data.id} />
          </Can>
        </>
      )}

      <MerchantActionDialog
        merchantName={data?.name}
        actions={actions}
      />
    </main>
  )
}

export default MerchantDetail
