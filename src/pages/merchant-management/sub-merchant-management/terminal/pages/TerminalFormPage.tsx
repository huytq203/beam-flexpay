import { Link, useNavigate, useParams } from 'react-router-dom'

import { SCREENS, useScreenAccess } from '@/app/permissions'
import { CardComponent } from '@components/index'

import { ManagementPageHeader } from '../../shared/ManagementPageHeader'
import { TerminalForm } from '../components/TerminalForm'
import { TerminalNotFound } from '../components/TerminalNotFound'
import {
  createTerminal,
  updateTerminal,
  useTerminal
} from '../hooks/useTerminals'
import type { TerminalFormValue } from '../schemas/terminal.schema'

const EMPTY_FORM: TerminalFormValue = {
  parentMerchantId: '',
  subMerchantId: '',
  name: '',
  type: 'STATIC_QR',
  address: '',
  phone: '',
  note: ''
}

const toFormValue = (
  record: NonNullable<ReturnType<typeof useTerminal>>
): TerminalFormValue => ({
  parentMerchantId: record.parentMerchantId,
  subMerchantId: record.subMerchantId,
  name: record.name,
  type: record.type,
  address: record.address,
  phone: record.phone,
  note: record.note
})

export default function TerminalFormPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const record = useTerminal(id)
  const access = useScreenAccess('MERCHANT_TERMINAL')
  const mode = id ? 'edit' : 'create'
  const listPath = SCREENS.MERCHANT_TERMINAL.path
  const goToList = (): void => {
    void navigate(listPath)
  }

  if (mode === 'edit' && !record) return <TerminalNotFound onBack={goToList} />

  if (record?.status === 'SUSPENDED_BY_SUB') {
    return (
      <section
        className='space-y-4 rounded-lg border border-danger-strong/30 bg-danger/5 p-5'
        role='alert'
      >
        <h1 className='font-display text-lg font-semibold text-foreground'>
          Terminal đang tạm ngưng theo Sub-merchant
        </h1>
        <p className='text-sm text-muted-foreground'>
          Cần mở khóa Sub-merchant cha trước khi cập nhật Terminal này.
        </p>
        <Link
          className='inline-flex rounded-md text-sm font-semibold text-secondary-foreground underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-primary'
          to={`${SCREENS.MERCHANT_SUB_MERCHANT.path}/detail/${record.subMerchantId}`}
        >
          Xem Sub-merchant cha
        </Link>
      </section>
    )
  }

  const handleSubmit = (value: TerminalFormValue): void => {
    const saved =
      mode === 'create'
        ? createTerminal(value)
        : updateTerminal(id ?? '', value)
    if (saved) navigate(`${listPath}/detail/${saved.id}`)
  }

  return (
    <main className='flex min-w-0 flex-col gap-3'>
      <ManagementPageHeader
        title={mode === 'create' ? 'Thêm Terminal' : 'Cập nhật Terminal'}
        description='Thiết lập điểm chấp nhận thanh toán và quan hệ kế thừa từ Sub-merchant.'
      />
      <CardComponent className='border border-border bg-background shadow-none'>
        <TerminalForm
          canSubmit={
            mode === 'create' ? access.can('create') : access.can('edit')
          }
          defaultValues={record ? toFormValue(record) : EMPTY_FORM}
          mode={mode}
          onCancel={goToList}
          onSubmit={handleSubmit}
          tid={record?.tid}
          inheritedPaymentMethods={record?.inheritedPaymentMethods}
          inheritedLimitLabel={record?.inheritedLimitLabel}
        />
      </CardComponent>
    </main>
  )
}
