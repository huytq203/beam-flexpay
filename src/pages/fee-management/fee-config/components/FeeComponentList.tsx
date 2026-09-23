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
import {
  getFeeBusinessCategories,
  inferFeeBusinessCategory,
  type FeeBusinessCategory
} from '../constants/feeConfigFields'
import { FeeBusinessCategoryTabs } from './FeeBusinessCategoryTabs'
import { FeeComponentCard } from './FeeComponentCard'
import { FeeComponentDialog } from './FeeComponentDialog'
import { SectionHeading } from './SectionHeading'

interface FeeComponentListProps {
  control: Control<FeeConfigFormValues>
  feeDomain: FeeDomain
  serviceType: string
  error?: string
  readOnly?: boolean
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
  error,
  readOnly = false
}: FeeComponentListProps) => {
  const { fields, append, update, remove } = useFieldArray({
    control,
    name: 'components'
  })
  const { successMess } = useMessage()
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [selectedBusinessCategory, setSelectedBusinessCategory] =
    useState<FeeBusinessCategory>(() =>
      inferFeeBusinessCategory(
        feeDomain,
        fields as unknown as FeeComponentFormValues[]
      )
    )
  const allowedBusinessCategories = getFeeBusinessCategories(feeDomain)
  const businessCategory =
    fields.length > 0
      ? inferFeeBusinessCategory(
          feeDomain,
          fields as unknown as FeeComponentFormValues[]
        )
      : allowedBusinessCategories.includes(selectedBusinessCategory)
        ? selectedBusinessCategory
        : allowedBusinessCategories[0]

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
      <FeeBusinessCategoryTabs
        value={businessCategory}
        feeDomain={feeDomain}
        disabled={readOnly || fields.length > 0}
        onChange={setSelectedBusinessCategory}
      />

      <SectionHeading
        action={!readOnly ? (
          <ButtonComponent
            htmlType='button'
            type='primary'
            content='Thêm phí thành phần'
            icon={<PlusIcon size={16} weight='bold' aria-hidden />}
            onClick={() => setIsAdding(true)}
          />
        ) : undefined}
      >
        Thiết lập phí
      </SectionHeading>

      {fields.length === 0 ? (
        <div className='rounded-lg border border-dashed border-border px-6 py-10 text-center'>
          <p className='text-[15px] font-semibold text-foreground'>
            Chính sách chưa có thành phần phí nào
          </p>
          <p className='mx-auto mt-1 max-w-[52ch] text-[13px] text-muted-foreground'>
           Vui lòng thêm phí  thành phần.
          </p>
        </div>
      ) : (
        <div className='flex flex-col gap-3'>
          {fields.map((field, index) => (
            <FeeComponentCard
              key={field.id}
              index={index}
              component={field as unknown as FeeComponentFormValues}
              readOnly={readOnly}
              onEdit={() => setEditingIndex(index)}
              onRemove={() => handleRemove(index)}
            />
          ))}
        </div>
      )}

      {!readOnly && error && (
        <p className='mt-2 text-[13px] font-medium text-danger-strong'>
          {error}
        </p>
      )}

      {!readOnly && isOpen && (
        <FeeComponentDialog
          open={isOpen}
          initialValue={editing}
          precedingComponents={precedingComponents}
          existingComponents={fields as unknown as FeeComponentFormValues[]}
          feeDomain={feeDomain}
          businessCategory={businessCategory}
          serviceType={serviceType}
          onSave={handleSave}
          onCancel={closeDialog}
        />
      )}
    </section>
  )
}
