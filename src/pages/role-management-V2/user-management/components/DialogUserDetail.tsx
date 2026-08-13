import { memo } from 'react'
import { ButtonComponent } from '@components/index'
import { SkeletonInput } from '@components/ui/skeletons/Skeleton'
import { useGetUserByIdQuery } from '@services/apiUserManagement'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'
import { formatUserTimestamp } from '../utils/UserManagement.utils'
import { RoleName } from '../../role-management/constants/RoleManagement.constant'

interface Props {
  userId?: string
}

const getLoadErrorMessage = (error: unknown): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    error.status === 'FETCH_ERROR'
  ) {
    return 'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi tải lại.'
  }

  return (
    getApiErrorDetail(error) ??
    'Không thể tải thông tin tài khoản. Vui lòng thử lại.'
  )
}

const DialogUserDetail = ({ userId }: Props) => {
  const {
    data: response,
    error,
    isLoading,
    isFetching,
    refetch
  } = useGetUserByIdQuery(userId ?? '', { skip: !userId })
  const user = response?.data

  if (isLoading || isFetching) {
    return (
      <div
        className='grid grid-cols-1 gap-3 p-3 sm:grid-cols-2'
        aria-busy='true'
        aria-label='Đang tải chi tiết tài khoản'
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonInput key={index} />
        ))}
      </div>
    )
  }

  if (!userId || error || !user) {
    return (
      <div className='flex flex-col gap-4 p-3'>
        <p
          className='m-0 rounded-lg bg-red-50 px-4 py-3 text-sm leading-5 text-red-800'
          role='alert'
        >
          {getLoadErrorMessage(error)}
        </p>
        {userId && (
          <div className='flex justify-end'>
            <ButtonComponent
              type='primary'
              content='Tải lại'
              onClick={() => void refetch()}
            />
          </div>
        )}
      </div>
    )
  }

  const fullName = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim()
  const groups = user.groups ?? []

  return (
    <div className='flex flex-col gap-5 p-1 sm:p-2'>
      <section className='grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-[6rem_minmax(0,1fr)]'>
        <img
          className='size-24 rounded-full object-cover'
          src='/images/user.jpg'
          alt='Ảnh đại diện tài khoản'
        />
        <dl className='grid min-w-0 grid-cols-1 gap-x-5 gap-y-3 sm:grid-cols-2'>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Tên đăng nhập</dt>
            <dd className='mt-1 break-all text-sm font-semibold text-slate-900'>
              {user.username || '--'}
            </dd>
          </div>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Họ và tên</dt>
            <dd className='mt-1 break-words text-sm font-semibold text-slate-900'>
              {fullName || '--'}
            </dd>
          </div>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Email</dt>
            <dd className='mt-1 break-all text-sm font-semibold text-slate-900'>
              {user.email || '--'}
            </dd>
          </div>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Số điện thoại</dt>
            <dd className='mt-1 break-all text-sm font-semibold text-slate-900'>
              {user.phoneNumber || '--'}
            </dd>
          </div>
        </dl>
      </section>

      <section className='border-t border-slate-200 pt-4' aria-labelledby='account-system-information'>
        <h3 id='account-system-information' className='mb-3 text-sm font-semibold text-slate-900'>
          Thông tin hệ thống
        </h3>
        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <dt className='text-xs font-medium text-slate-500'>Trạng thái</dt>
            <dd className='mt-1'>
              <span className={user.enabled ? 'success-status inline-flex rounded-md px-2 py-0.5 text-xs' : 'danger-status inline-flex rounded-md px-2 py-0.5 text-xs'}>
                {user.enabled ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </dd>
          </div>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Nhóm quyền</dt>
            <dd className='mt-1 flex flex-wrap gap-1.5'>
              {groups.length === 0 ? (
                <span className='text-sm text-slate-600'>Chưa được phân quyền</span>
              ) : (
                groups.map((role) => (
                  <span key={role} className='rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-800'>
                    {RoleName[role as keyof typeof RoleName] ?? role}
                  </span>
                ))
              )}
            </dd>
          </div>
        </dl>
      </section>

      <section className='border-t border-slate-200 pt-4' aria-labelledby='account-audit-information'>
        <h3 id='account-audit-information' className='mb-3 text-sm font-semibold text-slate-900'>
          Dấu vết thao tác
        </h3>
        <dl className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          <div>
            <dt className='text-xs font-medium text-slate-500'>Ngày tạo</dt>
            <dd className='mt-1 text-sm font-medium text-slate-900'>
              {formatUserTimestamp(user.createdAt ?? user.createdTimestamp)}
            </dd>
          </div>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Người tạo</dt>
            <dd className='mt-1 break-all text-sm font-medium text-slate-900'>
              {user.createdBy || '--'}
            </dd>
          </div>
          <div>
            <dt className='text-xs font-medium text-slate-500'>Cập nhật gần nhất</dt>
            <dd className='mt-1 text-sm font-medium text-slate-900'>
              {formatUserTimestamp(user.updatedAt)}
            </dd>
          </div>
          <div className='min-w-0'>
            <dt className='text-xs font-medium text-slate-500'>Người cập nhật</dt>
            <dd className='mt-1 break-all text-sm font-medium text-slate-900'>
              {user.updatedBy || '--'}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  )
}

export default memo(DialogUserDetail)
