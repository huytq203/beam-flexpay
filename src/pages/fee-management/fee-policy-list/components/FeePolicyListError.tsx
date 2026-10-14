import { WarningCircleIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'

export const FeePolicyListError = ({ onRetry }: { onRetry: () => void }) => (
  <div className='flex flex-col items-start gap-3 py-8'>
    <p className='flex items-center gap-2 text-[13px] font-semibold text-danger-strong'>
      <WarningCircleIcon
        size={18}
        weight='bold'
        aria-hidden
      />
      Không tải được danh sách chính sách phí
    </p>
    <p className='max-w-[60ch] text-[13px] text-muted-foreground'>
      Dịch vụ phí chưa trả lời. Thử lại; nếu vẫn lỗi thì báo đội vận hành hệ
      thống.
    </p>
    <ButtonComponent
      htmlType='button'
      type='default'
      content='Thử lại'
      onClick={onRetry}
    />
  </div>
)
