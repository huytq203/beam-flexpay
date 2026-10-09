import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { WalletLimitSpecialMonth } from '@type/walletLimit.type'
import { FormInput } from '@components/form'
import { ModalComponent } from '@components/index'
import {
  renameSpecialMonthSchema,
  type RenameSpecialMonthFormValues
} from '../schemas/specialMonth.schema'
import { useRenameSpecialMonth } from '../hooks/useSpecialMonths'
import { formatMonthLabel } from '../utils/specialMonth.utils'

interface SpecialMonthRenameModalProps {
  month: WalletLimitSpecialMonth
  onClose: () => void
}

// Mount mỗi lần mở nên ô tên luôn bắt đầu từ tên hiện tại của tháng.
export function SpecialMonthRenameModal({
  month,
  onClose
}: SpecialMonthRenameModalProps) {
  const { renameMonth, isRenaming } = useRenameSpecialMonth()
  const [serverError, setServerError] = useState<string | null>(null)
  const { control, handleSubmit } = useForm<RenameSpecialMonthFormValues>({
    resolver: zodResolver(renameSpecialMonthSchema),
    defaultValues: { name: month.name }
  })

  const submit = handleSubmit(async ({ name }) => {
    setServerError(null)
    const error = await renameMonth(month.id, name)
    if (error) {
      setServerError(error)
      return
    }
    onClose()
  })

  return (
    <ModalComponent
      open
      width={480}
      title={`Đổi tên tháng ${formatMonthLabel(month.monthStart)}`}
      okText='Lưu tên'
      cancelText='Hủy'
      confirmLoading={isRenaming}
      onOk={() => void submit()}
      onCancel={onClose}
    >
      <form
        noValidate
        onSubmit={(event) => void submit(event)}
        className='flex flex-col gap-3'
      >
        <FormInput
          name='name'
          control={control}
          label='Tên tháng đặc biệt'
          required
          placeholder='Nhập tên tháng đặc biệt'
          className='flex min-w-0 flex-col gap-2'
        />
        {serverError && (
          <p
            role='alert'
            className='text-sm text-danger-strong'
          >
            {serverError}
          </p>
        )}
      </form>
    </ModalComponent>
  )
}
