import type { FeeDomain } from '@components/fee/feeDomain'
import { PlusIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { useFieldArray } from 'react-hook-form'
import type {
  FeeComponentFormValues,
  FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import { FeeComponentCard } from './FeeComponentCard'
import { FeeComponentDialog } from './FeeComponentDialog'
import { SectionHeading } from './SectionHeading'

interface FeeComponentListProps {
  control: Control<FeeConfigFormValues>
  feeDomain: FeeDomain
  serviceType: string
  error?: string
}

/**
 * Danh sách thành phần phí của chính sách.
 *
 * Thứ tự có nghĩa với backend: thành phần tính dựa trên một thành phần khác
 * phải đứng SAU thành phần nó tham chiếu. Vì vậy hộp thoại chỉ cho chọn cơ sở
 * tính trong những thành phần đã có phía trên.
 */
export const FeeComponentList = ({
  control,
  feeDomain,
  serviceType,
  error
}: FeeComponentListProps) => {
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'components'
  })
  const { successMess } = useMessage()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)

  const isOpen = isAdding || editingIndex !== null
  const editing =
    editingIndex === null
      ? null
      : (fields[editingIndex] as unknown as FeeComponentFormValues)

  const closeDialog = () => {
    setIsAdding(false)
    setEditingIndex(null)
  }

  /**
   * Thông báo nói rõ đây mới là thay đổi trên biểu mẫu. Danh sách thành phần chỉ
   * xuống cơ sở dữ liệu khi bấm Thiết lập, nên một câu "đã lưu" ở đây là nói sai.
   */
  const handleSave = (value: FeeComponentFormValues) => {
    if (editingIndex === null) {
      append(value)
      successMess('Đã thêm phí thành phần vào chính sách, bấm Thiết lập để lưu')
    } else {
      update(editingIndex, value)
      successMess('Đã sửa phí thành phần, bấm Thiết lập để lưu')
    }
    closeDialog()
  }

  const handleRemove = (index: number) => {
    remove(index)
    successMess('Đã xoá phí thành phần khỏi chính sách')
  }

  const precedingComponents = fields.slice(
    0,
    editingIndex ?? fields.length
  ) as unknown as FeeComponentFormValues[]

  return (
    <section>
      <SectionHeading
        hint='Mỗi thành phần là một khoản phí riêng cộng vào tổng. Thành phần tính dựa trên thành phần khác phải nằm dưới nó.'
        action={
          <ButtonComponent
            htmlType='button'
            type='primary'
            content='Thêm phí thành phần'
            icon={<PlusIcon size={16} weight='bold' aria-hidden />}
            onClick={() => setIsAdding(true)}
          />
        }
      >
        Thiết lập phí
      </SectionHeading>

      {fields.length === 0 ? (
        <div className='rounded-lg border border-dashed border-border px-6 py-10 text-center'>
          <p className='text-[15px] font-semibold text-foreground'>
            Chính sách chưa có thành phần phí nào
          </p>
          <p className='mx-auto mt-1 max-w-[52ch] text-[13px] text-muted-foreground'>
            Một chính sách cần ít nhất một thành phần thì mới tính ra được số
            tiền. Thêm phí giao dịch trước, rồi thêm thuế giá trị gia tăng tính
            trên nó nếu cần.
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {fields.map((field, index) => (
            <FeeComponentCard
              key={field.id}
              index={index}
              component={field as unknown as FeeComponentFormValues}
              onEdit={() => setEditingIndex(index)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}

      {error && (
        <p className='mt-2 text-[13px] font-medium text-danger-strong'>
          {error}
        </p>
      )}

      {isOpen && (
        <FeeComponentDialog
          open={isOpen}
          initialValue={editing}
          precedingComponents={precedingComponents}
          feeDomain={feeDomain}
          serviceType={serviceType}
          onSave={handleSave}
          onCancel={closeDialog}
        />
      )}
    </section>
  )
}
