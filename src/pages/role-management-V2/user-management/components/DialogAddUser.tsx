import { CardComponent } from '@components/index'
import { FormInput, FormSelect } from '@components/form'
import { mapEnumToSelectOptions } from '@pages/role-management-V2/utils/RoleManagement.utils'
import { Status, RoleUserAccount } from '@pages/role-management-V2/user-management/constants/userAccount'
import { UserInfor } from '@type/userManagement'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useLazyGetUserByIdQuery } from '@services/apiUserManagement'

interface Props {
  userId?: string | null
  roleOptions?: { value: string; label: string }[]
  onSuccess: () => void
  onCancel: () => void
}

const DialogAddUser = ({ userId, roleOptions = [], onSuccess, onCancel }: Props) => {
  const isEdit = !!userId
  const { control, reset } = useForm()
  const [getUserById] = useLazyGetUserByIdQuery()

  useEffect(() => {
    if (userId) {
      const fetchUser = async () => {
        try {
          const result = await getUserById(userId)
          const user = result?.data?.data
          if (user) {
            reset({
              username: user.username,
              email: user.email,
              lastName: user.lastName,
              firstName: user.firstName,
              enabled: user.enabled ? Status.ACTIVE : Status.INACTIVE,
              groups: user.groups || []
            })
          }
        } catch {}
      }
      fetchUser()
    } else {
      reset({
        username: '',
        email: '',
        lastName: '',
        firstName: '',
        enabled: Status.ACTIVE,
        groups: []
      })
    }
  }, [userId, reset, getUserById])

  return (
    <div>
      <CardComponent
        content={
          <>
            <form>
              <FormInput
                label={<span>Tên đăng nhập <span className='text-red-600'>(*)</span></span>}
                placeholder='Tên đăng nhập...'
                control={control}
                name='username'
                disabled={isEdit}
              />
              <FormInput
                label={<span>Email <span className='text-red-600'>(*)</span></span>}
                placeholder='Email...'
                control={control}
                name='email'
              />
              <FormInput
                label={<span>Họ và tên <span className='text-red-600'>(*)</span></span>}
                placeholder='Họ và tên...'
                control={control}
                name='lastName'
              />
              <FormInput
                label={<span>Số điện thoại<span className='text-red-600'>(*)</span></span>}
                placeholder='Số điện thoại...'
                control={control}
                name='phone'
              />
              {isEdit && (
                <FormSelect
                  label={<span>Trạng thái <span className='text-red-600'>(*)</span></span>}
                  options={mapEnumToSelectOptions(Status)}
                  control={control}
                  name='enabled'
                />
              )}
              <FormSelect
                label={<span>Nhóm quyền <span className='text-red-600'>(*)</span></span>}
                options={roleOptions}
                control={control}
                name='groups'
                mode='multiple'
              />
            </form>
            {!isEdit && (
              <p>
                Link tạo mật khẩu sẽ được gửi tự động về email cho người dùng sau
                khi tài khoản được tạo thành công
              </p>
            )}
          </>
        }
      />
    </div>
  )
}

export default DialogAddUser
