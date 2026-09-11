import { FeeDomainTabs } from '@components/fee/FeeDomainTabs'
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
}

/**
 * Biểu mẫu đứng sau khi dữ liệu đã sẵn sàng.
 *
 * Tách ra khỏi màn để `useForm` chỉ khởi tạo một lần với giá trị thật — nạp
 * xong mới reset là mất những gì người dùng vừa gõ trong lúc chờ.
 */
const FeeConfigForm = ({ defaultValues, snapshot }: FeeConfigFormProps) => {
  const isEdit = Boolean(snapshot)
  const navigate = useNavigate()
  const { form, changeDomain } = useFeeConfigForm(defaultValues)
  const { submit, isSubmitting, orphan, dismissOrphan } =
    useFeeConfigSubmit(snapshot)
  const { control, handleSubmit, watch, formState } = form
  const feeDomain = watch('feeDomain')

  return (
    <form onSubmit={handleSubmit(submit)}>
      <CardComponent className='mb-3!'>
        <div className='flex flex-wrap items-start justify-between gap-3 border-b border-border pb-4'>
          <p className='max-w-[70ch] text-[13px] text-muted-foreground'>
            Thông tin chính sách, đối tượng áp dụng và các thành phần phí lưu
            cùng một lần. Sai một chính sách là sai phí trên toàn hệ thống.
          </p>
          <span className='inline-flex items-center rounded-[3px] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-line-fee-ink ring-1 ring-inset ring-line-fee'>
            Kiểm soát
          </span>
        </div>

        <FeeDomainTabs
          value={feeDomain}
          onChange={changeDomain}
          disabled={isEdit}
          className='mt-4'
        />
        {isEdit && (
          <p className='mt-2 text-[13px] text-muted-foreground'>
            Miền phí đã chốt khi tạo và không đổi được. Cần miền khác thì tạo
            chính sách mới.
          </p>
        )}
      </CardComponent>

      <CardComponent className='mb-3!'>
        <PolicyGeneralSection control={control} />
      </CardComponent>

      <CardComponent className='mb-3!'>
        <AssignmentSection control={control} />
      </CardComponent>

      <CardComponent className='mb-3!'>
        <FeeComponentList
          control={control}
          feeDomain={feeDomain}
          serviceType={watch('serviceType')}
          error={formState.errors.components?.message}
        />
      </CardComponent>

      <div className='flex flex-col gap-2 md:flex-row md:justify-end'>
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Huỷ'
          onClick={() => navigate(PATHS.FEE_V4.POLICY_LIST)}
        />
        <ButtonComponent
          htmlType='submit'
          type='primary'
          content='Thiết lập'
          loading={isSubmitting}
        />
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

  if (id && values && !isEditable) {
    return (
      <CardComponent>
        <div className='flex flex-col items-start gap-3 py-8'>
          <p className='flex items-center gap-2 text-[13px] font-semibold text-warning-strong'>
            <WarningCircleIcon size={18} weight='bold' aria-hidden />
            Chính sách này không còn sửa được
          </p>
          <p className='max-w-[60ch] text-[13px] text-muted-foreground'>
            Dịch vụ phí khoá cấu hình sau khi chính sách rời trạng thái khởi tạo
            hoặc bị từ chối. Muốn đổi biểu phí thì tạo chính sách mới rồi ngừng
            áp dụng chính sách này.
          </p>
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Về danh sách'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(PATHS.FEE_V4.POLICY_LIST)}
          />
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
          <ButtonComponent
            htmlType='button'
            type='default'
            content='Về danh sách'
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(PATHS.FEE_V4.POLICY_LIST)}
          />
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
    />
  )
}

export default FeeConfig
