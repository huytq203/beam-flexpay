import { Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'

import { SCREENS, useScreenAccess } from '@/app/permissions'
import { ArrowLeftOutlined, SaveOutlined, WarningIcon } from '@components/icons'
import { ButtonComponent, CardComponent, ScrollToTopButton } from '@components/index'
import { FORBIDDENERROR } from '@constants/routersConstant'
import { globalMessage } from '@hooks/useMessage'

import { SubMerchantForm } from '../components/SubMerchantForm'
import {
  createFixtureSubMerchant,
  updateFixtureSubMerchant,
  useSubMerchantRecord
} from '../hooks/useSubMerchants'
import type { SubMerchantFormValue } from '../schemas/subMerchant.schema'

interface FormPageHeaderProps {
  mode: 'create' | 'edit'
  onBack: () => void
}

function FormPageHeader({ mode, onBack }: FormPageHeaderProps) {
  return (
    <CardComponent className='sticky top-0 z-10! border border-border bg-background shadow-[var(--shadow-micro)]'>
      <header className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
        <div className='flex min-w-0 items-center gap-3'>
          <ButtonComponent aria-label='Quay lại danh sách Sub-merchant' htmlType='button' icon={<ArrowLeftOutlined aria-hidden />} onClick={onBack} type='default' />
          <div className='min-w-0'>
            <h1 className='font-display text-lg font-semibold text-foreground'>{mode === 'create' ? 'Thêm Sub-merchant' : 'Cập nhật Sub-merchant'}</h1>
            <p className='text-sm text-muted-foreground'>Thiết lập hồ sơ điểm kinh doanh và phạm vi kế thừa từ Merchant cha.</p>
          </div>
        </div>
        <ButtonComponent content={mode === 'create' ? 'Thêm Sub-merchant' : 'Lưu thay đổi'} form='sub-merchant-form' htmlType='submit' icon={<SaveOutlined aria-hidden />} />
      </header>
    </CardComponent>
  )
}

function SubMerchantNotFound({ onBack }: { onBack: () => void }) {
  return (
    <CardComponent className='border border-border bg-background shadow-none'>
      <section className='flex min-h-64 flex-col items-center justify-center gap-3 text-center' role='alert'>
        <WarningIcon aria-hidden className='text-warning-strong' size={32} />
        <h1 className='font-display text-lg font-semibold text-foreground'>Không tìm thấy Sub-merchant</h1>
        <p className='text-sm text-muted-foreground'>Bản ghi có thể đã bị xóa hoặc đường dẫn không còn hợp lệ.</p>
        <ButtonComponent content='Về danh sách Sub-merchant' htmlType='button' onClick={onBack} type='default' />
      </section>
    </CardComponent>
  )
}

export default function SubMerchantFormPage() {
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const access = useScreenAccess('MERCHANT_SUB_MERCHANT')
  const mode = location.pathname.includes('/edit/') ? 'edit' : 'create'
  const record = useSubMerchantRecord(id)
  const basePath = SCREENS.MERCHANT_SUB_MERCHANT.path

  if (!access.can(mode === 'edit' ? 'edit' : 'create')) {
    return <Navigate replace to={FORBIDDENERROR} />
  }

  if (mode === 'edit' && !record) {
    return <SubMerchantNotFound onBack={() => void navigate(basePath)} />
  }

  const handleSubmit = (value: SubMerchantFormValue): void => {
    const next = mode === 'create'
      ? createFixtureSubMerchant(value)
      : updateFixtureSubMerchant(record as NonNullable<typeof record>, value)
    globalMessage.success(
      mode === 'create' ? 'Thêm Sub-merchant thành công' : 'Cập nhật Sub-merchant thành công'
    )
    void navigate(`${basePath}/detail/${next.id}`)
  }

  return (
    <main className='mx-0 flex min-w-0 flex-col gap-3 md:mx-5'>
      <FormPageHeader mode={mode} onBack={() => void navigate(basePath)} />
      <SubMerchantForm mode={mode} onSubmit={handleSubmit} record={record} />
      <ScrollToTopButton />
    </main>
  )
}
