import { ArrowLeftOutlined, WarningCircleIcon } from '@components/icons'
import {
  ButtonComponent,
  CardComponent,
  ModalComponent
} from '@components/index'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { AssignmentSection } from './components/AssignmentSection'
import { FeeComponentList } from './components/FeeComponentList'
import { InputCostRouteSection } from './components/InputCostRouteSection'
import { PolicyGeneralSection } from './components/PolicyGeneralSection'
import { useFeeConfigDetail } from './hooks/useFeeConfigDetail'
import { buildEmptyForm, useFeeConfigForm } from './hooks/useFeeConfigForm'
import {
  useFeeConfigSubmit,
  type FeeConfigSnapshot
} from './hooks/useFeeConfigSubmit'
import { FEE_SCOPE, POLICY_KIND } from './constants/feeConfigFields'
import {
  FEE_SCREEN,
  FEE_SCREEN_CONFIG,
  feeScreenOfPolicy,
  type FeeScreen
} from './constants/feeScreen'
import type { FeeConfigFormValues } from './schemas/feeConfig.schema'
import { inputCostFormSchema } from './schemas/inputCostConfig.schema'

interface FeeConfigFormProps {
  /** Màn của form: quyết định loại chính sách (ô gán, luồng thành phần, payload), đường dẫn và ô chọn loại giao dịch. */
  screen: FeeScreen
  defaultValues: FeeConfigFormValues
  snapshot: FeeConfigSnapshot | null
  feeCode?: string | null
  readOnly?: boolean
}

/**
 * Biểu mẫu đứng sau khi dữ liệu đã sẵn sàng.
 *
 * Tách ra khỏi màn để `useForm` chỉ khởi tạo một lần với giá trị thật — nạp
 * xong mới reset là mất những gì người dùng vừa gõ trong lúc chờ.
 */
const FeeConfigForm = ({
  screen,
  defaultValues,
  snapshot,
  feeCode,
  readOnly = false
}: FeeConfigFormProps) => {
  const navigate = useNavigate()
  const { policyKind, listPath, editPath } = FEE_SCREEN_CONFIG[screen]
  const isInputCost = policyKind === POLICY_KIND.INPUT_COST
  const { form, changeServiceType } = useFeeConfigForm(
    defaultValues,
    isInputCost ? inputCostFormSchema : undefined
  )
  const { submit, isSubmitting, orphan, dismissOrphan } = useFeeConfigSubmit(
    snapshot,
    policyKind
  )
  const { control, handleSubmit, watch, formState } = form

  return (
    <form onSubmit={handleSubmit(submit)}>
      <ButtonComponent
        htmlType='button'
        type='default'
        className='mb-3!'
        content='Về danh sách'
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(listPath)}
      />
      {/* Miền phí suy ra từ loại giao dịch nên không còn hàng chọn miền ở màn sửa và chi tiết. */}
      {readOnly && (
        <p className='mb-3 text-[13px] text-muted-foreground'>
          Đang xem chi tiết chính sách
        </p>
      )}
      <CardComponent className='mb-3!'>
        <PolicyGeneralSection
          control={control}
          readOnly={readOnly}
          feeCode={feeCode}
          screen={screen}
          onServiceTypeChange={changeServiceType}
        />
      </CardComponent>

      <CardComponent className='mb-3!'>
        {isInputCost ? (
          <InputCostRouteSection
            control={control}
            readOnly={readOnly}
          />
        ) : (
          <AssignmentSection
            control={control}
            readOnly={readOnly}
          />
        )}
      </CardComponent>

      <CardComponent className='mb-3!'>
        <FeeComponentList
          control={control}
          feeScope={isInputCost ? FEE_SCOPE.INPUT_COST : FEE_SCOPE.OUTPUT_FEE}
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
          onClick={() => navigate(listPath)}
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
          if (orphan) navigate(editPath(orphan.id))
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

interface FeeConfigPageProps {
  screen: FeeScreen
}

/**
 * Màn cấu hình phí: gộp tạo chính sách, gán đối tượng và cấu hình thành phần
 * vào một biểu mẫu, thay cho ba màn rời trước đây. Một biểu mẫu phục vụ ba màn (phí khách, phí đầu vào
 * và phí ĐVCNTT) vì chung phần lớn ô nhập; loại chính sách không đổi được sau khi tạo.
 */
export const FeeConfigPage = ({ screen }: FeeConfigPageProps) => {
  const { id } = useParams<{ id: string }>()
  const { policyKind } = FEE_SCREEN_CONFIG[screen]
  const isInputCost = policyKind === POLICY_KIND.INPUT_COST
  const {
    values,
    snapshot,
    feeCode,
    isEditable,
    policyKind: savedKind,
    isLoading,
    isError
  } = useFeeConfigDetail(
    id,
    isInputCost ? FEE_SCOPE.INPUT_COST : FEE_SCOPE.OUTPUT_FEE
  )

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
            <WarningCircleIcon
              size={18}
              weight='bold'
              aria-hidden
            />
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

  // Mở nhầm màn của loại kia (liên kết cũ, gõ tay URL): chuyển sang đúng màn thay vì
  // hiện form thiếu thành phần. Màn đúng suy từ loại chính sách và miền phí đã lưu.
  if (id && savedKind) {
    const savedScreen = feeScreenOfPolicy(savedKind, values?.feeDomain)
    if (savedScreen !== screen) {
      return (
        <Navigate
          replace
          to={FEE_SCREEN_CONFIG[savedScreen].editPath(id)}
        />
      )
    }
  }

  return (
    <FeeConfigForm
      screen={screen}
      // Khoá theo id để đổi bản ghi là dựng lại form với giá trị mới.
      key={id ?? 'create'}
      snapshot={snapshot}
      feeCode={feeCode}
      defaultValues={values ?? buildEmptyForm()}
      readOnly={Boolean(id && !isEditable)}
    />
  )
}

/** Màn chính sách phí khách (phí đầu ra). */
const FeeConfig = () => <FeeConfigPage screen={FEE_SCREEN.CUSTOMER_FEE} />

export default FeeConfig
