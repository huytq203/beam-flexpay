import { ButtonComponent } from '@components/index'
import { SendOutlined } from '@components/icons'
import { memo } from 'react'
import { FormSendEmail } from './FormSendEmail'
import { UserInfor } from '@type/userManagement'

interface Props {
  user?: UserInfor | null
  actionType: 'delete' | 'lock' | 'unlock' | 'resetPass'
  onSuccess: () => void
  onCancel: () => void
}

const DialogDeleteUser = ({ user, actionType, onSuccess, onCancel }: Props) => {
  const contentMap: Record<string, JSX.Element> = {
    delete: (
      <span>
        Bạn có chắc chắn muốn <span className='font-bold'>xóa tài khoản</span>{' '}
        admin <span className='font-bold'>{user?.username}</span> không?
        Hành động này không thể hoàn tác.
      </span>
    ),
    lock: (
      <span>
        Bạn có chắc chắn muốn <span className='font-bold'>khóa tài khoản</span>{' '}
        admin <span className='font-bold'>{user?.username}</span> không?
        Tài khoản sẽ không thể đăng nhập cho đến khi mở lại.
      </span>
    ),
    unlock: (
      <span>
        Bạn có chắc chắn muốn{' '}
        <span className='font-bold'>mở khóa tài khoản</span> admin{' '}
        <span className='font-bold'>{user?.username}</span> không? Tài
        khoản này sẽ có thể hoạt động trở lại.
      </span>
    ),
    resetPass: <FormSendEmail selectedUser={user ?? undefined} />
  }

  const footerMap: Record<string, JSX.Element> = {
    delete: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
        <ButtonComponent type='primary' danger content='Xóa' onClick={onSuccess} />
      </div>
    ),
    lock: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
        <ButtonComponent type='primary' danger content='Khóa' onClick={onSuccess} />
      </div>
    ),
    unlock: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
        <ButtonComponent type='primary' content='Mở khóa' onClick={onSuccess} />
      </div>
    ),
    resetPass: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Hủy' onClick={onCancel} />
        <ButtonComponent
          type='primary'
          className='bg-teal-700 hover:!bg-teal-600'
          content={
            <span>
              <SendOutlined /> Gửi email
            </span>
          }
          onClick={onSuccess}
        />
      </div>
    )
  }

  return (
    <div>
      <div className='mb-4'>{contentMap[actionType]}</div>
      {footerMap[actionType]}
    </div>
  )
}

export default memo(DialogDeleteUser)
