import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Can, SCREENS } from '@/app/permissions'
import {
  useGetSubMerchantDetailQuery,
  useSetSubMerchantLockedMutation
} from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { ArrowLeftOutlined, EditOutlined } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  TextArea,
  feedback
} from '@components/index'
import { ManagementStatusTag } from '../../shared/ManagementStatusTag'
import { toSubMerchantRow } from '../../shared/hierarchyAdapter'

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='mt-1 text-sm font-medium text-foreground'>{value || '—'}</dd>
  </div>
)

export default function SubMerchantDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path
  const query = useGetSubMerchantDetailQuery(id ?? '', { skip: !id })
  const [setLocked, { isLoading }] = useSetSubMerchantLockedMutation()
  const [statusOpen, setStatusOpen] = useState(false)
  const [reason, setReason] = useState('')
  const data = query.data
  const row = data ? toSubMerchantRow(data) : undefined
  const isActive = data?.status === 'ACTIVE'

  const changeStatus = async () => {
    if (!id || reason.trim().length < 10) {
      feedback.warning('Lý do cần tối thiểu 10 ký tự')
      return
    }
    try {
      await setLocked({ id, lock: isActive, reason: reason.trim() }).unwrap()
      feedback.success(
        isActive ? 'Đã khóa Sub-merchant' : 'Đã mở khóa Sub-merchant'
      )
      setStatusOpen(false)
      setReason('')
    } catch {
      feedback.error('Không thể cập nhật trạng thái Sub-merchant')
    }
  }

  return (
    <main className='mx-0 flex min-w-0 flex-col gap-3 md:mx-5'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <header className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <ButtonComponent
              aria-label='Quay lại'
              type='default'
              size='small'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(basePath)}
            />
            <div>
              <h1 className='text-lg font-semibold'>
                {data?.name ?? 'Chi tiết Sub-merchant'}
              </h1>
              <p className='text-xs text-muted-foreground'>
                {data?.code ?? '—'}
              </p>
            </div>
            {row && <ManagementStatusTag status={row.status} />}
          </div>
          {data && (
            <div className='flex gap-2'>
              <Can
                screen='MERCHANT_SUB_MERCHANT'
                action='edit'
              >
                <ButtonComponent
                  size='small'
                  type='default'
                  icon={<EditOutlined />}
                  content='Sửa'
                  onClick={() => navigate(`${basePath}/edit/${id}`)}
                />
              </Can>
              {data.status !== 'TERMINATED' &&
                data.lockSource !== 'CASCADE' && (
                  <Can
                    screen='MERCHANT_SUB_MERCHANT'
                    action={isActive ? 'lock' : 'unlock'}
                  >
                    <ButtonComponent
                      size='small'
                      danger={isActive}
                      type='default'
                      content={isActive ? 'Khóa' : 'Mở khóa'}
                      onClick={() => setStatusOpen(true)}
                    />
                  </Can>
                )}
            </div>
          )}
        </header>
      </CardComponent>
      {query.isLoading && (
        <CardComponent>
          <p role='status'>Đang tải Sub-merchant…</p>
        </CardComponent>
      )}
      {query.isError && (
        <CardComponent>
          <div
            role='alert'
            className='flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải Sub-merchant.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        </CardComponent>
      )}
      {data && (
        <CardComponent
          title='Thông tin Sub-merchant'
          className='border border-border bg-background shadow-none'
        >
          <dl className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <Field
              label='Merchant cha'
              value={`${data.merchantName ?? ''} · ${data.merchantCode ?? ''}`}
            />
            <Field
              label='Tên pháp lý'
              value={data.legalName}
            />
            <Field
              label='Mã số thuế'
              value={data.taxCode}
            />
            <Field
              label='Người đại diện'
              value={data.legalRepresentativeName}
            />
            <Field
              label='Lĩnh vực kinh doanh'
              value={data.businessField}
            />
            <Field
              label='Số điện thoại'
              value={data.phone?.value}
            />
            <Field
              label='Địa chỉ'
              value={data.address?.value}
            />
            <Field
              label='Ngày tạo'
              value={formatUTCToLocalDateTime(data.createdAt)}
            />
            <Field
              label='Ngày cập nhật'
              value={formatUTCToLocalDateTime(data.updatedAt)}
            />
          </dl>
        </CardComponent>
      )}
      <DialogModal
        open={statusOpen}
        title={isActive ? 'Khóa Sub-merchant' : 'Mở khóa Sub-merchant'}
        onCancel={() => {
          setStatusOpen(false)
          setReason('')
        }}
        onOk={() => void changeStatus()}
        okButtonProps={{ loading: isLoading }}
        okText='Xác nhận'
      >
        <p className='mb-3 text-sm'>
          Xác nhận thay đổi trạng thái của <strong>{data?.name}</strong>.
        </p>
        <TextArea
          aria-label='Lý do'
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={3}
          maxLength={500}
          placeholder='Nhập lý do (tối thiểu 10 ký tự)'
        />
      </DialogModal>
    </main>
  )
}
