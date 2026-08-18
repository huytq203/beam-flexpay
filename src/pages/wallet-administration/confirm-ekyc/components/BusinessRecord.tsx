import { FileDoneOutlined, HistoryOutlined } from '@components/icons'

interface RecordPlaceholderProps {
  title: string
  description: string
  className: string
  icon: React.ReactNode
}

const RecordPlaceholder = ({
  title,
  description,
  className,
  icon
}: RecordPlaceholderProps) => (
  <div
    className={`flex min-h-36 flex-1 items-center gap-4 rounded-xl border p-4 transition-colors duration-200 sm:p-5 ${className}`}
  >
    <span
      aria-hidden
      className='flex size-14 shrink-0 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-xs'
    >
      {icon}
    </span>

    <div className='min-w-0 flex-1'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold'>{title}</h3>
        <span className='rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium'>
          Chưa có tài liệu - tính năng đang phát triển
        </span>
      </div>
      <p className='mt-2 text-xs font-medium leading-5 opacity-75'>
        {description}
      </p>
    </div>
  </div>
)

const BusinessRecord = () => {
  return (
    <div className='flex flex-1 flex-col gap-3'>
      <RecordPlaceholder
        title='Hồ sơ 1'
        description='Tài liệu hồ sơ phục vụ kiểm tra và đối chiếu thông tin'
        className='border-amber-200 bg-amber-50 text-amber-950'
        icon={<FileDoneOutlined />}
      />
      <RecordPlaceholder
        title='Hồ sơ 2'
        description='Tài liệu bổ sung trong quá trình xác minh hồ sơ'
        className='border-rose-200 bg-rose-50 text-rose-950'
        icon={<HistoryOutlined />}
      />
    </div>
  )
}

export default BusinessRecord
