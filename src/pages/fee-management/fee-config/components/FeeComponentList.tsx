import { FeeDomain } from '@components/fee/feeDomain'
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
  FEE_BUSINESS_CATEGORY,
  FEE_SCOPE,
  FEE_SCOPES,
  feeScopePanelId,
  feeScopeTabId,
  getFeeBusinessCategories,
  inferFeeBusinessCategory,
  type FeeBusinessCategory,
  type FeeScope
} from '../constants/feeConfigFields'
import { FeeBusinessCategoryTabs } from './FeeBusinessCategoryTabs'
import { FeeComponentCard } from './FeeComponentCard'
import { FeeComponentDialog } from './FeeComponentDialog'
import { SectionHeading } from './SectionHeading'
import { FeeScopeTabs } from './FeeScopeTabs'

interface FeeComponentListProps {
  control: Control<FeeConfigFormValues>
  feeDomain: FeeDomain
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
 * Danh sách thành phần phí, tách hai tab theo luồng.
 *
 * Thứ tự có nghĩa với backend: thành phần tính dựa trên một thành phần khác
 * phải đứng SAU thành phần nó tham chiếu, và chỉ tính trong cùng luồng. Vì vậy
 * hộp thoại chỉ cho chọn cơ sở tính trong những thành phần cùng luồng đã có
 * phía trên.
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
  const components = fields as unknown as FeeComponentFormValues[]
  const [activeScope, setActiveScope] = useState<FeeScope>(FEE_SCOPE.OUTPUT_FEE)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [addingScope, setAddingScope] = useState<FeeScope | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<FeeBusinessCategory>(
    () =>
      inferFeeBusinessCategory(
        FEE_SCOPE.OUTPUT_FEE,
        components.filter(({ feeScope }) => feeScope === FEE_SCOPE.OUTPUT_FEE)
      )
  )

  const indexesOf = (scope: FeeScope) =>
    components.flatMap((component, index) =>
      component.feeScope === scope ? [index] : []
    )
  const counts = {
    OUTPUT_FEE: indexesOf(FEE_SCOPE.OUTPUT_FEE).length,
    INPUT_COST: indexesOf(FEE_SCOPE.INPUT_COST).length
  } as const

  const categoryOf = (scope: FeeScope): FeeBusinessCategory => {
    if (scope === FEE_SCOPE.INPUT_COST)
      return FEE_BUSINESS_CATEGORY.BANK_PROVIDER
    const sameScope = indexesOf(scope).map((index) => components[index])
    if (sameScope.length > 0) return inferFeeBusinessCategory(scope, sameScope)
    return getFeeBusinessCategories(scope).includes(selectedCategory)
      ? selectedCategory
      : getFeeBusinessCategories(scope)[0]
  }

  const editing = editingIndex === null ? null : components[editingIndex]
  const dialogScope: FeeScope | null = editing?.feeScope ?? addingScope
  const closeDialog = () => {
    setAddingScope(null)
    setEditingIndex(null)
  }

  /**
   * Thông báo nói rõ đây mới là thay đổi trên biểu mẫu. Danh sách thành phần chỉ
   * xuống cơ sở dữ liệu khi bấm Thiết lập, nên một câu "đã lưu" ở đây là nói sai.
   */
  const handleSave = (value: FeeComponentFormValues) => {
    if (editingIndex === null) {
      append(value)
      successMess('Đã thêm thành phần phí, bấm Thiết lập để lưu')
    } else {
      update(editingIndex, value)
      successMess('Đã sửa thành phần phí, bấm Thiết lập để lưu')
    }
    closeDialog()
  }

  const handleRemove = (index: number) => {
    remove(index)
    successMess('Đã xoá thành phần phí khỏi chính sách')
  }

  const precedingInScope = (scope: FeeScope) =>
    components.filter(
      (component, index) =>
        component.feeScope === scope &&
        (editingIndex === null || index < editingIndex)
    )

  return (
    <section>
      <SectionHeading>Thành phần phí</SectionHeading>

      <FeeScopeTabs
        value={activeScope}
        counts={counts}
        onChange={setActiveScope}
      />

      {FEE_SCOPES.map((scope) => {
        const isInput = scope === FEE_SCOPE.INPUT_COST
        const indexes = indexesOf(scope)
        return (
          <div
            key={scope}
            role='tabpanel'
            id={feeScopePanelId(scope)}
            aria-labelledby={feeScopeTabId(scope)}
            hidden={scope !== activeScope}
            className='pt-4'
          >
            <div className='mb-3 flex flex-wrap items-center justify-between gap-3'>
              <FeeBusinessCategoryTabs
                value={categoryOf(scope)}
                feeScope={scope}
                disabled={readOnly || indexes.length > 0}
                onChange={setSelectedCategory}
              />
              {!readOnly && (
                <ButtonComponent
                  className='ml-auto'
                  htmlType='button'
                  type={isInput ? 'default' : 'primary'}
                  content={ADD_LABEL[scope]}
                  icon={
                    <PlusIcon
                      size={16}
                      weight='bold'
                      aria-hidden
                    />
                  }
                  onClick={() => setAddingScope(scope)}
                />
              )}
            </div>

            {indexes.length === 0 ? (
              <div className='rounded-lg border border-dashed border-border px-6 py-8 text-center text-[13px] text-muted-foreground'>
                {EMPTY_LABEL[scope]}
              </div>
            ) : (
              <div className='flex flex-col gap-3'>
                {indexes.map((index, position) => (
                  <FeeComponentCard
                    key={fields[index].id}
                    index={position}
                    component={components[index]}
                    readOnly={readOnly}
                    onEdit={() => setEditingIndex(index)}
                    onRemove={() => handleRemove(index)}
                  />
                ))}
              </div>
            )}
          </div>
        )
      })}

      {!readOnly && error && (
        <p className='mt-3 text-[13px] font-medium text-danger-strong'>
          {error}
        </p>
      )}

      {!readOnly && dialogScope && (
        <FeeComponentDialog
          open
          initialValue={editing}
          precedingComponents={precedingInScope(dialogScope)}
          existingComponents={components}
          feeDomain={feeDomain}
          feeScope={dialogScope}
          businessCategory={categoryOf(dialogScope)}
          serviceType={serviceType}
          onSave={handleSave}
          onCancel={closeDialog}
        />
      )}
    </section>
  )
}
