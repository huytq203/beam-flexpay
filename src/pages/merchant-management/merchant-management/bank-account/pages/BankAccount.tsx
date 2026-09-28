import { useState } from 'react'
import { Can } from '@/app/permissions'
import { useGetMerchantQuery } from '@services/apiMerchant'
import { useGetBankQuery } from '@services/apiFeeBank'
import { useGetSubMerchantPageQuery } from '@services/merchantHierarchyApi'
import { useChallengeBankAccountOtpMutation, useCreateBankAccountMutation, useListBankAccountsQuery, useMakeBankAccountDefaultMutation, useSetBankAccountHoldModeMutation, useUpdateBankAccountMutation, type BankAccountDto, type SensitiveOtpConfirmation, type SensitiveOtpChallenge } from '@/app/services/merchantBankAccountApi'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import { BankFilled, PlusOutlined } from '@components/icons'
import { ButtonComponent, CardComponent, CheckboxComponent, DialogModal, Input, SelectComponent, Table, TagComponent, TextArea, feedback } from '@components/index'
import { maskAccountNumber } from '../constants/bank-account.constant'
import { BankAccountFormSection } from '../components/BankAccountFormSection'
import { BankAccountNotice } from '../components/BankAccountNotice'

type Action = { type: 'default' | 'hold'; row: BankAccountDto }

const BankAccount = () => {
  const [page, setPage] = useState(1)
  const [size, setSize] = useState(20)
  const [merchantId, setMerchantId] = useState<string>()
  const [level, setLevel] = useState<BankAccountDto['level']>()
  const [status, setStatus] = useState<BankAccountDto['status']>()
  const [keyword, setKeyword] = useState('')
  const [queryText, setQueryText] = useState('')
  const [editing, setEditing] = useState<BankAccountDto | 'create' | null>(null)
  const [action, setAction] = useState<Action | null>(null)
  const [reason, setReason] = useState('')
  const [bankCode, setBankCode] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [accountName, setAccountName] = useState('')
  const [branchName, setBranchName] = useState('')
  const [formMerchantId, setFormMerchantId] = useState<string>()
  const [formSubMerchantId, setFormSubMerchantId] = useState<string>()
  const [isDefault, setIsDefault] = useState(false)
  const [formStatus, setFormStatus] = useState<BankAccountDto['status']>('ACTIVE')
  const [otpChallenge, setOtpChallenge] = useState<SensitiveOtpChallenge | null>(null)
  const [otpCode, setOtpCode] = useState('')
  const [pendingOtpAction, setPendingOtpAction] = useState<'save' | 'default' | null>(null)
  const merchants = useGetMerchantQuery({ page: 1, size: 100 })
  const banks = useGetBankQuery({ page: 1, size: 100 }, { skip: editing === null })
  const subMerchants = useGetSubMerchantPageQuery({ page: 1, size: 100, merchantId: formMerchantId }, { skip: editing !== 'create' || !formMerchantId })
  const query = useListBankAccountsQuery({ page, size, merchantId, level, status, query: queryText || undefined })
  const [create, createState] = useCreateBankAccountMutation()
  const [update, updateState] = useUpdateBankAccountMutation()
  const [makeDefault, defaultState] = useMakeBankAccountDefaultMutation()
  const [setHold, holdState] = useSetBankAccountHoldModeMutation()
  const [challengeOtp, challengeState] = useChallengeBankAccountOtpMutation()
  const merchantName = (id?: string) => merchants.data?.content.find((item) => item.id === id)?.name ?? id ?? '—'

  const requestOtp = async (pending: 'save' | 'default', targetId?: string) => {
    try {
      const challenge = await challengeOtp({ targetId }).unwrap()
      setPendingOtpAction(pending)
      setOtpChallenge(challenge)
      setOtpCode('')
    } catch { feedback.error('Không thể gửi mã OTP') }
  }

  const openEditor = (row: BankAccountDto | 'create') => {
    setEditing(row)
    setBankCode(row === 'create' ? '' : row.bankCode)
    setAccountNumber(row === 'create' ? '' : row.accountNumber)
    setAccountName(row === 'create' ? '' : row.accountName)
    setBranchName(row === 'create' ? '' : row.branchName ?? '')
    setFormMerchantId(row === 'create' ? (merchantId ?? (merchants.data?.content.length === 1 ? merchants.data.content[0].id : undefined)) : row.merchantId)
    setFormSubMerchantId(row === 'create' ? undefined : row.subMerchantId)
    setIsDefault(row === 'create' ? false : row.isDefault)
    setFormStatus(row === 'create' ? 'ACTIVE' : row.status)
    setReason('')
  }
  const save = async (otp?: SensitiveOtpConfirmation) => {
    if (!editing) return
    if (!bankCode.trim() || !/^\d{6,20}$/.test(accountNumber) || !accountName.trim()) { feedback.warning('Vui lòng kiểm tra ngân hàng, số tài khoản và tên chủ tài khoản'); return }
    if (editing === 'create' && !formMerchantId) { feedback.warning('Vui lòng chọn Merchant'); return }
    const identityChanged = editing === 'create' || bankCode.trim() !== editing.bankCode || accountNumber !== editing.accountNumber || accountName.trim() !== editing.accountName
    if (identityChanged && !otp) { await requestOtp('save', editing === 'create' ? undefined : editing.id); return }
    try {
      let applied = true
      if (editing === 'create') await create({ ...(formSubMerchantId ? { subMerchantId: formSubMerchantId } : { merchantId: formMerchantId }), bankCode: bankCode.trim(), accountNumber, accountName: accountName.trim().toUpperCase(), branchName: branchName.trim() || undefined, isDefault, otp: otp! }).unwrap()
      else {
        const result = await update({ id: editing.id, body: {
        version: editing.version,
        ...(bankCode.trim() !== editing.bankCode ? { bankCode: bankCode.trim() } : {}),
        ...(accountNumber !== editing.accountNumber ? { accountNumber } : {}),
        ...(accountName.trim() !== editing.accountName ? { accountName: accountName.trim() } : {}),
        ...(branchName.trim() !== (editing.branchName ?? '') ? { branchName: branchName.trim() } : {}),
        ...(formStatus !== editing.status ? { status: formStatus } : {}),
        reason: reason.trim() || undefined,
        otp
        } }).unwrap()
        applied = result.applied
      }
      feedback.success(editing === 'create' ? 'Đã thêm tài khoản ngân hàng' : applied ? 'Đã cập nhật tài khoản ngân hàng' : 'Đã gửi yêu cầu thay đổi để chờ duyệt')
      setEditing(null)
      setOtpChallenge(null)
      setPendingOtpAction(null)
    } catch { feedback.error('Không thể lưu tài khoản ngân hàng') }
  }
  const confirmAction = async (otp?: SensitiveOtpConfirmation) => {
    if (!action || !reason.trim()) { feedback.warning('Vui lòng nhập lý do'); return }
    if (action.type === 'default' && !otp) { await requestOtp('default', action.row.id); return }
    try {
      if (action.type === 'default') await makeDefault({ id: action.row.id, reason: reason.trim(), otp: otp! }).unwrap()
      else await setHold({ id: action.row.id, enabled: !action.row.holdMode, reason: reason.trim() }).unwrap()
      feedback.success('Đã cập nhật tài khoản ngân hàng')
      setAction(null); setReason('')
      setOtpChallenge(null); setPendingOtpAction(null)
    } catch { feedback.error('Không thể cập nhật tài khoản ngân hàng') }
  }
  const confirmOtp = async () => {
    if (!otpChallenge || !otpCode.trim()) { feedback.warning('Vui lòng nhập mã OTP'); return }
    const otp = { otpSessionId: otpChallenge.otpSessionId, otp: otpCode.trim() }
    if (pendingOtpAction === 'save') await save(otp)
    else if (pendingOtpAction === 'default') await confirmAction(otp)
  }

  return <main className='flex min-w-0 flex-col gap-3'>
    <CardComponent className='border border-border bg-background shadow-none'><div className='grid gap-3 sm:grid-cols-2 xl:grid-cols-4'>
      <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-query'>Tìm kiếm</label><Input id='bank-query' value={keyword} onChange={(event) => setKeyword(event.target.value)} placeholder='Tên chủ tài khoản, số tài khoản…' /></div>
      <div><label className='mb-1 block text-sm font-medium'>Merchant</label><SelectComponent allowClear className='w-full' showSearch optionFilterProp='label' value={merchantId} onChange={(value: string | undefined) => { setMerchantId(value); setPage(1) }} options={(merchants.data?.content ?? []).map((item) => ({ label: `${item.code} — ${item.name}`, value: item.id }))} placeholder='Tất cả Merchant' /></div>
      <div><label className='mb-1 block text-sm font-medium'>Cấp áp dụng</label><SelectComponent allowClear className='w-full' value={level} onChange={(value: BankAccountDto['level'] | undefined) => { setLevel(value); setPage(1) }} options={[{ label: 'Master', value: 'MASTER' }, { label: 'Sub-merchant', value: 'SUB' }, { label: 'Terminal', value: 'TERMINAL' }, { label: 'Mặc định hệ thống', value: 'SYSTEM_DEFAULT' }]} placeholder='Tất cả cấp' /></div>
      <div><label className='mb-1 block text-sm font-medium'>Trạng thái</label><SelectComponent allowClear className='w-full' value={status} onChange={(value: BankAccountDto['status'] | undefined) => { setStatus(value); setPage(1) }} options={[{ label: 'Hoạt động', value: 'ACTIVE' }, { label: 'Không hoạt động', value: 'INACTIVE' }, { label: 'Đã xác minh', value: 'VERIFIED' }]} placeholder='Tất cả trạng thái' /></div>
    </div><div className='mt-3 flex justify-end gap-2'><ButtonComponent type='default' content='Xóa lọc' onClick={() => { setKeyword(''); setQueryText(''); setMerchantId(undefined); setLevel(undefined); setStatus(undefined); setPage(1) }} /><ButtonComponent content='Tìm kiếm' onClick={() => { setQueryText(keyword.trim()); setPage(1) }} /></div></CardComponent>
    <CardComponent className='border border-border bg-background shadow-none'><div className='mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3'><h1 className='flex items-center gap-2 text-base font-semibold'><BankFilled aria-hidden /> Tài khoản ngân hàng</h1><Can screen='MERCHANT_BANK_ACCOUNT' action='create'><ButtonComponent content='Thêm tài khoản' icon={<PlusOutlined />} onClick={() => openEditor('create')} /></Can></div>
      {query.isError && <div role='alert' className='mb-3 flex items-center justify-between gap-2 text-sm text-danger-strong'>Không thể tải tài khoản ngân hàng.<ButtonComponent size='small' type='default' content='Thử lại' onClick={() => void query.refetch()} /></div>}
      <Table<BankAccountDto> rowKey='id' size='small' onRefresh={query.refetch} loading={query.isFetching} dataSource={query.data?.content ?? []} pagination={{ current: page, pageSize: size, total: query.data?.totalElements ?? 0, onChange: (nextPage, nextSize) => { setPage(nextSize !== size ? 1 : nextPage); setSize(nextSize) } }} columns={[
        { title: 'Merchant', render: (_, row) => merchantName(row.merchantId) },
        { title: 'Ngân hàng', dataIndex: 'bankCode' },
        { title: 'Số tài khoản', dataIndex: 'accountNumber', render: (value: string) => <span className='font-mono'>{maskAccountNumber(value)}</span> },
        { title: 'Chủ tài khoản', dataIndex: 'accountName' },
        { title: 'Cấp', dataIndex: 'level' },
        { title: 'Liên kết', dataIndex: 'linkStatus', render: (value: BankAccountDto['linkStatus']) => <TagComponent color={value === 'LINKED' ? 'success' : value === 'LINK_FAILED' ? 'error' : 'warning'}>{value === 'LINKED' ? 'Đã liên kết' : value === 'LINK_FAILED' ? 'Lỗi liên kết' : 'Chờ xác minh'}</TagComponent> },
        { title: 'Trạng thái', render: (_, row) => <div className='flex gap-1'><TagComponent color={row.status === 'INACTIVE' ? 'default' : 'success'}>{row.status === 'INACTIVE' ? 'Không hoạt động' : 'Hoạt động'}</TagComponent>{row.isDefault && <TagComponent>Mặc định</TagComponent>}{row.holdMode && <TagComponent color='warning'>Tạm giữ</TagComponent>}</div> },
        { title: 'Ngày tạo', dataIndex: 'createdAt', render: (value?: string) => formatUTCToLocalDateTime(value) || '—' },
        { title: 'Thao tác', fixed: 'right', align: 'center', width: 240, render: (_, row) => <Can screen='MERCHANT_BANK_ACCOUNT' action='edit'><div className='flex justify-center gap-1'><ButtonComponent size='small' type='default' content='Sửa' onClick={() => openEditor(row)} />{!row.isDefault && <ButtonComponent size='small' type='default' content='Mặc định' onClick={() => setAction({ type: 'default', row })} />}<ButtonComponent size='small' type='default' content={row.holdMode ? 'Bỏ giữ' : 'Tạm giữ'} onClick={() => setAction({ type: 'hold', row })} /></div></Can> }
      ]} />
    </CardComponent>
    <DialogModal open={editing !== null} width={{ xs: '95%', md: 680 }} title={editing === 'create' ? 'Thêm tài khoản ngân hàng' : 'Cập nhật tài khoản ngân hàng'} onCancel={() => setEditing(null)} onOk={() => void save()} okButtonProps={{ loading: createState.isLoading || updateState.isLoading }} okText={editing === 'create' ? 'Thêm mới' : 'Lưu thay đổi'}>
      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
        {editing === 'create' && <>
          <BankAccountFormSection id='bank-account-scope' step='I' title='Phạm vi áp dụng' withDivider={false} />
          <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-merchant'>Chọn Master Merchant <span className='text-danger'>*</span></label><SelectComponent aria-label='Chọn Master Merchant' id='bank-merchant' className='w-full' value={formMerchantId} onChange={(value: string) => { setFormMerchantId(value); setFormSubMerchantId(undefined) }} options={(merchants.data?.content ?? []).map((item) => ({ label: `${item.code} — ${item.name}`, value: item.id }))} showSearch optionFilterProp='label' placeholder='Tìm theo tên hoặc mã merchant' /></div>
          <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-sub-merchant'>Chọn Sub-merchant (tùy chọn)</label><SelectComponent aria-label='Chọn Sub-merchant' id='bank-sub-merchant' className='w-full' allowClear value={formSubMerchantId} onChange={setFormSubMerchantId} options={(subMerchants.data?.content ?? []).map((item) => ({ label: `${item.code} — ${item.name}`, value: item.id }))} loading={subMerchants.isFetching} disabled={!formMerchantId} showSearch optionFilterProp='label' placeholder='Để trống = áp dụng cho Master' /></div>
          <BankAccountNotice tone='info' className='col-span-full'>Để trống Sub-merchant để áp dụng cho Master. Chọn Sub-merchant khi cần tài khoản riêng cho chi nhánh.</BankAccountNotice>
        </>}
        <BankAccountFormSection id='bank-account-settlement' step='II' title='Tài khoản nhận quyết toán' withDivider={editing === 'create'} />
        <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-code'>Ngân hàng <span className='text-danger'>*</span></label><SelectComponent aria-label='Ngân hàng' id='bank-code' className='w-full' value={bankCode || undefined} onChange={setBankCode} showSearch optionFilterProp='label' loading={banks.isFetching} options={(banks.data?.content ?? []).map((bank) => ({ value: bank.code, label: `${bank.name} (${bank.code})` }))} placeholder={banks.isError ? 'Không tải được danh sách ngân hàng' : 'Chọn ngân hàng thụ hưởng'} notFoundContent={banks.isError ? 'Không tải được danh sách ngân hàng' : undefined} /></div>
        <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-number'>Số tài khoản <span className='text-danger'>*</span></label><Input id='bank-number' value={accountNumber} onChange={(event) => setAccountNumber(event.target.value.replace(/\D/g, ''))} inputMode='numeric' maxLength={20} placeholder='6–20 chữ số' /></div>
        <div className='sm:col-span-2'><label className='mb-1 block text-sm font-medium' htmlFor='bank-name'>Tên chủ tài khoản <span className='text-danger'>*</span></label><Input id='bank-name' value={accountName} onChange={(event) => setAccountName(event.target.value.toUpperCase())} maxLength={100} placeholder='Tên khớp thông tin KYB/eKYC' /><p className='mt-1 text-xs text-muted-foreground'>Tên phải khớp pháp nhân hoặc chủ ví đã xác thực.</p></div>
        <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-branch'>Chi nhánh</label><Input id='bank-branch' value={branchName} onChange={(event) => setBranchName(event.target.value)} maxLength={100} placeholder='Nếu có' /></div>
        {editing === 'create' ? <div className='flex items-end pb-2'><CheckboxComponent checked={isDefault} onChange={(event) => setIsDefault(event.target.checked)}>Đặt làm tài khoản mặc định</CheckboxComponent></div> : <><div><label className='mb-1 block text-sm font-medium'>Trạng thái</label><SelectComponent className='w-full' value={formStatus} onChange={setFormStatus} options={[{ label: 'Hoạt động', value: 'ACTIVE' }, { label: 'Không hoạt động', value: 'INACTIVE' }, { label: 'Đã xác minh', value: 'VERIFIED', disabled: true }]} /></div><div><label className='mb-1 block text-sm font-medium' htmlFor='bank-edit-reason'>Lý do</label><Input id='bank-edit-reason' value={reason} onChange={(event) => setReason(event.target.value)} /></div></>}
        {editing === 'create' && <BankAccountNotice tone='warning' className='col-span-full'>Thêm tài khoản yêu cầu xác thực OTP và được ghi vào nhật ký thao tác.</BankAccountNotice>}
      </div>
    </DialogModal>
    <DialogModal open={action !== null} title={action?.type === 'default' ? 'Đặt tài khoản mặc định' : action?.row.holdMode ? 'Bỏ tạm giữ' : 'Tạm giữ tài khoản'} onCancel={() => { setAction(null); setReason('') }} onOk={() => void confirmAction()} okButtonProps={{ loading: defaultState.isLoading || holdState.isLoading }} okText='Xác nhận'><TextArea aria-label='Lý do' value={reason} onChange={(event) => setReason(event.target.value)} rows={3} maxLength={500} placeholder='Nhập lý do' /></DialogModal>
    <DialogModal open={otpChallenge !== null} title='Xác nhận bằng OTP' onCancel={() => { setOtpChallenge(null); setPendingOtpAction(null); setOtpCode('') }} onOk={() => void confirmOtp()} okButtonProps={{ loading: challengeState.isLoading || createState.isLoading || updateState.isLoading || defaultState.isLoading }} okText='Xác nhận'>
      <div className='space-y-3'>
        <p className='text-sm text-muted-foreground'>Mã OTP đã gửi tới {otpChallenge?.maskedRecipient}. Mã có hiệu lực {otpChallenge?.expiresInSeconds ?? 0} giây.</p>
        <div><label className='mb-1 block text-sm font-medium' htmlFor='bank-otp'>Mã OTP</label><Input id='bank-otp' value={otpCode} onChange={(event) => setOtpCode(event.target.value)} autoComplete='one-time-code' inputMode='numeric' maxLength={10} /></div>
      </div>
    </DialogModal>
  </main>
}

export default BankAccount
