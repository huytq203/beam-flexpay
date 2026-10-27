import { PlusIcon } from '@components/icons'
import { ButtonComponent } from '@components/index'
import { useMessage } from '@hooks/useMessage'
import { useState } from 'react'
import type { Control } from 'react-hook-form'
import { useFieldArray, useWatch } from 'react-hook-form'
import type {
  FeeComponentFormValues,
  FeeConfigFormValues
} from '../schemas/feeConfig.schema'
import {
  FEE_BUSINESS_CATEGORY,
  FEE_SCOPE,
  getFeeBusinessCategories,
  inferFeeBusinessCategory,
  type FeeBusinessCategory,
  type FeeScope
} from '../constants/feeConfigFields'
import { FeeBusinessCategoryTabs } from './FeeBusinessCategoryTabs'
import { findBearerPartner, groupBearerPairs } from '../utils/bearerPairs'
import { FeeComponentCard } from './FeeComponentCard'
import { FeeComponentDialog } from './FeeComponentDialog'
import { SectionHeading } from './SectionHeading'

interface FeeComponentListProps {
  control: Control<FeeConfigFormValues>
  /**
   * Luồng cố định của danh sách: chính sách phí khách chỉ có phí đầu ra, chính sách phí đầu vào
   * chỉ có chi phí đầu vào. Hai luồng không còn chung một form nên không có tab chuyển luồng.
   */
  feeScope?: FeeScope
  serviceType: string
  error?: string
  readOnly?: boolean
}

const ADD_LABEL: Readonly<Record<FeeScope, string>> = {
  OUTPUT_FEE: 'Thêm phí đầu ra',
  INPUT_COST: 'Thêm phí đầu vào'
}

const EMPTY_LABEL: Readonly<Record<FeeScope, string>> = {
  OUTPUT_FEE: 'Chưa có phí đầu ra',
  INPUT_COST: 'Chưa có phí đầu vào'
}

/**
 * Danh sách thành phần phí của một luồng (đầu ra hoặc đầu vào).
 *
 * Thứ tự có nghĩa với backend: thành phần tính dựa trên một thành phần khác
 * phải đứng SAU thành phần nó tham chiếu, và chỉ tính trong cùng luồng. Vì vậy
 * hộp thoại chỉ cho chọn cơ sở tính trong những thành phần cùng luồng đã có
 * phía trên.
 */
export const FeeComponentList = ({
  control,
  feeScope: scope = FEE_SCOPE.OUTPUT_FEE,
  serviceType,
  error,
  readOnly = false
}: FeeComponentListProps) => {
  const { fields, append, insert, update, remove } = useFieldArray({
    control,
    name: 'components'
  })
  const originalTransactionType = useWatch({
    control,
    name: 'originalTransactionType'
  })
  const { successMess } = useMessage()
  const components = fields as unknown as FeeComponentFormValues[]
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [adding, setAdding] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<FeeBusinessCategory>(
    () =>
      inferFeeBusinessCategory(
        scope,
        components.filter(({ feeScope }) => feeScope === scope)
      )
  )

  const indexes = components.flatMap((component, index) =>
    component.feeScope === scope ? [index] : []
  )

  const category = ((): FeeBusinessCategory => {
    if (scope === FEE_SCOPE.INPUT_COST)
      return FEE_BUSINESS_CATEGORY.BANK_PROVIDER
    const sameScope = indexes.map((index) => components[index])
    if (sameScope.length > 0) return inferFeeBusinessCategory(scope, sameScope)
    return getFeeBusinessCategories(scope).includes(selectedCategory)
      ? selectedCategory
      : getFeeBusinessCategories(scope)[0]
  })()

  const editing = editingIndex === null ? null : components[editingIndex]
  // Cả hai bên cùng chịu: sửa một bên của cặp là sửa cả cặp, nên mở hộp thoại kèm thành phần bên kia.
  const partnerIndex =
    editingIndex === null
      ? null
      : findBearerPartner(
          serviceType,
          components,
          editingIndex,
          originalTransactionType
        )
  const partner = partnerIndex === null ? null : components[partnerIndex]
  const dialogOpen = adding || editing !== null
  const closeDialog = () => {
    setAdding(false)
    setEditingIndex(null)
  }

  /**
   * Thông báo nói rõ đây mới là thay đổi trên biểu mẫu. Danh sách thành phần chỉ
   * xuống cơ sở dữ liệu khi bấm Thiết lập, nên một câu "đã lưu" ở đây là nói sai.
   */
  const handleSave = (values: FeeComponentFormValues[]) => {
    const [first, second] = values
    if (editingIndex === null) {
      append(values)
      successMess('Đã thêm thành phần phí, bấm Thiết lập để lưu')
    } else if (partnerIndex !== null) {
      // `editingIndex` luôn là người chuyển của cặp (thẻ mở bằng thành phần đứng đầu nhóm).
      update(editingIndex, first)
      if (second) update(partnerIndex, second)
      else remove(partnerIndex)
      successMess('Đã sửa thành phần phí, bấm Thiết lập để lưu')
    } else {
      update(editingIndex, first)
      // Đổi từ một bên sang cả hai bên: chèn bên người nhận ngay sau để giữ thứ tự tính.
      if (second) insert(editingIndex + 1, second)
      successMess('Đã sửa thành phần phí, bấm Thiết lập để lưu')
    }
    closeDialog()
  }

  const handleRemove = (index: number, pairedIndex: number | null) => {
    remove(pairedIndex === null ? index : [index, pairedIndex])
    successMess('Đã xoá thành phần phí khỏi chính sách')
  }

  const precedingInScope = components.filter(
    (component, index) =>
      component.feeScope === scope &&
      (editingIndex === null || index < editingIndex)
  )
  const isInput = scope === FEE_SCOPE.INPUT_COST
  // Luật người chịu phí theo loại giao dịch, nên chưa chọn thì chưa cho cấu hình trước: cấu hình dở đó
  // sẽ lọt qua các luật chặn khi loại giao dịch được chọn sau.
  const needsServiceType = !isInput && !serviceType
  const groups = groupBearerPairs(
    serviceType,
    components,
    indexes,
    originalTransactionType
  )

  return (
    <section>
      <SectionHeading>
        {isInput ? 'Chi phí đầu vào' : 'Thành phần phí'}
      </SectionHeading>

      <div className='pt-4'>
        <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
          <FeeBusinessCategoryTabs
            value={category}
            feeScope={scope}
            disabled={readOnly || indexes.length > 0}
            onChange={setSelectedCategory}
          />
          {!readOnly && (
            <div className='ml-auto flex items-center gap-3'>
              {needsServiceType && (
                <span className='text-[13px] text-muted-foreground'>
                  Chọn loại giao dịch trước khi thêm phí
                </span>
              )}
            <ButtonComponent
              htmlType='button'
              disabled={needsServiceType}
              type={isInput ? 'default' : 'primary'}
              content={ADD_LABEL[scope]}
              icon={
                <PlusIcon
                  size={16}
                  weight='bold'
                  aria-hidden
                />
              }
              onClick={() => setAdding(true)}
            />
            </div>
          )}
        </div>

        {indexes.length === 0 ? (
          <div className='rounded-lg border border-dashed border-border px-6 py-8 text-center text-[13px] text-muted-foreground'>
            {EMPTY_LABEL[scope]}
          </div>
        ) : (
          <div className='flex flex-col gap-3'>
            {groups.map(({ primary, partner: pairedIndex }, position) => (
              <FeeComponentCard
                key={fields[primary].id}
                index={position}
                component={components[primary]}
                partner={pairedIndex === null ? null : components[pairedIndex]}
                readOnly={readOnly}
                serviceType={serviceType}
                onEdit={() => setEditingIndex(primary)}
                onRemove={() => handleRemove(primary, pairedIndex)}
              />
            ))}
          </div>
        )}
      </div>

      {!readOnly && error && (
        <p className='mt-3 text-[13px] font-medium text-danger-strong'>
          {error}
        </p>
      )}

      {!readOnly && dialogOpen && (
        <FeeComponentDialog
          open
          initialValue={editing}
          initialPartner={partner}
          precedingComponents={precedingInScope}
          existingComponents={components}
          feeScope={scope}
          businessCategory={category}
          serviceType={serviceType}
          originalTransactionType={originalTransactionType}
          onSave={handleSave}
          onCancel={closeDialog}
        />
      )}
    </section>
  )
}
