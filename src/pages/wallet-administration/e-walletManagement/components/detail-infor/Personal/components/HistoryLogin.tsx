import dayjs from 'dayjs'
import { DeviceMobileSpeakerIcon, HistoryOutlined } from '@components/icons'
import { TYPEDATE } from '@constants/date.constant'
import type {
  AdminTrustedDevice,
  DeviceStatus
} from '../../../../schemas/Security.schema'

interface HistoryLoginProps {
  devices: AdminTrustedDevice[]
}

const STATUS_LABEL: Record<DeviceStatus, string> = {
  ACTIVE: 'Đang tin cậy',
  SUSPENDED: 'Tạm khóa',
  REVOKED: 'Đã thu hồi',
  EXPIRED: 'Đã hết hạn'
}

const STATUS_CLASS: Record<DeviceStatus, string> = {
  ACTIVE: 'bg-emerald-100 text-emerald-800',
  SUSPENDED: 'bg-amber-100 text-amber-800',
  REVOKED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-slate-100 text-slate-700'
}

const formatDeviceTime = (value?: string | null): string => {
  if (!value) return 'Chưa sử dụng'
  const parsed = dayjs(value.replace(' ', 'T'))
  return parsed.isValid() ? parsed.format(TYPEDATE.fullTime) : value
}

const getDeviceName = (device: AdminTrustedDevice): string =>
  device.deviceName || device.deviceModel || device.deviceId

const DeviceItem = ({ device }: { device: AdminTrustedDevice }) => {
  const status = device.expired ? 'EXPIRED' : device.status
  const deviceVersion = [
    device.platform,
    device.osVersion,
    device.appVersion ? `App v${device.appVersion}` : null
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <li className='flex flex-col gap-3 py-3 sm:flex-row sm:justify-between'>
      <div className='min-w-0'>
        <p className='flex min-w-0 items-center gap-1.5 font-semibold text-slate-900'>
          <DeviceMobileSpeakerIcon className='shrink-0' aria-hidden />
          <span className='break-words'>{getDeviceName(device)}</span>
        </p>
        <p className='mt-1 break-words text-sm text-slate-500'>
          {deviceVersion || 'Chưa có thông tin phiên bản'}
        </p>
        {device.faceId.registered && (
          <p className='mt-1 text-xs font-medium text-blue-700'>
            FaceID {device.faceId.status === 'ACTIVE' ? 'đã đăng ký' : 'đã tắt'}
          </p>
        )}
      </div>
      <div className='flex shrink-0 flex-col items-start gap-1 sm:items-end'>
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${STATUS_CLASS[status]}`}
        >
          {STATUS_LABEL[status]}
        </span>
        <time className='text-xs font-medium text-slate-700'>
          {formatDeviceTime(device.lastUsedAt || device.createdAt)}
        </time>
        <span className='text-xs text-slate-500'>
          IP: {device.boundFromIp || '--'}
        </span>
      </div>
    </li>
  )
}

/** Chỉ để xem: màn này không thu hồi phiên hay đăng xuất thiết bị. */
export const HistoryLogin = ({ devices }: HistoryLoginProps) => (
  <section aria-labelledby='trusted-devices-title'>
    <div className='mb-3 flex items-center justify-between gap-2'>
      <h2
        id='trusted-devices-title'
        className='flex items-center gap-1 text-lg font-bold text-slate-900'
      >
        <HistoryOutlined className='text-blue' aria-hidden />
        Thiết bị tin cậy
      </h2>
      <span className='shrink-0 text-sm text-slate-500'>
        {devices.length} thiết bị
      </span>
    </div>

    {devices.length === 0 ? (
      <div className='border-y border-slate-200 py-8 text-center'>
        <DeviceMobileSpeakerIcon
          className='mx-auto text-3xl text-slate-400'
          aria-hidden
        />
        <p className='mt-2 font-medium text-slate-700'>Chưa ghi nhận thiết bị</p>
        <p className='mt-1 text-sm text-slate-500'>
          Thiết bị sẽ xuất hiện sau lần đăng nhập và xác thực đầu tiên.
        </p>
      </div>
    ) : (
      <ul className='m-0 max-h-96 list-none divide-y divide-slate-200 overflow-y-auto border-y border-slate-200 p-0'>
        {devices.map((device) => (
          <DeviceItem key={device.id || device.deviceId} device={device} />
        ))}
      </ul>
    )}
  </section>
)
