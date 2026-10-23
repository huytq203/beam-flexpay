import { FormSelect } from '@components/form'
import { CardComponent } from '@components/index'
import type { Control } from 'react-hook-form'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import type { BaseTypeSummary } from '../utils/feeComponentSummary'
import { BaseTypePreview } from './BaseTypePreview'
import { FeeRateFields, FeeSideFields } from './FeeRateFields'

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
  beneficiaryTypeOptions: readonly Option[]
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
    titles: { sender: string; receiver: string }
  }
}

export const FeeComponentFields = ({
  control,
  componentTypeOptions,
  baseOnOptions,
  baseTypeOptions,
  methodOptions,
  payerTypeOptions,
  beneficiaryTypeOptions,
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
          title={receiver.titles.sender}
          control={control}
          isVat={isVat}
          tiered={tiered}
          tierError={tierError}
        />
        <FeeSideFields
          title={receiver.titles.receiver}
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
