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
  isFree: boolean
  tierError?: string
  onComponentTypeChange: (next: string | number) => void
  onMethodChange: (next: string | number) => void
  onPayerChange: (next: string | number) => void
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
  isFree,
  tierError,
  onComponentTypeChange,
  onMethodChange,
  onPayerChange
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

    <CardComponent
      size='small'
      className='border-border! bg-background!'
      title={payerType === 'SYSTEM' ? 'Mức chi phí dự kiến' : 'Mức phí'}
    >
      {isFree ? (
        <p className='text-[13px] text-muted-foreground'>
          Không thu phí cho thành phần này.
        </p>
      ) : tiered ? (
        <FeeTierEditor
          control={control}
          error={tierError}
        />
      ) : (
        <div className='grid grid-cols-1 gap-3 md:grid-cols-12'>
          <FormInputNumber
            name='percentage'
            control={control}
            allowEmpty
            label={payerType === 'SYSTEM' ? 'Chi phí %' : 'Phí %'}
            placeholder='Để trống nếu không thu theo phần trăm'
            className='col-span-12 flex flex-col md:col-span-6'
          />
          {!isVat && (
            <FormInputNumber
              name='fixedAmount'
              control={control}
              allowEmpty
              label={
                payerType === 'SYSTEM'
                  ? 'Chi phí cố định (VNĐ)'
                  : 'Phí cố định (VNĐ)'
              }
              placeholder='Để trống nếu không thu phí cố định'
              className='col-span-12 flex flex-col md:col-span-6'
            />
          )}
        </div>
      )}
    </CardComponent>

    {/* VAT không có sàn/trần phí. */}
    {!isFree && !isVat && (
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
            label='Phí tối thiểu (VNĐ)'
            placeholder='Để trống nếu không đặt sàn'
            className='col-span-12 flex flex-col md:col-span-6'
          />
          <FormInputNumber
            name='maxFee'
            control={control}
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
