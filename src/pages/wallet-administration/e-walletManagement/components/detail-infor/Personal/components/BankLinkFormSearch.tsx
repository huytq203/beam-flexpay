import { FormInput, FormSelect } from '@components/form'
import { BroomIcon, FunnelIcon, MagnifyingGlassIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { useForm } from 'react-hook-form'
import {
  BANK_LINK_STATUS_OPTIONS,
  BANK_OPTIONS,
  LINK_TYPE_OPTIONS
} from '../constants/AccountBank.constant'
import {
  buildBankLinkSearchFilters,
  type BankLinkSearchFilters
} from '../utils/bank-link-search'

interface BankLinkFormSearchProps {
  onSearch: (filters: BankLinkSearchFilters) => void
}

const BankLinkFormSearch = ({ onSearch }: BankLinkFormSearchProps) => {
  const form = useForm<BankLinkSearchFilters>({
    defaultValues: {
      bankCode: '',
      walletId: '',
      linkType: '',
      status: '',
      accountName: '',
      accountNumber: '',
      linkedAtFrom: '',
      linkedAtTo: '',
      unlinkedAtFrom: '',
      unlinkedAtTo: ''
    }
  })

  const handleReset = () => {
    form.reset()
    onSearch({})
  }

  return (
    <form
      className='space-y-3'
      onSubmit={form.handleSubmit((values) => {
        onSearch(buildBankLinkSearchFilters(values))
      })}
    >
      <p className='mb-3 flex items-center gap-2 border-b border-gray-200 pb-2 font-bold text-blue'>
        <FunnelIcon /> Bộ lọc tìm kiếm
      </p>

      <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
        <FormSelect
          control={form.control}
          name='bankCode'
          className='col-span-1 flex flex-col'
          label='Ngân hàng'
          placeholder='Chọn ngân hàng'
          options={BANK_OPTIONS}
        />
        <FormInput
          control={form.control}
          name='walletId'
          className='col-span-1'
          label='Tài khoản ví'
          placeholder='Nhập Wallet ID...'
          maxLength={255}
        />
        <FormSelect
          control={form.control}
          name='linkType'
          className='col-span-1 flex flex-col'
          label='Loại liên kết'
          placeholder='Chọn loại liên kết'
          options={LINK_TYPE_OPTIONS}
        />
        <FormSelect
          control={form.control}
          name='status'
          className='col-span-1 flex flex-col'
          label='Trạng thái'
          placeholder='Chọn trạng thái'
          options={BANK_LINK_STATUS_OPTIONS}
        />
        <FormInput
          control={form.control}
          name='accountName'
          className='col-span-1'
          label='Tên chủ tài khoản'
          placeholder='Nhập tên chủ tài khoản...'
          maxLength={255}
        />
        <div className='min-w-0'>
          <FormInput
            control={form.control}
            name='accountNumber'
            className='flex flex-col'
            label='Số tài khoản đầy đủ'
            placeholder='Nhập số tài khoản để đối chiếu...'
            autoComplete='off'
            maxLength={32}
          />
         
        </div>
       
      </div>

      <div className='flex flex-wrap justify-end gap-2'>
        <ButtonComponent
          htmlType='button'
          type='default'
          icon={<BroomIcon size={18} />}
          content='Xóa bộ lọc'
          onClick={handleReset}
        />
        <ButtonComponent
          htmlType='submit'
          icon={<MagnifyingGlassIcon size={18} />}
          content='Tìm kiếm'
        />
      </div>
    </form>
  )
}

export default BankLinkFormSearch
