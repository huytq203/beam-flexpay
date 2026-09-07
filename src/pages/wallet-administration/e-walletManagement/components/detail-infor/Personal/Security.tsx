import { useState } from 'react'
import { PERMISSION, useAccess } from '@/app/permissions'
import { CardComponent } from '@components/index'
import { ClockIcon } from '@components/icons'
import { Skeleton } from '@components/ui/skeletons/Skeleton'
import { useGetCustomerDevicesQuery } from '@services/apiUserDevices'
import { AuthMethod } from './components/AuthMethod'
import { HistoryLogin } from './components/HistoryLogin'
import { LogoutAllDevicesDialog } from './components/LogoutAllDevicesDialog'

interface SecurityProps {
  userId: string
}

const SecurityLoading = () => (
  <div
    className='grid grid-cols-1 gap-3 xl:grid-cols-2'
    aria-label='Đang tải thông tin bảo mật'
  >
    {[0, 1].map((item) => (
      <CardComponent
        key={item}
        className='min-w-0'
        content={
          <div className='space-y-4'>
            <Skeleton className='h-6 w-44' />
            <Skeleton className='h-px w-full' />
            <Skeleton className='h-16 w-full' />
            <Skeleton className='h-16 w-full' />
          </div>
        }
      />
    ))}
  </div>
)

const SecurityDevelopmentState = () => (
  <CardComponent
    content={
      <div className='flex items-start gap-3 py-4' role='status'>
        <ClockIcon
          className='mt-0.5 shrink-0 text-cyan-700'
          size={22}
          weight='regular'
          aria-hidden
        />
        <div>
          <p className='font-semibold text-slate-900'>
            Tính năng đang phát triển
          </p>
          <p className='mt-1 text-sm text-slate-600'>
            Thông tin bảo mật và lịch sử đăng nhập hiện chưa khả dụng. Vui lòng
            quay lại sau.
          </p>
        </div>
      </div>
    }
  />
)

export const Security = ({ userId }: SecurityProps) => {
  const { has, hasAny } = useAccess()
  const canViewDevices = hasAny([
    PERMISSION.USER_VIEW,
    PERMISSION.USER_FULL
  ])
  const canLogoutAll = has(PERMISSION.USER_FULL)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)
  const { currentData, isLoading, isError } =
    useGetCustomerDevicesQuery(userId, {
      skip: !userId || !canViewDevices
    })

  if (!canViewDevices) return null
  if (isLoading) return <SecurityLoading />
  if (isError || !currentData) {
    return <SecurityDevelopmentState />
  }

  return (
    <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
      <CardComponent
        className='min-w-0'
        content={<AuthMethod devices={currentData.devices} />}
      />
      <CardComponent
        className='min-w-0'
        content={
          <HistoryLogin
            devices={currentData.devices}
            canLogoutAll={canLogoutAll}
            onLogoutAll={() => setIsLogoutDialogOpen(true)}
          />
        }
      />

      <LogoutAllDevicesDialog
        userId={userId}
        devices={currentData.devices}
        open={isLogoutDialogOpen}
        onClose={() => setIsLogoutDialogOpen(false)}
      />
    </div>
  )
}
