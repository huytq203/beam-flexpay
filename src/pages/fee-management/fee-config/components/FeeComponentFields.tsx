import { FormInputNumber, FormSelect } from '@components/form'
import { CardComponent } from '@components/index'
import type { Control } from 'react-hook-form'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import type { BaseTypeSummary } from '../utils/feeComponentSummary'
import { BaseTypePreview } from './BaseTypePreview'
import { FeeTierEditor } from './FeeTierEditor'

interface Option {
  value: string
  label: string
}
interface FeeComponentFieldsProps {
  control: Control<FeeComponentFormValues>
  componentTypeOptions: Option[]
  baseOnOptions: Option[]
  baseTypeOptions: Option[]
  methodOptions: Option[]
  payerTypeOptions: readonly Option[]
  payerDisabled?: boolean
  beneficiaryTypeOptions: readonly Option[]
  beneficiaryDisabled: boolean
  payerType: string
  baseOn: string
  selectedBase: BaseTypeSummary | null
  isVat: boolean
  tiered: boolean
  tierError?: string
  onComponentTypeChange: (next: string | number) => void
  onMethodChange: (next: string | number) => void
  onPayerChange: (next: string | number) => void
  /**
   * Chuyển tiền "Cả hai bên cùng chịu": form riêng chứa mức phí của người nhận. Loại phí, cách
   * tính và người hưởng dùng chung với người chuyển nên không lặp lại.
   */
  receiver?: {
    control: Control<FeeComponentFormValues>
    tierError?: string
  }
}

export const FeeComponentFields = ({
  control,
  componentTypeOptions,
  baseOnOptions,
  baseTypeOptions,
  methodOptions,
  payerTypeOptions,
  payerDisabled = false,
  beneficiaryTypeOptions,
  beneficiaryDisabled,
  payerType,
  baseOn,
  selectedBase,
  isVat,
  tiered,
  tierError,
  onComponentTypeChange,
  onMethodChange,
  onPayerChange,
  receiver
}: FeeComponentFieldsProps) => (
  <>
    <CardComponent
      size='small'
      // Nền modal là #fafafa nên card phải trắng đặc và viền theo hairline của
      // hệ thiết kế, nếu không các khối chìm vào nhau đúng như lúc chưa tách.
      className='border-border! bg-background!'
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormSelect
          name='componentType'
          control={control}
          required
          label='Loại phí'
          placeholder='Chọn loại phí'
          allowClear={false}
          options={componentTypeOptions}
          onChange={onComponentTypeChange}
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
          // Thành phần thường chỉ được tính trên thành phần khác khi phía
          // trên thực sự đã có một thành phần để chọn làm cơ sở.
          options={baseOnOptions}
          className='col-span-12 flex flex-col md:col-span-6'
        />

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
        {/* VAT luôn tính trực tiếp theo %, không có lựa chọn công thức. */}
        {!isVat && (
          <FormSelect
            name='calculationMethod'
            control={control}
            required
            label='Phương thức tính'
            placeholder='Chọn phương thức'
            allowClear={false}
            options={methodOptions}
            onChange={onMethodChange}
            className='col-span-12 flex flex-col'
          />
        )}
      </div>
    </CardComponent>

    <CardComponent
      size='small'
      className='border-border! bg-background!'
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormSelect
          name='payerType'
          control={control}
          required
          label='Người chịu'
          placeholder='Chọn người chịu phí'
          allowClear={false}
          options={[...payerTypeOptions]}
          disabled={payerDisabled}
          onChange={onPayerChange}
          className='col-span-12 flex flex-col md:col-span-6'
        />
        <FormSelect
          name='beneficiaryType'
          control={control}
          required
          label='Người hưởng'
          placeholder='Chọn người hưởng phí'
          allowClear={false}
          disabled={beneficiaryDisabled}
          options={[...beneficiaryTypeOptions]}
          className='col-span-12 flex flex-col md:col-span-6'
        />
      </div>
    </CardComponent>

    {receiver ? (
      <div
        className={
          tiered
            ? 'grid grid-cols-1 gap-3'
            : 'grid grid-cols-1 gap-3 md:grid-cols-2'
        }
      >
        <FeeSideFields
          title='Người chuyển chịu'
          control={control}
          isVat={isVat}
          tiered={tiered}
          tierError={tierError}
        />
        <FeeSideFields
          title='Người nhận chịu'
          control={receiver.control}
          isVat={isVat}
          tiered={tiered}
          tierError={receiver.tierError}
          idPrefix='receiver'
        />
      </div>
    ) : (
      <FeeRateFields
        control={control}
        payerType={payerType}
        isVat={isVat}
        tiered={tiered}
        tierError={tierError}
      />
    )}
  </>
)

interface FeeRateFieldsProps {
  control: Control<FeeComponentFormValues>
  payerType: string
  isVat: boolean
  tiered: boolean
  tierError?: string
  /** Hậu tố tiêu đề để phân biệt hai bên khi cả hai cùng chịu phí. */
  titleSuffix?: string
  /** Tiền tố id để ô của người nhận không trùng id với ô người chuyển. */
  idPrefix?: string
}

/** Mức phí và giới hạn của một thành phần. */
const FeeRateFields = ({
  control,
  payerType,
  isVat,
  tiered,
  tierError,
  titleSuffix = '',
  idPrefix
}: FeeRateFieldsProps) => (
  <>
  <CardComponent
    size='small'
    className='border-border! bg-background!'
    title={`${payerType === 'SYSTEM' ? 'Mức chi phí dự kiến' : 'Mức phí'}${titleSuffix}`}
  >
    {tiered ? (
      <FeeTierEditor
        control={control}
        error={tierError}
        idPrefix={idPrefix}
      />
    ) : (
      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormInputNumber
          thousandSeparator
          name='percentage'
          control={control}
          idPrefix={idPrefix}
          allowEmpty
          label={'Phí linh hoạt (%)'}
          placeholder='Để trống sẽ tự điền 0'
          className={
            isVat
              ? 'col-span-12 flex flex-col md:col-span-12'
              : 'col-span-12 flex flex-col md:col-span-6'
          }
        />
        {!isVat && (
          <FormInputNumber
            thousandSeparator
            name='fixedAmount'
            control={control}
            idPrefix={idPrefix}
            allowEmpty
            label={
             'Phí cố định (VNĐ)'
            }
            placeholder='Để trống sẽ tự điền 0'
            className='col-span-12 flex flex-col md:col-span-6'
          />
        )}
      </div>
    )}
  </CardComponent>

  {/* Sàn/trần chỉ áp cho cách tính mặc định: bậc thang đã có sàn/trần riêng ở từng bậc, VAT không có. */}
  {!tiered && !isVat && (
    <CardComponent
      size='small'
      className='border-border! bg-background!'
      title={`Giới hạn${titleSuffix}`}
    >
      <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
        <FormInputNumber
          thousandSeparator
          name='minFee'
          control={control}
          idPrefix={idPrefix}
          allowEmpty
          label='Phí tối thiểu (VNĐ)'
          placeholder='Để trống nếu không đặt sàn'
          className='col-span-12 flex flex-col md:col-span-6'
        />
        <FormInputNumber
          thousandSeparator
          name='maxFee'
          control={control}
          idPrefix={idPrefix}
          allowEmpty
          label='Phí tối đa (VNĐ)'
          placeholder='Để trống nếu không đặt trần'
          className='col-span-12 flex flex-col md:col-span-6'
        />
      </div>
    </CardComponent>
  )}
  </>
)

interface FeeSideFieldsProps {
  title: string
  control: Control<FeeComponentFormValues>
  isVat: boolean
  tiered: boolean
  tierError?: string
  idPrefix?: string
}

/**
 * Mức phí và giới hạn của một bên khi cả hai bên cùng chịu: gọn trong một khối để hai bên đứng
 * cạnh nhau và đối chiếu được theo hàng.
 */
const FeeSideFields = ({
  title,
  control,
  isVat,
  tiered,
  tierError,
  idPrefix
}: FeeSideFieldsProps) => (
  <CardComponent
    size='small'
    className='border-border! bg-background!'
    title={title}
  >
    {tiered ? (
      <FeeTierEditor
        control={control}
        error={tierError}
        idPrefix={idPrefix}
      />
    ) : (
      <div className='grid grid-cols-2 gap-3'>
        <FormInputNumber
          thousandSeparator
          name='percentage'
          control={control}
          idPrefix={idPrefix}
          allowEmpty
          label='Phí (%)'
          placeholder='Trống = 0'
          className='col-span-1 flex flex-col'
        />
        {!isVat && (
          <>
            <FormInputNumber
              thousandSeparator
              name='fixedAmount'
              control={control}
              idPrefix={idPrefix}
              allowEmpty
              label='Phí cố định (VNĐ)'
              placeholder='Trống = 0'
              className='col-span-1 flex flex-col'
            />
            <FormInputNumber
              thousandSeparator
              name='minFee'
              control={control}
              idPrefix={idPrefix}
              allowEmpty
              label='Phí tối thiểu (VNĐ)'
              placeholder='Không đặt sàn'
              className='col-span-1 flex flex-col'
            />
            <FormInputNumber
              thousandSeparator
              name='maxFee'
              control={control}
              idPrefix={idPrefix}
              allowEmpty
              label='Phí tối đa (VNĐ)'
              placeholder='Không đặt trần'
              className='col-span-1 flex flex-col'
            />
          </>
        )}
      </div>
    )}
  </CardComponent>
)
