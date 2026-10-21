import { ButtonComponent } from '@components/index'
import {
  FormDatePicker,
  FormInput,
  FormInputNumber,
  FormSelect
} from '@components/form'
import { BroomIcon, MagnifyingGlassIcon } from '@components/icons'
import * as Icons from '@components/icons'
import { mapEnumToSelectOptions } from '@utils/helperFunctions'
import { useEffect } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import { FormSearchValues } from '@type/systemLedger'
import {
  DirectionLabel,
  LedgerTransactionType,
  OwnerTypeLabels
} from '../constants/SystemLedger.constant'

interface Props {
  /** Bộ lọc đang áp (đọc từ URL/bản sao) để ô nhập hiện lại khi quay về màn. */
  defaultValues?: FormSearchValues
  handleSearch: (value: FormSearchValues) => void
  onReset: () => void
  direction?: string
}

const DEFAULT_VALUES: FormSearchValues = {
  keyword: '',
  transactionCode: '',
  journalCode: '',
  ownerUsername: '',
  ownerType: '',
  glCode: '',
  direction: '',
  transactionType: '',
  minAmount: undefined,
  maxAmount: undefined,
  fromDate: '',
  toDate: ''
}

const FormSearch = ({
  defaultValues,
  handleSearch,
  onReset,
  direction
}: Props) => {
  const formSearch = useForm<FormSearchValues>({
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues }
  })
  const { setValue } = formSearch

  useEffect(() => {
    setValue('direction', direction ?? '')
  }, [direction, setValue])

  const onSubmit: SubmitHandler<FormSearchValues> = (data) => {
    handleSearch(data)
  }

  const handleReset = () => {
    formSearch.reset(DEFAULT_VALUES)
    onReset()
  }

  return (
    <div>
      <p className='mb-3 flex items-center gap-2 border-b border-border pb-2 font-semibold'>
        <Icons.FunnelIcon /> Bộ lọc tìm kiếm
      </p>
      <form onSubmit={formSearch.handleSubmit(onSubmit)}>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-3'>
          <FormInput
            control={formSearch.control}
            name='keyword'
            label={
                'Từ khóa'
            }
            placeholder='Mã giao dịch hoặc chủ tài khoản...'
            className='col-span-1'
          />
          <FormInput
            control={formSearch.control}
            name='transactionCode'
            label={
              
                'Mã giao dịch'
            }
            placeholder='Nhập mã giao dịch hoặc UUID'
            className='col-span-1'
          />
          <FormInput
            control={formSearch.control}
            name='journalCode'
            label={
                'Mã bút toán'
            }
            placeholder='VD: JRN-26A2D1D5-D4C'
            className='col-span-1'
          />
          <FormInput
            control={formSearch.control}
            name='ownerUsername'
            label='Chủ tài khoản'
            placeholder='Số điện thoại hoặc username...'
            className='col-span-1'
          />
          <FormSelect
            control={formSearch.control}
            name='ownerType'
            label='Loại chủ tài khoản'
            options={mapEnumToSelectOptions(OwnerTypeLabels)}
            placeholder='Tất cả'
            className='col-span-1'
          />
          <FormSelect
            control={formSearch.control}
            name='direction'
            label='Loại hạch toán'
            options={mapEnumToSelectOptions(DirectionLabel)}
            placeholder='Tất cả'
            className='col-span-1'
          />
          <FormInput
            control={formSearch.control}
            name='glCode'
            label='Mã tài khoản kế toán (GL)'
            placeholder='VD: USER_WALLET_VND'
            className='col-span-1'
          />
          <FormSelect
            control={formSearch.control}
            name='transactionType'
            label='Loại giao dịch'
            options={mapEnumToSelectOptions(LedgerTransactionType)}
            placeholder='Tất cả'
            className='col-span-1'
          />
          <FormInputNumber
            control={formSearch.control}
            name='minAmount'
            label='Số tiền từ'
            placeholder='Không giới hạn'
            min={0}
            allowEmpty
            className='col-span-1 flex flex-col'
          />
          <FormInputNumber
            control={formSearch.control}
            name='maxAmount'
            label='Số tiền đến'
            placeholder='Không giới hạn'
            min={0}
            allowEmpty
            className='col-span-1 flex flex-col'
          />
          <FormDatePicker
            showTime
            control={formSearch.control}
            name='fromDate'
            label='Ghi sổ từ'
            className='col-span-1'
          />
          <FormDatePicker
            showTime
            control={formSearch.control}
            name='toDate'
            label='Ghi sổ đến'
            className='col-span-1'
          />
        </div>
        <div className='flex justify-end mt-3 gap-1'>
          <ButtonComponent
            htmlType='submit'
            icon={<MagnifyingGlassIcon size={18} />}
            content={'Tìm kiếm'}
          />
          <ButtonComponent
            onClick={handleReset}
            type='default'
            icon={<BroomIcon size={18} />}
            content={'Xóa lọc'}
          />
        </div>
      </form>
    </div>
  )
}

export default FormSearch
