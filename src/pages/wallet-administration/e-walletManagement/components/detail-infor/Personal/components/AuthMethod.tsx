import { CheckCircleFilled, KeyIcon } from '@components/icons'
import type { AdminTrustedDevice } from '../../../../schemas/Security.schema'

interface AuthMethodProps {
  devices: AdminTrustedDevice[]
}

interface MethodRowProps {
  title: string
  description: string
  status: string
  isActive: boolean
}

const MethodRow = ({
  title,
  description,
  status,
  isActive
}: MethodRowProps) => (
  <div className='flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between'>
    <div className='min-w-0'>
      <p className='font-medium text-slate-900'>{title}</p>
      <p className='mt-0.5 text-sm leading-5 text-slate-500'>{description}</p>
    </div>
    <span
      className={
        isActive
          ? 'inline-flex w-fit shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800'
          : 'inline-flex w-fit shrink-0 rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600'
      }
    >
      {isActive && <CheckCircleFilled aria-hidden />}
      {status}
    </span>
  </div>
)

export const AuthMethod = ({ devices }: AuthMethodProps) => {
  const activeDevices = devices.filter(
    (device) => device.status === 'ACTIVE' && !device.expired
  )
  const registeredFaceIds = devices.filter(
    (device) => device.faceId.registered
  )
  const activeFaceIds = activeDevices.filter(
    (device) => device.faceId.status === 'ACTIVE'
  )

  return (
    <section aria-labelledby='authentication-methods-title'>
      <h2
        id='authentication-methods-title'
        className='mb-3 flex items-center gap-1 text-lg font-bold text-slate-900'
      >
        <KeyIcon weight='fill' className='text-blue' aria-hidden />
        Phương thức xác thực
      </h2>
      <div className='divide-y divide-slate-200 border-y border-slate-200'>
        <MethodRow
          title='Thiết bị đang tin cậy'
          description={`${activeDevices.length}/${devices.length} thiết bị có thể xác thực giao dịch`}
          status={activeDevices.length > 0 ? 'Đang kích hoạt' : 'Chưa kích hoạt'}
          isActive={activeDevices.length > 0}
        />
        <MethodRow
          title='Đăng nhập sinh trắc học'
          description={`${registeredFaceIds.length} đăng ký FaceID được lưu trên thiết bị`}
          status={activeFaceIds.length > 0 ? 'FaceID đang hoạt động' : 'Không hoạt động'}
          isActive={activeFaceIds.length > 0}
        />
      </div>
      {registeredFaceIds.length > 0 && activeFaceIds.length === 0 && (
        <p className='mt-3 text-sm leading-5 text-amber-700'>
          Đăng ký FaceID vẫn được giữ lại, nhưng chỉ dùng được sau khi thiết bị
          được tin cậy lại.
        </p>
      )}
    </section>
  )
}
