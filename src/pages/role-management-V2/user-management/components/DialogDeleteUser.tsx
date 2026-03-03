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
        Ban co chac chan muon <span className='font-bold'>xoa tai khoan</span>{' '}
        admin <span className='font-bold'>{user?.username}</span> khong?
        Hanh dong nay khong the hoan tac.
      </span>
    ),
    lock: (
      <span>
        Ban co chac chan muon <span className='font-bold'>khoa tai khoan</span>{' '}
        admin <span className='font-bold'>{user?.username}</span> khong?
        Tai khoan se khong the dang nhap cho den khi mo lai.
      </span>
    ),
    unlock: (
      <span>
        Ban co chac chan muon{' '}
        <span className='font-bold'>mo khoa tai khoan</span> admin{' '}
        <span className='font-bold'>{user?.username}</span> khong? Tai
        khoan nay se co the hoat dong tro lai.
      </span>
    ),
    resetPass: <FormSendEmail selectedUser={user ?? undefined} />
  }

  const footerMap: Record<string, JSX.Element> = {
    delete: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
        <ButtonComponent type='primary' danger content='Delete' onClick={onSuccess} />
      </div>
    ),
    lock: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
        <ButtonComponent type='primary' danger content='Khoa' onClick={onSuccess} />
      </div>
    ),
    unlock: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
        <ButtonComponent type='primary' content='Mo khoa' onClick={onSuccess} />
      </div>
    ),
    resetPass: (
      <div className='flex justify-end items-center gap-2'>
        <ButtonComponent type='default' content='Cancel' onClick={onCancel} />
        <ButtonComponent
          type='primary'
          className='bg-teal-700 hover:!bg-teal-600'
          content={
            <span>
              <SendOutlined /> Send email
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
