import { CardComponent } from '@components/common'
import { FormInput, FormSelect } from '@components/form'
import { mapEnumToSelectOptions } from '@pages/role-management-V2/RoleManagement.utils'
import { useSystemFeeManagementUpdatePolicyMutation } from '@services/apiDirectDeposit'
import { RoleUserAccount, Status } from '@type/userAccount'
import { UserInfor } from '@type/userManagement'
import React, { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { ActionMode } from '../UserManagement'

interface Props {
  modeAction: ActionMode
  selectedUser?: UserInfor | null
}

const FormAdd = ({ modeAction, selectedUser }: Props) => {
  const { control, reset } = useForm()

  // Fill data vào form khi update
  useEffect(() => {
    if (modeAction === 'update' && selectedUser) {
      reset({
        username: selectedUser.username,
        email: selectedUser.email,
        lastName: selectedUser.lastName,
        firstName: selectedUser.firstName,
        enabled: selectedUser.enabled ? Status.ACTIVE : Status.INACTIVE,
        groups: selectedUser.groups || [],
      })
    } else if (modeAction === 'add') {
      // Reset form khi thêm mới
      reset({
        username: '',
        email: '',
        lastName: '',
        firstName: '',
        enabled: Status.ACTIVE,
        groups: [],
      })
    }
  }, [modeAction, selectedUser, reset])

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
                disabled={modeAction == "update"}
              // disabled
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
                name=''
              />
              {modeAction == "update" &&
                <FormSelect
                  label={<span>Trạng thái <span className='text-red-600'>(*)</span></span>}
                  options={mapEnumToSelectOptions(Status)}
                  control={control}
                  name='enabled'

                />
              }
              <FormSelect
                label={<span>Nhóm quyền <span className='text-red-600'>(*)</span></span>}
                options={mapEnumToSelectOptions(RoleUserAccount)}
                control={control}
                name='groups'
                mode='multiple'
              />
            </form>
            {modeAction !== 'update' ? <p>
              Link tạo mật khẩu sẽ được gửi tự dộng về email cho người dùng sau
              khi tài khoản được tạo thành công
            </p> : ''}

          </>
        }
      />
    </div>
  )
}

export default FormAdd
