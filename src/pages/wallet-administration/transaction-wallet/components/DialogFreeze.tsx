import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonComponent, DialogModal } from '@components/index'
import { FormInputNumber, FormRadio, FormSelect, FormTextArea } from '@components/form'
import { SnowflakeIcon, WarningIcon } from '@components/icons'
import { useMessage } from '@hooks/useMessage'
import { usePostFreezeTransactionMutation } from '@services/apiWalletAccount.api'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'
import { formatCurrency } from '@utils/formatNumber'
import { useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'
import type { TransactionFreezeTarget } from '../types/Transaction.type'

const freezeTransactionSchema = z.object({
  targetAccountId: z.string().min(1, 'Vui lòng chọn ví cần đóng băng'),
  freezeType: z.literal(1).or(z.literal(2)),
  amount: z
    .number()
    .positive('Số tiền đóng băng phải lớn hơn 0')
    .refine(Number.isInteger, 'Số tiền đóng băng phải là số nguyên'),
  reason: z
    .string()
    .trim()
    .min(10, 'Lý do đóng băng không được để trống')
    .max(255, 'Lý do không được vượt quá 255 ký tự')
})

type FreezeTransactionFormValues = z.infer<typeof freezeTransactionSchema>

interface DialogFreezeProps {
  open: boolean
  sourceTransactionId: string
  transactionCode?: string
  transactionAmount: number
  currency?: string
  targets: TransactionFreezeTarget[]
  onSuccess?: () => void
  onCancel?: () => void
}

const FREEZE_TRANSACTION_FORM_ID = 'freeze-transaction-form'

const DialogFreeze = ({
  open,
  sourceTransactionId,
  transactionCode,
  transactionAmount,
  currency = 'VND',
  targets,
  onSuccess,
  onCancel
}: DialogFreezeProps) => {
  const { successMess } = useMessage()
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue
  } = useForm<FreezeTransactionFormValues>({
    defaultValues: {
      targetAccountId: targets[0]?.accountId ?? '',
      freezeType: 1,
      amount: transactionAmount,
      reason: ''
    },
    resolver: zodResolver(freezeTransactionSchema)
  })
  const freezeType = useWatch({ control, name: 'freezeType' })
  const targetAccountId = useWatch({ control, name: 'targetAccountId' })
  const selectedTarget = targets.find(
    (target) => target.accountId === targetAccountId
  )
  const [postFreezeTransaction, { isLoading }] =
    usePostFreezeTransactionMutation()

  const handleCancel = () => {
    if (!isLoading) onCancel?.()
  }

  useEffect(() => {
    reset({
      targetAccountId: targets[0]?.accountId ?? '',
      freezeType: 1,
      amount: transactionAmount,
      reason: ''
    })
  }, [reset, sourceTransactionId, targets, transactionAmount])

  useEffect(() => {
    setValue('amount', freezeType === 1 ? transactionAmount : 0, {
      shouldValidate: false
    })
  }, [freezeType, setValue, transactionAmount])

  const onSubmit = async (values: FreezeTransactionFormValues) => {
    if (values.amount > transactionAmount) {
      setError('amount', {
        message: 'Số tiền đóng băng không được vượt quá số tiền giao dịch'
      })
      return
    }

    try {
      await postFreezeTransaction({
        accountId: values.targetAccountId,
        sourceTransactionId,
        amount: values.amount,
        reason: values.reason
      }).unwrap()
      successMess(
        `Đã đóng băng ${formatCurrency(values.amount, {
          symbol: currency,
          position: 'after'
        })}`
      )
      onSuccess?.()
    } catch {
      // Lỗi API đã được errorMiddleware hiển thị tập trung; giữ nguyên dữ liệu form.
    }
  }

  return (
    <DialogModal
      open={open}
      onCancel={handleCancel}
      onOk={() => {}}
      closable={!isLoading}
      keyboard={!isLoading}
      maskClosable={!isLoading}
      footer={(
        <div className='flex flex-col-reverse gap-2 sm:flex-row sm:justify-end'>
          <ButtonComponent
            block
            htmlType='button'
            type='default'
            content='Hủy'
            disabled={isLoading}
            onClick={handleCancel}
            className='sm:w-auto!'
          />
          <ButtonComponent
            block
            htmlType='submit'
            form={FREEZE_TRANSACTION_FORM_ID}
            loading={isLoading}
            content='Xác nhận đóng băng'
            className='sm:w-auto!'
          />
        </div>
      )}
      styles={{
        footer: {
          borderTop: '1px solid var(--border)',
          marginTop: 20,
          paddingTop: 16
        }
      }}
      title={(
        <span className='flex items-center gap-2 text-cyan-700'>
          <SnowflakeIcon size={18} weight='regular' aria-hidden />
          Đóng băng giao dịch
        </span>
      )}
    >
    <form id={FREEZE_TRANSACTION_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
      <div className='grid grid-cols-1 gap-2 rounded-md border border-cyan-200 bg-cyan-50 p-3 sm:grid-cols-2'>
        <div className='min-w-0'>
          <p className='text-xs text-cyan-800'>Mã giao dịch</p>
          <p className='truncate font-medium text-cyan-950' title={transactionCode}>
            {transactionCode || '--'}
          </p>
        </div>
        <div className='sm:text-right'>
          <p className='text-xs text-cyan-800'>Số tiền giao dịch</p>
          <p className='font-semibold text-cyan-950'>
            {formatCurrency(transactionAmount, {
              symbol: currency,
              position: 'after'
            })}
          </p>
        </div>
      </div>

      <div className='mt-3 flex flex-col gap-3'>
        {targets.length > 1 ? (
          <FormSelect
            required
            label='Ví cần đóng băng'
            control={control}
            name='targetAccountId'
            options={targets.map((target) => ({
              value: target.accountId,
              label: `${target.roleLabel}: ${target.ownerName}`
            }))}
            allowClear={false}
          />
        ) : (
          <div className='flex items-start justify-between gap-3 rounded-md bg-gray-50 p-3'>
            <div className='min-w-0'>
              <p className='text-xs text-gray-500'>Ví cần đóng băng</p>
              <p className='truncate font-medium text-gray-900'>
                {selectedTarget
                  ? `${selectedTarget.roleLabel}: ${selectedTarget.ownerName}`
                  : '--'}
              </p>
            </div>
            <div className='shrink-0 text-right'>
              <p className='text-xs text-gray-500'>Số dư khả dụng</p>
              <p className='font-medium text-gray-900'>
                {formatCurrency(selectedTarget?.availableBalance ?? 0, {
                  symbol: selectedTarget?.currency ?? currency,
                  position: 'after'
                })}
              </p>
            </div>
          </div>
        )}

        {targets.length > 1 && selectedTarget && (
          <p className='text-sm text-gray-600'>
            Số dư khả dụng của ví đã chọn:{' '}
            <span className='font-medium text-gray-900'>
              {formatCurrency(selectedTarget.availableBalance, {
                symbol: selectedTarget.currency,
                position: 'after'
              })}
            </span>
          </p>
        )}

        <FormRadio
          label='Hình thức đóng băng'
          control={control}
          name='freezeType'
          options={[
            { value: 1, label: 'Đóng băng toàn bộ' },
            { value: 2, label: 'Đóng băng một phần' }
          ]}
        />

        <FormInputNumber
          required
          disabled={freezeType === 1}
          min={1}
          max={transactionAmount}
          suffix={currency}
          control={control}
          name='amount'
          placeholder='Nhập số tiền...'
          formatter={(value) =>
            `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          parser={(value) => Number(value?.replace(/,/g, ''))}
          label='Số tiền cần đóng băng'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />

        <FormTextArea
          required
          maxLength={255}
          showCount
          control={control}
          name='reason'
          placeholder='Nhập lý do đóng băng...'
          label='Lý do đóng băng'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />
      </div>

      <div className='mt-3 rounded-md bg-orange-50 p-3 text-orange-800'>
        <p className='flex items-center gap-1 font-medium'>
          <WarningIcon aria-hidden />
          Lưu ý
        </p>
        <p className='mt-1 text-sm'>
          Tiền sẽ được chuyển từ số dư khả dụng sang số dư đóng băng của ví đã
          chọn. Nếu ví không đủ tiền, hệ thống giữ phần hiện có và ghi nhận phần
          còn thiếu để bù khi tiền về.
        </p>
      </div>

    </form>
    </DialogModal>
  )
}

export default DialogFreeze
