import { memo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { FormInput, FormSelect } from '@components/form'
import { useMessage } from '@hooks/useMessage'
import { useCreateManagerUserMutation } from '@services/apiUserManagement'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'
import {
  CREATE_ADMIN_USER_FORM_ID,
  CREATE_USER_STATUS_OPTIONS
} from '../constants/userAccount'
import {
  CreateAdminUserSchema,
  CreateAdminUserFormData
} from '../schemas/CreateAdminUser.schema'
import {
  CreateAdminUserRequest,
  UserRoleOption
} from '../types/UserManagement.type'

interface Props {
  roleOptions?: UserRoleOption[]
  onSuccess: () => void
  onLoadingChange?: (loading: boolean) => void
}

const DEFAULT_VALUES: CreateAdminUserFormData = {
  username: '',
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  enabled: 'true',
  roleIds: []
}

const FIELD_CLASS = 'flex min-w-0 flex-col gap-1.5'

const getCreateErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 'FETCH_ERROR'
  ) {
    return 'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
  }

  return getApiErrorDetail(error) ?? 'Không thể tạo tài khoản. Vui lòng thử lại.'
}

const DialogAddUser = ({
  roleOptions = [],
  onSuccess,
  onLoadingChange
}: Props) => {
  const { successMess, errorMess } = useMessage()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [createManagerUser, { isLoading }] = useCreateManagerUserMutation()
  const { control, handleSubmit, setError } = useForm<CreateAdminUserFormData>({
    resolver: zodResolver(CreateAdminUserSchema),
    mode: 'onSubmit',
    defaultValues: DEFAULT_VALUES
  })

  const onSubmit = async (data: CreateAdminUserFormData): Promise<void> => {
    if (isLoading) return

    setSubmitError(null)
    onLoadingChange?.(true)

    const payload: CreateAdminUserRequest = {
      username: data.username.trim().toLowerCase(),
      email: data.email.trim().toLowerCase(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      enabled: data.enabled === 'true',
      roleIds: data.roleIds
    }

    try {
      await createManagerUser(payload).unwrap()
      successMess('Tạo tài khoản thành công')
      onSuccess()
    } catch (error) {
      const message = getCreateErrorMessage(error)

      if (/tên đăng nhập/i.test(message)) {
        setError('username', { type: 'server', message })
        return
      }
      if (/email/i.test(message)) {
        setError('email', { type: 'server', message })
        return
      }

      setSubmitError(message)
      errorMess(message)
    } finally {
      onLoadingChange?.(false)
    }
  }

  return (
    <form
      id={CREATE_ADMIN_USER_FORM_ID}
      className='flex flex-col gap-4 rounded-lg bg-white p-3'
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
        <FormInput
          control={control}
          name='username'
          label='Tên đăng nhập'
          placeholder='Ví dụ: nguyenvana'
          maxLength={50}
          autoComplete='off'
          required
          className={FIELD_CLASS}
        />
        <FormInput
          control={control}
          name='email'
          label='Email'
          placeholder='Ví dụ: vana@beamewa.com.vn'
          type='email'
          maxLength={100}
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

      <div
        className='rounded-lg bg-blue-50 px-3 py-2.5 text-sm leading-5 text-blue-900'
        role='note'
      >
        Tài khoản hoạt động sẽ nhận email chứa liên kết đặt mật khẩu có hiệu lực
        24 giờ. Nếu email chưa đến, người dùng có thể dùng chức năng Quên mật khẩu.
      </div>

      {submitError && (
        <p
          className='text-sm text-red-600'
          role='alert'
        >
          {submitError}
        </p>
      )}
    </form>
  )
}

export default memo(DialogAddUser)
