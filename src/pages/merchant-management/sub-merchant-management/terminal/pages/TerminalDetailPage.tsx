import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Can, SCREENS } from '@/app/permissions'
import {
  useGetTerminalDetailQuery,
  useSetTerminalLockedMutation
} from '@/app/services/merchantHierarchyApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  ArrowLeftOutlined,
  EditOutlined,
  LockFilled,
  LockKeyOpenIcon
} from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  TagComponent,
  TextArea,
  feedback
} from '@components/index'
import { TerminalActionButton } from '../components/TerminalActionButton'

const Field = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <dt className='text-xs text-muted-foreground'>{label}</dt>
    <dd className='mt-1 text-sm font-medium'>{value || '—'}</dd>
  </div>
)

export default function TerminalDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const basePath = SCREENS.MERCHANT_TERMINAL.path
  const detail = useGetTerminalDetailQuery(id ?? '', { skip: !id })
  const row = detail.data
  const [locking, setLocking] = useState(false)
  const [reason, setReason] = useState('')
  const [setLocked, state] = useSetTerminalLockedMutation()
  const active = row?.status === 'ACTIVE'

  const confirm = async () => {
    if (!row) return
    if (reason.trim().length < 10) {
      feedback.warning('Lý do cần tối thiểu 10 ký tự')
      return
    }
    try {
      await setLocked({
        id: row.id,
        lock: active,
        reason: reason.trim()
      }).unwrap()
      feedback.success('Đã cập nhật Terminal')
      setLocking(false)
      navigate(basePath)
    } catch {
      feedback.error('Không thể cập nhật Terminal')
    }
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <header className='flex flex-wrap items-center justify-between gap-3'>
          <div className='flex items-center gap-2'>
            <ButtonComponent
              type='default'
              size='small'
              aria-label='Quay lại'
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate(basePath)}
            />
            <div>
              <h1 className='text-lg font-semibold'>
                {row?.name ?? 'Chi tiết Terminal'}
              </h1>
              <p className='text-xs text-muted-foreground'>{row?.tid ?? '—'}</p>
            </div>
            {row && (
              <TagComponent color={active ? 'success' : 'warning'}>
                {active
                  ? 'Hoạt động'
                  : row.status === 'INACTIVE'
                    ? 'Không hoạt động'
                    : 'Đã kết thúc'}
              </TagComponent>
            )}
          </div>
          {row && (
            <div className='flex gap-2'>
              <Can
                screen='MERCHANT_TERMINAL'
                action='edit'
              >
                <TerminalActionButton
                  label={`Sửa Terminal ${row.name}`}
                  title='Sửa Terminal'
                  icon={<EditOutlined aria-hidden />}
                  onClick={() =>
                    navigate(`${basePath}/edit/${row.id}`, { state: row })
                  }
                />
              </Can>
              {row.status !== 'TERMINATED' && row.lockSource !== 'CASCADE' && (
                <Can
                  screen='MERCHANT_TERMINAL'
                  action={active ? 'lock' : 'unlock'}
                >
                  <TerminalActionButton
                    label={`${active ? 'Khóa' : 'Mở khóa'} Terminal ${row.name}`}
                    title={active ? 'Khóa Terminal' : 'Mở khóa Terminal'}
                    icon={
                      active ? (
                        <LockFilled aria-hidden />
                      ) : (
                        <LockKeyOpenIcon
                          aria-hidden
                          size={16}
                        />
                      )
                    }
                    danger={active}
                    unlock={!active}
                    onClick={() => setLocking(true)}
                  />
                </Can>
              )}
            </div>
          )}
        </header>
      </CardComponent>
      {detail.isLoading && (
        <CardComponent>
          <div
            role='status'
            className='text-sm text-muted-foreground'
          >
            Đang tải chi tiết Terminal…
          </div>
        </CardComponent>
      )}
      {detail.isError && (
        <CardComponent>
          <div
            role='alert'
            className='flex items-center gap-3 text-sm text-muted-foreground'
          >
            Không tải được chi tiết Terminal.{' '}
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void detail.refetch()}
            />
          </div>
        </CardComponent>
      )}
      {row && (
        <CardComponent
          title='Thông tin Terminal'
          className='border border-border bg-background shadow-none'
        >
          <dl className='grid gap-4 sm:grid-cols-2 xl:grid-cols-4'>
            <Field
              label='Terminal ID'
              value={row.tid}
            />
            <Field
              label='Tên Terminal'
              value={row.name}
            />
            <Field
              label='Loại'
              value={row.terminalType}
            />
            <Field
              label='Sub-merchant'
              value={row.subMerchantName}
            />
            <Field
              label='Mã Sub-merchant'
              value={row.subMerchantCode}
            />
            <Field
              label='Địa chỉ'
              value={row.address}
            />
            <Field
              label='Số điện thoại'
              value={row.contactPhone?.value}
            />
            <Field
              label='Ngày tạo'
              value={formatUTCToLocalDateTime(row.createdAt)}
            />
          </dl>
        </CardComponent>
      )}
      <DialogModal
        open={locking}
        title={active ? 'Khóa Terminal' : 'Mở khóa Terminal'}
        onCancel={() => {
          setLocking(false)
          setReason('')
        }}
        onOk={() => void confirm()}
        okButtonProps={{ loading: state.isLoading }}
        okText='Xác nhận'
      >
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
