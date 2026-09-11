import { FormInputNumber, FormSelect } from '@components/form'
import { FeeDomain } from '@components/fee/feeDomain'
import { WarningCircleIcon } from '@components/icons'
import { CardComponent, ModalComponent } from '@components/index'
import { COMPONENT_TYPE_LABELS } from '@constants/feeLabels'
import { zodResolver } from '@hookform/resolvers/zod'
import { getExecutablePayer } from '@utils/fee-execution'
import { useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import {
  PAYER_TYPE_LABEL,
  PAYER_TYPE_OPTIONS,
  VAT_BASE_COMPONENT_TYPE,
  VAT_COMPONENT_TYPE
} from '../constants/feeConfigFields'
import {
  CalculationMethod,
  feeComponentFormSchema,
  usesTiers,
  type FeeComponentFormValues
} from '../schemas/feeConfig.schema'
import {
  CALCULATION_METHOD_LABEL,
  collectBaseTypes,
  summariseBaseType
} from '../utils/feeComponentSummary'
import { BaseTypePreview } from './BaseTypePreview'
import { FeeTierEditor } from './FeeTierEditor'

interface FeeComponentDialogProps {
  open: boolean
  /** Bỏ trống là thêm mới. */
  initialValue: FeeComponentFormValues | null
  /** Các thành phần đứng trước — chỉ chúng làm cơ sở tính được. */
  precedingComponents: readonly FeeComponentFormValues[]
  feeDomain: FeeDomain
  /** Loại giao dịch của chính sách, dùng để suy người chịu phí mặc định. */
  serviceType: string
  onSave: (value: FeeComponentFormValues) => void
  onCancel: () => void
}

const COMPONENT_TYPE_OPTIONS = Object.entries(COMPONENT_TYPE_LABELS).map(
  ([value, label]) => ({ value, label })
)

const BASE_ON_OPTIONS = [
  { value: 'AMOUNT', label: 'Số tiền giao dịch' },
  { value: 'FEE_COMPONENT', label: 'Một thành phần phí khác' }
]

/** Miền Bank chỉ tính trên số tiền giao dịch — xem ghi chú trong hộp thoại. */
const BANK_BASE_ON_OPTIONS = [BASE_ON_OPTIONS[0]]

const CALCULATION_METHOD_VALUES = [
  CalculationMethod.DIRECT,
  CalculationMethod.PROGRESSIVE_TIER,
  CalculationMethod.FLAT_TIER
]

const emptyComponent = (payerType: string): FeeComponentFormValues => ({
  key: crypto.randomUUID(),
  componentType: '',
  baseOn: 'AMOUNT',
  baseComponentType: null,
  calculationMethod: CalculationMethod.DIRECT,
  payerType,
  fixedAmount: null,
  percentage: null,
  minFee: null,
  maxFee: null,
  roundMode: 'UP',
  tiers: []
})

export const FeeComponentDialog = ({
  open,
  initialValue,
  precedingComponents,
  feeDomain,
  serviceType,
  onSave,
  onCancel
}: FeeComponentDialogProps) => {
  const executablePayer = getExecutablePayer(serviceType)

  /**
   * Dựng giá trị mặc định đúng một lần cho mỗi lần mở.
   *
   * Không dùng `values`: nó reset form mỗi khi tham chiếu đổi, mà `emptyComponent()`
   * sinh object mới sau mỗi render — đủ để React báo vượt độ sâu cập nhật.
   */
  const defaultValues = useMemo(
    () => initialValue ?? emptyComponent(executablePayer ?? 'USER'),
    [initialValue, executablePayer]
  )

  const { control, handleSubmit, setValue, formState } =
    useForm<FeeComponentFormValues>({
      resolver: zodResolver(feeComponentFormSchema),
      defaultValues,
      mode: 'onTouched'
    })

  const componentType = useWatch({ control, name: 'componentType' })
  const baseOn = useWatch({ control, name: 'baseOn' })
  const baseComponentType = useWatch({ control, name: 'baseComponentType' })
  const calculationMethod = useWatch({ control, name: 'calculationMethod' })
  const payerType = useWatch({ control, name: 'payerType' })

  const isVat = componentType === VAT_COMPONENT_TYPE
  const isBank = feeDomain === FeeDomain.BANK
  const tiered = usesTiers(calculationMethod)

  const baseTypes = collectBaseTypes(precedingComponents)
  const hasTransactionFeeAbove = baseTypes.includes(VAT_BASE_COMPONENT_TYPE)

  /**
   * Thuế giá trị gia tăng luôn tính trên phí giao dịch. Khoá luôn ô cơ sở tính
   * thay vì để người dùng chọn rồi báo lỗi ở bước lưu.
   *
   * Chỉ trỏ sẵn sang phí giao dịch khi nó thật sự đứng phía trên. Gán một tham
   * chiếu tới thành phần chưa tồn tại chỉ tạo ra một ô hiển thị mã enum thô mà
   * người dùng không sửa được.
   */
  const handleComponentTypeChange = (next: string | number) => {
    if (next !== VAT_COMPONENT_TYPE) return
    setValue('baseOn', 'FEE_COMPONENT', { shouldValidate: true })
    setValue(
      'baseComponentType',
      hasTransactionFeeAbove ? VAT_BASE_COMPONENT_TYPE : null,
      { shouldValidate: true }
    )
    setValue('calculationMethod', CalculationMethod.DIRECT)
    setValue('fixedAmount', null)
  }

  const allowedBaseTypes = isVat
    ? baseTypes.filter((type) => type === VAT_BASE_COMPONENT_TYPE)
    : baseTypes

  const baseTypeOptions = allowedBaseTypes.map((type) => {
    const summary = summariseBaseType(type, precedingComponents)
    const detail = summary.isSum
      ? `tổng ${summary.formulas.length} thành phần`
      : summary.formulas[0]
    return { value: type, label: `${summary.label} — ${detail}` }
  })

  const selectedBase =
    baseOn === 'FEE_COMPONENT' && baseComponentType
      ? summariseBaseType(baseComponentType, precedingComponents)
      : null

  const methodOptions = (
    isVat ? [CalculationMethod.DIRECT] : CALCULATION_METHOD_VALUES
  ).map((value) => ({ value, label: CALCULATION_METHOD_LABEL[value] }))

  const payerMismatch = Boolean(
    executablePayer && payerType && payerType !== executablePayer
  )

  return (
    <ModalComponent
      open={open}
      title={initialValue ? 'Sửa phí thành phần' : 'Thêm phí thành phần'}
      okText={initialValue ? 'Lưu thành phần' : 'Thêm'}
      cancelText='Huỷ'
      // antd tự giới hạn về `calc(100vw - 32px)` ở màn hẹp, nên một số cố
      // định là đủ và tránh phụ thuộc thứ tự breakpoint của wrapper.
      width={880}
      onOk={handleSubmit(onSave)}
      onCancel={onCancel}
    >
      <div className='flex flex-col gap-3'>
        <CardComponent
          size='small'
          // Nền modal là #fafafa nên card phải trắng đặc và viền theo hairline của
          // hệ thiết kế, nếu không các khối chìm vào nhau đúng như lúc chưa tách.
          className='border-border! bg-background!'
          title='Thành phần này là gì'
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
            <FormSelect
              name='componentType'
              control={control}
              required
              label='Loại phí'
              placeholder='Chọn loại phí'
              allowClear={false}
              options={COMPONENT_TYPE_OPTIONS}
              onChange={handleComponentTypeChange}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            <FormSelect
              name='baseOn'
              control={control}
              required
              label='Tính dựa trên'
              placeholder='Chọn cơ sở tính'
              allowClear={false}
              disabled={isVat}
              // Luật thuế giá trị gia tăng thắng giới hạn của miền Bank: nó
              // tính trên một khoản phí, không tính trên số tiền giao dịch.
              options={isBank && !isVat ? BANK_BASE_ON_OPTIONS : BASE_ON_OPTIONS}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            {isVat && (
              <p className='col-span-12 text-[13px] text-muted-foreground'>
                Thuế giá trị gia tăng luôn tính trên phí giao dịch, không tính
                trên số tiền giao dịch.
                {!hasTransactionFeeAbove &&
                  ' Thêm một thành phần phí giao dịch phía trên trước đã.'}
              </p>
            )}
            {baseOn === 'FEE_COMPONENT' && (
              <FormSelect
                name='baseComponentType'
                control={control}
                required
                label='Thành phần làm cơ sở'
                placeholder={
                  baseTypeOptions.length === 0
                    ? 'Chưa có thành phần nào đứng trước'
                    : 'Chọn thành phần'
                }
                allowClear={false}
                options={baseTypeOptions}
                className='col-span-12 flex flex-col'
              />
            )}
            {selectedBase && (
              <div className='col-span-12'>
                <BaseTypePreview summary={selectedBase} />
              </div>
            )}
            <FormSelect
              name='calculationMethod'
              control={control}
              required
              label='Phương thức tính'
              placeholder='Chọn phương thức'
              allowClear={false}
              options={methodOptions}
              className='col-span-12 flex flex-col'
            />
            {!isVat && (
              <p className='col-span-12 text-[13px] text-muted-foreground'>
                Lũy tiến tách số tiền ra, mỗi khúc tính theo bậc của khúc đó.
                Toàn phần lấy mức của bậc rơi vào rồi áp cho toàn bộ số tiền.
              </p>
            )}
          </div>
        </CardComponent>

        <CardComponent
          size='small'
          className='border-border! bg-background!'
          title='Ai trả, ai hưởng'
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
            <FormSelect
              name='payerType'
              control={control}
              required
              label='Người chịu'
              placeholder='Chọn người chịu phí'
              allowClear={false}
              options={[...PAYER_TYPE_OPTIONS]}
              className='col-span-12 flex flex-col md:col-span-6'
            />
            <div className='col-span-12 flex flex-col md:col-span-6'>
              <p className='font-medium'>Người hưởng</p>
              <p className='mt-2 text-[13px] font-semibold text-foreground'>
                Hệ thống FlexPay
              </p>
            </div>
            {payerMismatch && executablePayer && (
              <p className='col-span-12 flex items-start gap-2 text-[13px] font-medium text-warning-strong'>
                <WarningCircleIcon
                  size={16}
                  weight='bold'
                  aria-hidden
                  className='mt-0.5 shrink-0'
                />
                Loại giao dịch này chỉ thu được từ{' '}
                {PAYER_TYPE_LABEL[executablePayer]}. Chọn khác đi thì bước duyệt
                sẽ từ chối chính sách.
              </p>
            )}
            {isBank && (
              <p className='col-span-12 text-[13px] text-muted-foreground'>
                Miền Bank chưa đặt được người chịu và người hưởng là ngân hàng:
                danh mục người chịu của dịch vụ phí không có giá trị ngân hàng,
                và người hưởng khác hệ thống bị chặn ở bước duyệt.
              </p>
            )}
          </div>
        </CardComponent>

        <CardComponent
          size='small'
          className='border-border! bg-background!'
          title='Mức phí'
        >
          {tiered ? (
            <FeeTierEditor
              control={control}
              error={formState.errors.tiers?.message}
            />
          ) : (
            <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
              <FormInputNumber
                name='percentage'
                control={control}
                allowEmpty
                label='Phí %'
                placeholder='Để trống nếu không thu theo phần trăm'
                className='col-span-12 flex flex-col md:col-span-6'
              />
              {!isVat && (
                <FormInputNumber
                  name='fixedAmount'
                  control={control}
                  allowEmpty
                  label='Phí cố định (đồng)'
                  placeholder='Để trống nếu không thu phí cố định'
                  className='col-span-12 flex flex-col md:col-span-6'
                />
              )}
            </div>
          )}
        </CardComponent>

        <CardComponent
          size='small'
          className='border-border! bg-background!'
          title='Giới hạn'
        >
          <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
            <FormInputNumber
              name='minFee'
              control={control}
              allowEmpty
              label='Phí tối thiểu (đồng)'
              placeholder='Để trống nếu không đặt sàn'
              className='col-span-12 flex flex-col md:col-span-6'
            />
            <FormInputNumber
              name='maxFee'
              control={control}
              allowEmpty
              label='Phí tối đa (đồng)'
              placeholder='Để trống nếu không đặt trần'
              className='col-span-12 flex flex-col md:col-span-6'
            />
          </div>
        </CardComponent>
      </div>
    </ModalComponent>
  )
}
