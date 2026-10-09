import { PickerTrigger, type PickedEntity } from '@components/index'
import { WalletLimitScope } from '@type/walletLimit.type'
import { useState } from 'react'
import { Controller, useFormContext, useWatch } from 'react-hook-form'
import type { WalletLimitFormValues } from '../schemas/walletLimitForm.schema'
import { GroupPickerDialog } from './GroupPickerDialog'
import { WalletPickerDialog } from './WalletPickerDialog'

const TARGET_FIELD_ID = 'wallet-limit-target'

/**
 * Ô "Mã định danh" của màn Thêm mới. Lựa chọn nhớ kèm phạm vi lúc chọn
 * (`targetScope`): đổi Đối tượng thì ô tự trống mà không cần effect dọn state.
 */
export function WalletLimitFormTargetField() {
  const { control, setValue } = useFormContext<WalletLimitFormValues>()
  const [scope, targetScope, targetId, targetDisplay] = useWatch({
    control,
    name: ['scopeType', 'targetScope', 'targetId', 'targetDisplay']
  })
  const [isOpen, setIsOpen] = useState(false)

  if (scope === WalletLimitScope.SYSTEM) {
    return (
      <p className='text-xs text-muted-foreground'>
        Cấu hình Hệ thống áp dụng cho mọi ví, không cần chọn mã định danh.
      </p>
    )
  }

  const isGroup = scope === WalletLimitScope.GROUP
  const isCurrent = targetScope === scope
  const close = () => setIsOpen(false)
  const Dialog = isGroup ? GroupPickerDialog : WalletPickerDialog

  return (
    <Controller
      control={control}
      name='targetId'
      render={({ field, fieldState }) => (
        <>
          <PickerTrigger
            id={TARGET_FIELD_ID}
            label='Mã định danh'
            required
            value={isCurrent ? targetDisplay : ''}
            placeholder={
              isGroup ? 'Chọn nhóm hạn mức' : 'Chọn ví theo số điện thoại'
            }
            error={fieldState.error?.message}
            onOpen={() => setIsOpen(true)}
            onClear={() => {
              setValue('targetDisplay', '')
              field.onChange('')
            }}
          />
          <Dialog
            open={isOpen}
            selectedId={isCurrent ? targetId : undefined}
            onCancel={close}
            onSelect={(entity: PickedEntity) => {
              // Đặt phạm vi trước id: lần kiểm lại ở field.onChange đọc phạm vi mới.
              setValue('targetDisplay', entity.name)
              setValue('targetScope', scope)
              field.onChange(entity.id)
              close()
            }}
          />
        </>
      )}
    />
  )
}
