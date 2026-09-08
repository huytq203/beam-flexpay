import { InfoCircleOutlined } from '@components/icons'
import TooltipComponent from '@components/ui/tooltip-component'
import type { ReactNode } from 'react'

interface FormLabelHintProps {
  label: string
  /** Điều người dùng không đoán được từ nhãn: từ vựng riêng, cách khớp, ý nghĩa ô rỗng. */
  hint: string
  /** Nội dung tooltip khi cần định dạng; mặc định là chính `hint`. */
  children?: ReactNode
}

/**
 * Nhãn ô lọc kèm chú thích. Dấu hỏi chỉ là lối vào bằng chuột — chú thích được
 * ghép thẳng vào tên trường để người đọc màn hình nhận cùng thông tin mà không
 * phải trỏ vào một biểu tượng, nên biểu tượng không nhận focus.
 */
export const FormLabelHint = ({
  label,
  hint,
  children
}: FormLabelHintProps) => (
  <span className='inline-flex items-center gap-1'>
    <span aria-hidden>{label}</span>
    <TooltipComponent title={children ?? hint}>
      <span aria-hidden className='inline-flex cursor-help text-muted-foreground'>
        <InfoCircleOutlined />
      </span>
    </TooltipComponent>
    <span className='sr-only'>{`${label}. ${hint}`}</span>
  </span>
)
