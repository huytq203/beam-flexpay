import { FormInputNumber } from '@components/form'
import { CardComponent } from '@components/index'
import type { Control } from 'react-hook-form'
import type { FeeComponentFormValues } from '../schemas/feeConfig.schema'
import { FeeTierEditor } from './FeeTierEditor'

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
export const FeeRateFields = ({
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
            label={isVat ? 'VAT (%)' : 'Phí linh hoạt (%)'}
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
              label={'Phí cố định (VNĐ)'}
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
export const FeeSideFields = ({
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
          label={isVat ? 'VAT (%)' : 'Phí linh hoạt (%)'}
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
