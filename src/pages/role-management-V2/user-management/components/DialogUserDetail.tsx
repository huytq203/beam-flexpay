import { CardComponent } from '@components/index'
import { RoleUserAccount } from '@pages/role-management-V2/user-management/constants/userAccount'
import { UserInfor } from '@type/userManagement'
import { useState, useEffect, memo } from 'react'
import { useLazyGetUserByIdQuery } from '@services/apiUserManagement'
import dayjs from 'dayjs'

interface Props {
  userId?: string
  onCancel: () => void
}

const DialogUserDetail = ({ userId }: Props) => {
  const [selectedUser, setSelectedUser] = useState<UserInfor | null>(null)
  const [loading, setLoading] = useState(false)
  const [getUserById] = useLazyGetUserByIdQuery()

  useEffect(() => {
    if (!userId) return
    const fetchUser = async () => {
      setLoading(true)
      try {
        const result = await getUserById(userId)
        const data = result?.data?.data
        if (data) {
          setSelectedUser({
            id: data.id,
            username: data.username,
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phoneNumber: data.phoneNumber,
            enabled: data.enabled,
            emailVerified: data.emailVerified,
            createdTimestamp: data.createdTimestamp ?? null,
            groups: Array.isArray(data.groups)
              ? data.groups
              : data.groups ? [data.groups] : null
          })
        }
      } catch {
        setSelectedUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [userId, getUserById])

  const listGroup =
    !selectedUser?.groups || selectedUser.groups.length === 0 ? (
      <p className='col-span-2'>
        <span className='bg-gray-400 text-white p-1 rounded-md'>
          Chưa được phân quyền
        </span>
      </p>
    ) : (
      selectedUser.groups.map((role) => {
        const label = RoleUserAccount[role as keyof typeof RoleUserAccount]
        return (
          <p key={role}>
            <span className='bg-blue-500 text-white p-1 rounded-md'>
              {label ?? role}
            </span>
          </p>
        )
      })
    )

  if (loading) return <div className='text-center p-4'>Loading...</div>

  return (
    <div>
      <CardComponent
        content={
          <>
            <div className='grid grid-cols-4'>
              <div className='col-span-1'>
                <img
                  className='w-32 h-32 rounded-full'
                  src='/images/user.jpg'
                  alt='User avatar'
                />
              </div>
              <div className='col-span-3 grid grid-cols-2 gap-1'>
                <div className='col-span-1'>
                  <h1 className='font-bold'>Tên đăng nhập</h1>
                  <p className='font-medium'>{selectedUser?.username}</p>
                </div>
                <div className='col-span-1'>
                  <h1 className='font-bold'>Họ và tên</h1>
                  <p className='font-medium'>
                    {`${selectedUser?.firstName ?? '--'} ${selectedUser?.lastName ?? '--'}`}
                  </p>
                </div>
                <div className='col-span-1'>
                  <h1 className='font-bold'>EMAIL</h1>
                  <p className='font-medium'>{selectedUser?.email ?? '--'}</p>
                </div>
                <div className='col-span-1'>
                  <h1 className='font-bold'>Số điện thoại</h1>
                  <p className='font-medium'>{selectedUser?.phoneNumber || '--'}</p>
                </div>
              </div>
            </div>
            <hr className='mt-3' />
            <div className='flex flex-col gap-2 mt-3'>
              <h1 className='font-bold'>Thông tin hệ thống</h1>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Nhóm quyền:</p>
                <div className='flex flex-wrap justify-start items-center gap-2 col-span-2'>
                  {listGroup}
                </div>
              </div>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Trạng thái:</p>
                <p className='col-span-2'>
                  <span className={`bg-${selectedUser?.enabled ? 'green' : 'red'}-500 p-1 text-white rounded-md`}>
                    {selectedUser?.enabled ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </p>  
              </div>
            </div>
            <hr className='mt-3' />
            <div className='flex flex-col mt-3 gap-2'>
              <h1 className='font-bold'>Thông tin nhật ký (Audit Log)</h1>
              <div className='grid grid-cols-3'>
                <p className='font-medium col-span-1'>Ngày tạo:</p>
                <p className='col-span-2'>
                  <span className='bg-gray-100 p-1 rounded-md'>
                    {selectedUser?.createdTimestamp
                      ? dayjs(selectedUser.createdTimestamp).format('DD/MM/YYYY HH:mm:ss')
                      : '--'}
                  </span>
                </p>
              </div>
            </div>
          </>
        }
      />
    </div>
  )
}

export default memo(DialogUserDetail)
