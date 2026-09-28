import { useState } from 'react'
import { Can } from '@/app/permissions'
import {
  useCreateGatewayCredentialMutation,
  useGetGatewayCredentialsQuery,
  useGetGatewayMerchantsQuery,
  useRevokeGatewayCredentialMutation,
  useRotateGatewayCredentialMutation,
  type ApiCredential,
  type CredentialSecret
} from '@/app/services/merchantGatewayApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  BroomIcon,
  FunnelIcon,
  KeyIcon,
  PlusOutlined,
  MagnifyingGlassIcon
} from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  Input,
  SelectComponent,
  Table,
  TextArea,
  TypographyText,
  feedback
} from '@components/index'
import { createApiCredentialColumns } from '../columns/apiCredential.columns'
import { CredentialExpandIcon } from '../components/CredentialExpandIcon'

type Action = { type: 'rotate' | 'revoke'; credential: ApiCredential }

const dateLabel = (value?: string | null) =>
  value ? formatUTCToLocalDateTime(value) : 'Chưa có'

function DetailItem({
  label,
  value
}: {
  label: string
  value: string | number
}) {
  return (
    <div className='min-w-0'>
      <dt className='text-xs text-muted-foreground'>{label}</dt>
      <dd className='mt-1 break-words text-sm text-foreground'>{value}</dd>
    </div>
  )
}

function CredentialDetails({ credential }: { credential: ApiCredential }) {
  return (
    <div className='grid gap-5 py-2 md:grid-cols-3'>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-secondary-foreground'>
          Định danh & truy cập
        </h3>
        <dl className='space-y-3'>
          <DetailItem
            label='ID key'
            value={credential.id}
          />
          <DetailItem
            label='ID Master Merchant'
            value={credential.merchantId}
          />
          <DetailItem
            label='Phiên bản secret'
            value={`v${credential.version ?? 1}`}
          />
          <DetailItem
            label='IP Whitelist'
            value={
              credential.ipWhitelist?.length
                ? credential.ipWhitelist.join(', ')
                : 'Không giới hạn IP'
            }
          />
        </dl>
      </section>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-secondary-foreground'>
          Thời hạn & sử dụng
        </h3>
        <dl className='space-y-3'>
          <DetailItem
            label='Ngày tạo'
            value={dateLabel(credential.createdAt)}
          />
          <DetailItem
            label='Cập nhật lần cuối'
            value={dateLabel(credential.updatedAt)}
          />
          <DetailItem
            label='Hết hạn'
            value={
              credential.expiresAt
                ? dateLabel(credential.expiresAt)
                : 'Không đặt hạn'
            }
          />
          <DetailItem
            label='Lần sử dụng gần nhất'
            value={dateLabel(credential.lastUsedAt)}
          />
        </dl>
      </section>
      <section className='space-y-3'>
        <h3 className='text-sm font-semibold text-secondary-foreground'>
          Lịch sử bảo mật
        </h3>
        <dl className='space-y-3'>
          <DetailItem
            label='Xoay key lần cuối'
            value={dateLabel(credential.rotatedAt)}
          />
          <DetailItem
            label='Secret cũ còn hiệu lực đến'
            value={dateLabel(credential.previousSecretExpiresAt)}
          />
          <DetailItem
            label='Thu hồi lúc'
            value={dateLabel(credential.revokedAt)}
          />
          <DetailItem
            label='Người thu hồi'
            value={credential.revokedBy || 'Chưa có'}
          />
          {credential.revokeReason && (
            <DetailItem
              label='Lý do thu hồi'
              value={credential.revokeReason}
            />
          )}
        </dl>
      </section>
    </div>
  )
}

function CredentialCopyField({
  label,
  value
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <p className='mb-1 block text-sm font-medium'>{label}</p>
      <div className='flex min-h-12 items-center rounded-lg border border-border bg-muted px-3 py-1.5'>
        <TypographyText
          className='flex w-full min-w-0 items-center gap-2!'
          copyable={{
            text: value,
            tooltips: [`Sao chép ${label}`, `Đã sao chép ${label}`]
          }}
        >
          <code className='min-w-0 flex-1 break-all font-mono text-xs leading-5 text-foreground border-none! bg-transparent!'>
            {value}
          </code>
        </TypographyText>
      </div>
    </div>
  )
}

const KeyConnectionPage = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [merchantId, setMerchantId] = useState<string>()
  const [status, setStatus] = useState<ApiCredential['status']>()
  const [draftMerchantId, setDraftMerchantId] = useState<string>()
  const [draftStatus, setDraftStatus] = useState<ApiCredential['status']>()
  const [isCreating, setIsCreating] = useState(false)
  const [selectedMerchant, setSelectedMerchant] = useState<string>()
  const [name, setName] = useState('')
  const [ips, setIps] = useState('')
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState('')
  const [reasonError, setReasonError] = useState('')
  const [secret, setSecret] = useState<CredentialSecret | null>(null)

  const merchants = useGetGatewayMerchantsQuery({ page: 1, size: 100 })
  const query = useGetGatewayCredentialsQuery({
    page,
    size,
    merchantId,
    status
  })
  const [createCredential, createState] = useCreateGatewayCredentialMutation()
  const [rotateCredential, rotateState] = useRotateGatewayCredentialMutation()
  const [revokeCredential, revokeState] = useRevokeGatewayCredentialMutation()

  const merchantName = (id: string) =>
    merchants.data?.content.find((merchant) => merchant.id === id)?.name ?? id
  const closeCreate = () => {
    setIsCreating(false)
    setSelectedMerchant(undefined)
    setName('')
    setIps('')
  }
  const closeAction = () => {
    setAction(null)
    setReason('')
    setReasonError('')
  }
  const search = () => {
    setMerchantId(draftMerchantId)
    setStatus(draftStatus)
    setPage(1)
  }
  const clearSearch = () => {
    setDraftMerchantId(undefined)
    setDraftStatus(undefined)
    setMerchantId(undefined)
    setStatus(undefined)
    setPage(1)
  }
  const save = async () => {
    if (!selectedMerchant) {
      feedback.warning('Vui lòng chọn Merchant')
      return
    }
    try {
      const result = await createCredential({
        merchantId: selectedMerchant,
        name: name.trim() || undefined,
        ipWhitelist: ips
          .split(/[\s,;]+/)
          .map((ip) => ip.trim())
          .filter(Boolean)
      }).unwrap()
      closeCreate()
      setSecret(result)
      feedback.success('Đã tạo key kết nối')
    } catch {
      feedback.error('Không thể tạo key kết nối')
    }
  }
  const confirmAction = async () => {
    if (!action) return
    if (action.type === 'revoke' && reason.trim().length < 10) {
      setReasonError('Lý do thu hồi cần tối thiểu 10 ký tự')
      return
    }
    if (action.type === 'rotate' && !reason.trim()) {
      setReasonError('Vui lòng nhập lý do xoay key')
      return
    }
    setReasonError('')
    try {
      if (action.type === 'rotate')
        setSecret(
          await rotateCredential({
            id: action.credential.id,
            reason: reason.trim()
          }).unwrap()
        )
      else
        await revokeCredential({
          id: action.credential.id,
          reason: reason.trim()
        }).unwrap()
      feedback.success(
        action.type === 'rotate' ? 'Đã xoay key' : 'Đã thu hồi key'
      )
      closeAction()
    } catch {
      feedback.error(
        action.type === 'rotate'
          ? 'Không thể xoay key'
          : 'Không thể thu hồi key. Vui lòng thử lại.'
      )
    }
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <CardComponent className='border border-border bg-background shadow-none'>
        <form
          className='space-y-4'
          onSubmit={(event) => {
            event.preventDefault()
            search()
          }}
        >
          <div className='flex items-center gap-2 border-b border-border pb-3'>
            <FunnelIcon
              aria-hidden
              size={18}
              className='text-secondary-foreground'
            />
            <h2 className='font-display text-base font-semibold text-foreground'>
              Bộ lọc tìm kiếm
            </h2>
          </div>
          <div className='grid grid-cols-1 gap-3 md:grid-cols-2'>
            <div className='min-w-0 flex flex-col gap-1.5'>
              <label
                className='text-sm font-medium text-foreground'
                htmlFor='filter-key-merchant'
              >
                Merchant
              </label>
              <SelectComponent
                id='filter-key-merchant'
                allowClear
                aria-label='Lọc Merchant'
                className='w-full'
                onChange={setDraftMerchantId}
                optionFilterProp='label'
                options={(merchants.data?.content ?? []).map((item) => ({
                  label: `${item.code} — ${item.name}`,
                  value: item.id
                }))}
                placeholder='Tất cả Merchant'
                showSearch
                value={draftMerchantId}
              />
            </div>
            <div className='min-w-0 flex flex-col gap-1.5'>
              <label
                className='text-sm font-medium text-foreground'
                htmlFor='filter-key-status'
              >
                Trạng thái
              </label>
              <SelectComponent
                id='filter-key-status'
                allowClear
                aria-label='Lọc trạng thái key'
                className='w-full'
                onChange={setDraftStatus}
                options={[
                  { label: 'Hoạt động', value: 'ACTIVE' },
                  { label: 'Đã thu hồi', value: 'REVOKED' },
                  { label: 'Hết hạn', value: 'EXPIRED' }
                ]}
                placeholder='Tất cả trạng thái'
                value={draftStatus}
              />
            </div>
          </div>
          <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
            <ButtonComponent
              htmlType='button'
              type='default'
              content='Xóa lọc'
              icon={
                <BroomIcon
                  aria-hidden
                  size={18}
                />
              }
              disabled={
                !merchantId && !status && !draftMerchantId && !draftStatus
              }
              className='w-full sm:w-auto'
              onClick={clearSearch}
            />
            <ButtonComponent
              htmlType='submit'
              content='Tìm kiếm'
              icon={
                <MagnifyingGlassIcon
                  aria-hidden
                  size={18}
                />
              }
              className='w-full sm:w-auto'
            />
          </div>
        </form>
      </CardComponent>
      <CardComponent className='border border-border bg-background shadow-none'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'>
          <div>
            <h1 className='flex items-center gap-2 text-base font-semibold text-foreground'>
              <KeyIcon aria-hidden /> Danh sách key kết nối
            </h1>
            <p className='mt-1 text-xs text-muted-foreground'>
              {query.data?.totalElements ?? 0} key · Cấp tại Master,
              Sub-merchant và Terminal sử dụng kế thừa
            </p>
          </div>
          <Can
            screen='MERCHANT_KEY_CONNECTION'
            action='create'
          >
            <ButtonComponent
              content='Tạo key'
              htmlType='button'
              icon={<PlusOutlined aria-hidden />}
              onClick={() => {
                setSelectedMerchant(merchantId)
                setIsCreating(true)
              }}
            />
          </Can>
        </div>
        {query.isError && (
          <div
            role='alert'
            className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'
          >
            Không thể tải key kết nối.
            <ButtonComponent
              type='default'
              size='small'
              content='Thử lại'
              onClick={() => void query.refetch()}
            />
          </div>
        )}
        <Table<ApiCredential>
          rowKey='id'
          size='small'
          loading={query.isFetching}
          onRefresh={query.refetch}
          dataSource={query.data?.content ?? []}
          pagination={{
            current: page,
            pageSize: size,
            total: query.data?.totalElements ?? 0,
            onChange: (nextPage, nextSize) => {
              setPage(nextSize !== size ? 1 : nextPage)
              setSize(nextSize)
            }
          }}
          expandable={{
            expandedRowRender: (record) => (
              <CredentialDetails credential={record} />
            ),
            expandIcon: (props) => <CredentialExpandIcon {...props} />
          }}
          columns={createApiCredentialColumns({
            page,
            size,
            merchantName,
            onRotate: (credential) => setAction({ type: 'rotate', credential }),
            onRevoke: (credential) => setAction({ type: 'revoke', credential })
          })}
        />
      </CardComponent>
      <DialogModal
        open={isCreating}
        width={{ xs: '95%', md: 680 }}
        title='Tạo key kết nối'
        onCancel={closeCreate}
        onOk={() => void save()}
        okButtonProps={{ loading: createState.isLoading }}
        okText='Tạo key'
      >
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div className='col-span-full flex items-center gap-2'>
            <span
              aria-hidden
              className='flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground'
            >
              I
            </span>
            <h2 className='text-xs font-semibold uppercase tracking-[0.05em] text-secondary-foreground'>
              Phạm vi áp dụng
            </h2>
          </div>
          <div className='col-span-full'>
            <label
              className='mb-1 block text-sm font-medium'
              htmlFor='credential-merchant'
            >
              Chọn Master Merchant <span className='text-danger-strong'>*</span>
            </label>
            <SelectComponent
              aria-label='Merchant'
              id='credential-merchant'
              className='w-full'
              showSearch
              optionFilterProp='label'
              options={(merchants.data?.content ?? []).map((item) => ({
                label: `${item.code} — ${item.name}`,
                value: item.id
              }))}
              value={selectedMerchant}
              onChange={setSelectedMerchant}
              placeholder='Tìm theo tên hoặc mã merchant'
            />
          </div>
          <div className='col-span-full rounded-lg border border-border bg-muted/30 p-3'>
            <p className='mb-2 text-xs font-semibold text-secondary-foreground'>
              Key áp dụng theo cây Merchant
            </p>
            <div className='flex flex-wrap items-center gap-2 text-xs'>
              <span className='rounded-md border border-primary/30 bg-primary/10 px-2.5 py-1.5 font-semibold text-secondary-foreground'>
                Master · cấp key
              </span>
              <span
                aria-hidden
                className='text-muted-foreground'
              >
                →
              </span>
              <span className='rounded-md border border-border bg-background px-2.5 py-1.5 text-foreground'>
                Sub-merchant · kế thừa
              </span>
              <span
                aria-hidden
                className='text-muted-foreground'
              >
                →
              </span>
              <span className='rounded-md border border-border bg-background px-2.5 py-1.5 text-foreground'>
                Terminal · kế thừa
              </span>
            </div>
            <p className='mt-2 text-xs leading-relaxed text-muted-foreground'>
              Key được cấp tại Master và dùng chung cho các cấp trực thuộc. Thu
              hồi key sẽ ảnh hưởng đến toàn bộ tích hợp đang dùng key này.
            </p>
          </div>
          <div className='col-span-full mt-1 flex items-center gap-2 border-t border-border pt-4'>
            <span
              aria-hidden
              className='flex size-6 items-center justify-center rounded-md bg-primary text-[11px] font-bold text-primary-foreground'
            >
              II
            </span>
            <h2 className='text-xs font-semibold uppercase tracking-[0.05em] text-secondary-foreground'>
              Khóa kết nối
            </h2>
          </div>
          <div className='col-span-full'>
            <label
              className='mb-1 block text-sm font-medium'
              htmlFor='key-name'
            >
              Tên gợi nhớ (tùy chọn)
            </label>
            <Input
              id='key-name'
              placeholder='Ví dụ: Tích hợp sản xuất'
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={100}
            />
          </div>
          <div>
            <label
              className='mb-1 block text-sm font-medium'
              htmlFor='key-generated-client'
            >
              Client ID / Merchant Key
            </label>
            <Input
              id='key-generated-client'
              value='Được tạo tự động'
              disabled
            />
          </div>
          <div>
            <label
              className='mb-1 block text-sm font-medium'
              htmlFor='key-generated-secret'
            >
              Secret Key
            </label>
            <Input
              id='key-generated-secret'
              value='Chỉ hiển thị sau khi tạo'
              disabled
            />
          </div>
          <div className='col-span-full'>
            <label
              className='mb-1 block text-sm font-medium'
              htmlFor='key-ips'
            >
              IP Whitelist (tùy chọn)
            </label>
            <TextArea
              id='key-ips'
              value={ips}
              onChange={(event) => setIps(event.target.value)}
              rows={3}
              placeholder='Mỗi IP hoặc dải CIDR một dòng'
            />
            <p className='mt-1 text-xs text-muted-foreground'>
              Để trống nếu chưa giới hạn IP được phép gọi API.
            </p>
          </div>
          <p className='col-span-full rounded-lg border border-warning/40 bg-warning/10 p-3 text-xs leading-relaxed text-warning-strong'>
            Client ID và Secret Key được hệ thống sinh khi tạo. Hãy sao chép
            Secret Key ngay sau khi tạo vì hệ thống chỉ hiển thị đầy đủ một lần.
          </p>
        </div>
      </DialogModal>
      <DialogModal
        open={action !== null}
        mode={action?.type === 'revoke' ? 'DELETE' : 'CONFIRM'}
        title={action?.type === 'rotate' ? 'Xoay key' : 'Thu hồi key'}
        onCancel={closeAction}
        onOk={() => void confirmAction()}
        okButtonProps={{
          loading: rotateState.isLoading || revokeState.isLoading
        }}
        okText={
          action?.type === 'revoke' ? 'Xác nhận thu hồi' : 'Xác nhận xoay key'
        }
      >
        <p className='mb-3 text-sm'>
          Client ID:{' '}
          <strong className='font-mono'>{action?.credential.clientId}</strong>
        </p>
        {action?.type === 'revoke' && (
          <p className='mb-3 text-sm text-danger-strong'>
            Thu hồi key là thao tác vĩnh viễn. Tích hợp đang dùng key này sẽ
            ngừng hoạt động.
          </p>
        )}
        <label
          className='mb-1 block text-sm font-medium'
          htmlFor='credential-action-reason'
        >
          {action?.type === 'revoke' ? 'Lý do thu hồi' : 'Lý do xoay key'}{' '}
          <span className='text-danger-strong'>*</span>
        </label>
        <TextArea
          id='credential-action-reason'
          aria-label={
            action?.type === 'revoke' ? 'Lý do thu hồi' : 'Lý do xoay key'
          }
          value={reason}
          onChange={(event) => {
            setReason(event.target.value)
            if (reasonError) setReasonError('')
          }}
          placeholder={
            action?.type === 'revoke'
              ? 'Nhập tối thiểu 10 ký tự'
              : 'Nhập lý do xoay key'
          }
          rows={3}
          maxLength={500}
          status={reasonError ? 'error' : undefined}
        />
        {reasonError ? (
          <p
            role='alert'
            className='mt-1 text-xs text-danger-strong'
          >
            {reasonError}
          </p>
        ) : (
          action?.type === 'revoke' && (
            <p className='mt-1 text-xs text-muted-foreground'>
              Bắt buộc từ 10 đến 500 ký tự để ghi nhật ký thu hồi.
            </p>
          )
        )}
      </DialogModal>
      <DialogModal
        open={secret !== null}
        title='Key kết nối đã tạo'
        onCancel={() => setSecret(null)}
        onOk={() => setSecret(null)}
        okText='Đã lưu thông tin'
      >
        <p className='mb-4 text-sm text-warning-strong'>
          Secret Key chỉ hiển thị một lần. Hãy sao chép và lưu vào nơi an toàn
          trước khi đóng.
        </p>
        {secret && (
          <div className='space-y-4'>
            <CredentialCopyField
              label='Client ID / Merchant Key'
              value={secret.credential.clientId}
            />
            <CredentialCopyField
              label='Secret Key'
              value={secret.secretKey}
            />
          </div>
        )}
      </DialogModal>
    </main>
  )
}

export default KeyConnectionPage
