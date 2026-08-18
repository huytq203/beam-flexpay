import { CreditCardOutlined, UserOutlined } from '@components/icons'

interface DocumentPlaceholderProps {
  title: string
  description: string
  className: string
  icon: React.ReactNode
}

const DocumentPlaceholder = ({
  title,
  description,
  className,
  icon
}: DocumentPlaceholderProps) => (
  <div
    className={`group flex min-h-40 flex-1 flex-col justify-between overflow-hidden rounded-xl border p-4 transition-colors duration-200 ${className}`}
  >
    <div className='flex items-center justify-between gap-3'>
      <span className='text-sm font-semibold'>{title}</span>
      <span className='rounded-md bg-white/70 px-2 py-1 text-[11px] font-medium'>
        Chưa có ảnh - tính năng đang phát triển
      </span>
    </div>
    <div className='flex flex-1 items-center justify-center py-5'>
      <span
        aria-hidden
        className='flex size-14 items-center justify-center rounded-xl bg-white/80 text-2xl shadow-xs'
      >
        {icon}
      </span>
    </div>
    <p className='text-xs font-medium opacity-75'>{description}</p>
  </div>
)

const BusinessPesonal = () => {
  return (
    <div className='flex flex-1 flex-col gap-3'>
      <div className='grid flex-1 grid-cols-1 gap-3 md:grid-cols-2'>
        <DocumentPlaceholder
          title='CCCD mặt trước'
          description='Mặt có ảnh chân dung và thông tin định danh'
          className='border-cyan-200 bg-cyan-50 text-cyan-900'
          icon={<CreditCardOutlined />}
        />
        <DocumentPlaceholder
          title='CCCD mặt sau'
          description='Mặt có ngày cấp và đặc điểm nhận dạng'
          className='border-blue-200 bg-blue-50 text-blue-900'
          icon={<CreditCardOutlined />}
        />
      </div>

      <DocumentPlaceholder
        title='Ảnh chân dung'
        description='Ảnh khuôn mặt dùng để đối chiếu với giấy tờ định danh'
        className='min-h-52 border-violet-200 bg-violet-50 text-violet-900'
        icon={<UserOutlined />}
      />
    </div>
  )
}

export default BusinessPesonal
