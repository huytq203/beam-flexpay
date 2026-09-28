import type { Control } from 'react-hook-form'
import { FormInput, FormSelect } from '@components/form'
import { CREATE_USER_STATUS_OPTIONS } from '../constants/userAccount'
import type { UpdateAdminUserFormData } from '../schemas/UpdateAdminUser.schema'
import type { UserRoleOption } from '../types/UserManagement.type'

interface Props {
  control: Control<UpdateAdminUserFormData>
  username: string
  roleOptions: UserRoleOption[]
}

const FIELD_CLASS = 'flex min-w-0 flex-col gap-1.5'

export function EditUserFormFields({ control, username, roleOptions }: Props) {
  return (
    <>
      <section
        className='rounded-lg bg-slate-50 px-3 py-3'
        aria-labelledby='immutable-account-information'
      >
        <h3
          id='immutable-account-information'
          className='mb-2 text-sm font-semibold text-slate-800'
        >
          Thông tin định danh
        </h3>
        <dl className='grid min-w-0 grid-cols-1 gap-3'>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>
              Tên đăng nhập
            </dt>
            <dd className='mt-0.5 break-all text-sm font-medium text-slate-900'>
              {username}
            </dd>
          </div>
        </dl>
        <p className='mt-2 text-xs leading-5 text-slate-600'>
          Tên đăng nhập không thể thay đổi tại màn hình này.
        </p>
      </section>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='email'
          label='Email'
          placeholder='Ví dụ: ten@beam.vn'
          maxLength={100}
          type='email'
          autoComplete='email'
          required
          className={FIELD_CLASS}
        />
        <FormInput
          control={control}
          name='firstName'
          label='Họ'
          placeholder='Ví dụ: Nguyễn'
          maxLength={50}
          autoComplete='family-name'
          required
          className={FIELD_CLASS}
        />
        <FormInput
          control={control}
          name='lastName'
          label='Tên đệm và tên'
          placeholder='Ví dụ: Văn A'
          maxLength={50}
          autoComplete='given-name'
          required
          className={FIELD_CLASS}
        />
        <FormInput
          control={control}
          name='phoneNumber'
          label='Số điện thoại'
          placeholder='Ví dụ: 0912345678'
          maxLength={10}
          inputMode='numeric'
          autoComplete='tel'
          required
          className={FIELD_CLASS}
        />
        <FormSelect
          control={control}
          name='enabled'
          label='Trạng thái hoạt động'
          options={[...CREATE_USER_STATUS_OPTIONS]}
          allowClear={false}
          required
          className={FIELD_CLASS}
        />
      </div>

      <FormSelect
        control={control}
        name='roleIds'
        label='Nhóm quyền'
        options={roleOptions}
        mode='multiple'
        showSearch
        optionFilterProp='label'
        placeholder='Chọn một hoặc nhiều nhóm quyền'
        className={FIELD_CLASS}
      />

      <p className='text-xs leading-5 text-slate-600'>
        Bỏ chọn toàn bộ nếu muốn gỡ tất cả nhóm quyền khỏi tài khoản.
      </p>
    </>
  )
}
