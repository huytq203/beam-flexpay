import { WarningIcon } from '@components/icons'

interface UnfreezeEmptyNoticeProps {
  /** Còn yêu cầu đóng băng thiếu hụt nhưng số tiền đang giữ bằng 0. */
  hasShortfall: boolean
}

export function UnfreezeEmptyNotice({
  hasShortfall
}: UnfreezeEmptyNoticeProps) {
  return (
    <div className='rounded-md bg-orange-50 p-3 text-orange-800'>
      <p className='flex items-center gap-1 font-medium'>
        <WarningIcon aria-hidden />
        Chưa có tiền đang giữ để mở băng
      </p>
      <p className='mt-1 text-sm'>
        {hasShortfall
          ? 'Giao dịch còn yêu cầu đóng băng thiếu hụt, nhưng số tiền đang giữ hiện bằng 0. Hãy kiểm tra lại sau khi ví được bù tiền.'
          : 'Không tìm thấy khoản tiền nào còn đang giữ cho giao dịch này. Hãy làm mới danh sách và thử lại.'}
      </p>
    </div>
  )
}
