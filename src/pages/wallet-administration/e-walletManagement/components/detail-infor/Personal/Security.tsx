import { PERMISSION, useAccess } from '@/app/permissions'
import { WarningIcon } from '@components/icons'
import { ButtonComponent, CardComponent } from '@components/index'
import { Skeleton } from '@components/ui/skeletons/Skeleton'
import { useGetCustomerDevicesQuery } from '@services/apiUserDevices'
import { AuthMethod } from './components/AuthMethod'
import { HistoryLogin } from './components/HistoryLogin'

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

const SecurityErrorState = ({ onRetry }: { onRetry: () => void }) => (
  <CardComponent
    content={
      <div className='flex items-start gap-3 py-4' role='alert'>
        <WarningIcon
          className='mt-0.5 shrink-0 text-red-600'
          size={22}
          weight='fill'
          aria-hidden
        />
        <div>
          <p className='font-semibold text-slate-900'>
            Không tải được thông tin bảo mật
          </p>
          <p className='mt-1 text-sm text-slate-600'>
            Máy chủ chưa phản hồi được danh sách thiết bị tin cậy. Thử lại sau
            ít phút, nếu vẫn lỗi thì báo đội kỹ thuật.
          </p>
          <ButtonComponent
            type='default'
            className='mt-3'
            content='Thử lại'
            onClick={onRetry}
          />
        </div>
      </div>
    }
  />
)

export const Security = ({ userId }: SecurityProps) => {
  const { hasAny } = useAccess()
  const canViewDevices = hasAny([PERMISSION.USER_VIEW, PERMISSION.USER_FULL])
  const { currentData, isFetching, isError, refetch } =
    useGetCustomerDevicesQuery(userId, {
      skip: !userId || !canViewDevices
    })

  if (!canViewDevices) return null
  // `isFetching` chứ không phải `isLoading`: đổi sang ví khác vẫn phải là skeleton,
  // nếu không sẽ loé trạng thái lỗi trong lúc dữ liệu mới đang về.
  if (isFetching) return <SecurityLoading />
  // Endpoint đã lên môi trường dev, nên mọi thất bại giờ đều là sự cố thật —
  // báo đúng như vậy kèm đường thử lại, không còn nhánh "đang phát triển".
  if (isError || !currentData) return <SecurityErrorState onRetry={refetch} />

  return (
    <div className='grid grid-cols-1 gap-3 xl:grid-cols-2'>
      <CardComponent
        className='min-w-0'
        content={<AuthMethod devices={currentData.devices} />}
      />
      <CardComponent
        className='min-w-0'
        content={<HistoryLogin devices={currentData.devices} />}
      />
    </div>
  )
}
