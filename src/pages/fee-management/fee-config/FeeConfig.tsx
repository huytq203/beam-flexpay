import { FeeDomainTabs } from '@components/fee/FeeDomainTabs'
import {
  CONFIGURABLE_FEE_DOMAINS,
  FeeDomain
} from '@components/fee/feeDomain'
import { ArrowLeftOutlined, WarningCircleIcon } from '@components/icons'
import { ButtonComponent, CardComponent, ModalComponent } from '@components/index'
import { PATHS } from '@constants/pathConstant'
import { useNavigate, useParams } from 'react-router-dom'
import { AssignmentSection } from './components/AssignmentSection'
import { FeeComponentList } from './components/FeeComponentList'
import { PolicyGeneralSection } from './components/PolicyGeneralSection'
import { useFeeConfigDetail } from './hooks/useFeeConfigDetail'
import { buildEmptyForm, useFeeConfigForm } from './hooks/useFeeConfigForm'
import {
  useFeeConfigSubmit,
  type FeeConfigSnapshot
} from './hooks/useFeeConfigSubmit'
import type { FeeConfigFormValues } from './schemas/feeConfig.schema'

interface FeeConfigFormProps {
  defaultValues: FeeConfigFormValues
  snapshot: FeeConfigSnapshot | null
  readOnly?: boolean
}

/**
 * Biểu mẫu đứng sau khi dữ liệu đã sẵn sàng.
 *
 * Tách ra khỏi màn để `useForm` chỉ khởi tạo một lần với giá trị thật — nạp
 * xong mới reset là mất những gì người dùng vừa gõ trong lúc chờ.
 */
const FeeConfigForm = ({
  defaultValues,
  snapshot,
  readOnly = false
}: FeeConfigFormProps) => {
  const isEdit = Boolean(snapshot)
  const navigate = useNavigate()
  const { form, changeDomain } = useFeeConfigForm(defaultValues)
  const { submit, isSubmitting, orphan, dismissOrphan } =
    useFeeConfigSubmit(snapshot)
  const { control, handleSubmit, watch, formState } = form
  const feeDomain = watch('feeDomain')
  const hasComponents = watch('components').length > 0

  return (
    <form onSubmit={handleSubmit(submit)}>
      <ButtonComponent
        htmlType='button'
        type='default'
        className='mb-3!'
        content='Về danh sách'
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(PATHS.FEE_V4.POLICY_LIST)}
      />
      <CardComponent className='mb-3!'>
        <div className='flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4'>
          <p className='max-w-[70ch] text-[13px] text-muted-foreground'>
            {readOnly
              &&'Đang xem chi tiết chính sách'
             }
          </p>

        </div>

        <FeeDomainTabs
          value={feeDomain}
          onChange={changeDomain}
          disabled={isEdit || readOnly || hasComponents}
          domains={
            isEdit && feeDomain === FeeDomain.MERCHANT
              ? undefined
              : CONFIGURABLE_FEE_DOMAINS
          }
          className='mt-4'
        />
 
      </CardComponent>

      <CardComponent className='mb-3!'>
        <PolicyGeneralSection control={control} readOnly={readOnly} />
      </CardComponent>

      <CardComponent className='mb-3!'>
        <AssignmentSection control={control} readOnly={readOnly} />
      </CardComponent>

      <CardComponent className='mb-3!'>
        <FeeComponentList
          control={control}
          feeDomain={feeDomain}
          serviceType={watch('serviceType')}
          error={formState.errors.components?.message}
          readOnly={readOnly}
        />
      </CardComponent>

      <div className='flex flex-col gap-2 md:flex-row md:justify-end'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content={readOnly ? 'Về danh sách' : 'Huỷ'}
          icon={readOnly ? <ArrowLeftOutlined /> : undefined}
          onClick={() => navigate(PATHS.FEE_V4.POLICY_LIST)}
        />
        {!readOnly && (
          <ButtonComponent
            htmlType='submit'
            type='primary'
            content='Thiết lập'
            loading={isSubmitting}
          />
        )}
      </div>

      <ModalComponent
        open={Boolean(orphan)}
        title='Đã tạo chính sách, chưa gán được đối tượng'
        okText='Mở màn sửa để gán'
        cancelText='Để sau'
        onOk={() => {
          if (orphan) navigate(PATHS.FEE_V4.POLICY_EDIT(orphan.id))
        }}
        onCancel={dismissOrphan}
      >
        <p className='text-[13px] text-foreground'>
          Chính sách <strong>{orphan?.name}</strong> đã lưu cùng đầy đủ thành
          phần phí. Bước gán đối tượng thất bại nên chính sách chưa áp vào giao
          dịch nào.
        </p>
        <p className='mt-2 text-[13px] text-muted-foreground'>
          Chính sách vẫn nằm nguyên trong danh sách. Mở màn sửa để gán lại, đừng
          tạo mới — tạo mới sẽ để lại hai bản ghi trùng tên.
        </p>
      </ModalComponent>
    </form>
  )
}

/**
 * Màn cấu hình phí: gộp tạo chính sách, gán đối tượng và cấu hình thành phần
 * vào một biểu mẫu, thay cho ba màn rời trước đây.
 */
const FeeConfig = () => {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const { values, snapshot, isEditable, isLoading, isError } =
    useFeeConfigDetail(id)

  if (id && isLoading) {
    return (
      <CardComponent>
        <div className='space-y-3 py-4'>
          <div className='h-7 w-56 animate-pulse rounded bg-muted' />
          <div className='h-4 w-80 animate-pulse rounded bg-muted' />
          <div className='h-40 w-full animate-pulse rounded-lg bg-muted' />
        </div>
      </CardComponent>
    )
  }

  if (id && isError) {
    return (
      <CardComponent>
        <div className='flex flex-col items-start gap-3 py-8'>
          <p className='flex items-center gap-2 text-[13px] font-semibold text-danger-strong'>
            <WarningCircleIcon size={18} weight='bold' aria-hidden />
            Không tải được chính sách phí này
          </p>
          <p className='max-w-[60ch] text-[13px] text-muted-foreground'>
            Chính sách có thể đã bị xoá, hoặc dịch vụ phí chưa trả lời. Quay lại
            danh sách và mở lại từ đó.
          </p>
         
        </div>
      </CardComponent>
    )
  }

  return (
    <FeeConfigForm
      // Khoá theo id để đổi bản ghi là dựng lại form với giá trị mới.
      key={id ?? 'create'}
      snapshot={snapshot}
      defaultValues={values ?? buildEmptyForm()}
      readOnly={Boolean(id && !isEditable)}
    />
  )
}

export default FeeConfig
