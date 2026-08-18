import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonComponent, DialogModal } from '@components/index'
import { FormInputNumber, FormRadio, FormSelect, FormTextArea } from '@components/form'
import { LockKeyOpenIcon, WarningIcon } from '@components/icons'
import { useMessage } from '@hooks/useMessage'
import { usePostUnfreezeTransactionMutation } from '@services/apiWalletAccount.api'
import type { TransactionFreezeSummary } from '@type/apiResponseJournal'
import type { FreezeItem } from '@type/freeze.type'
import { blockLeadingAndRepeatedSpace } from '@utils/inputHandlers'
import { formatCurrency } from '@utils/formatNumber'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { z } from 'zod'

const unfreezeTransactionSchema = z.object({
  freezeId: z.string().min(1, 'Vui lòng chọn khoản cần mở băng'),
  unfreezeType: z.literal(1).or(z.literal(2)),
  amount: z
    .number()
    .positive('Số tiền mở băng phải lớn hơn 0')
    .refine(Number.isInteger, 'Số tiền mở băng phải là số nguyên'),
  reason: z
    .string()
    .trim()
    .min(1, 'Lý do mở băng không được để trống')
    .max(500, 'Lý do không được vượt quá 500 ký tự')
})

type UnfreezeTransactionFormValues = z.infer<typeof unfreezeTransactionSchema>

interface DialogUnfreezeTransactionProps {
  open: boolean
  sourceTransactionId: string
  transactionCode?: string
  currency?: string
  freezeOrders: FreezeItem[]
  freezeSummary?: TransactionFreezeSummary | null
  onSuccess?: () => void
  onCancel?: () => void
}

const UNFREEZE_TRANSACTION_FORM_ID = 'unfreeze-transaction-form'

const getFreezeLabel = (freeze: FreezeItem) => {
  const owner = freeze.ownerUsername || `${freeze.accountId.slice(0, 8)}…`
  return `${owner}${freeze.parentFreezeId ? ' (khoản bù)' : ''}`
}

const DialogUnfreezeTransaction = ({
  open,
  sourceTransactionId,
  transactionCode,
  currency = 'VND',
  freezeOrders,
  freezeSummary,
  onSuccess,
  onCancel
}: DialogUnfreezeTransactionProps) => {
  const { successMess } = useMessage()
  const releasableOrders = useMemo(
    () => freezeOrders.filter((freeze) => freeze.remainingAmount > 0),
    [freezeOrders]
  )
  const {
    control,
    handleSubmit,
    reset,
    setError,
    setValue
  } = useForm<UnfreezeTransactionFormValues>({
    defaultValues: {
      freezeId: releasableOrders[0]?.id ?? '',
      unfreezeType: 1,
      amount: releasableOrders[0]?.remainingAmount ?? 0,
      reason: ''
    },
    resolver: zodResolver(unfreezeTransactionSchema)
  })
  const freezeId = useWatch({ control, name: 'freezeId' })
  const unfreezeType = useWatch({ control, name: 'unfreezeType' })
  const selectedFreeze = releasableOrders.find(
    (freeze) => freeze.id === freezeId
  )
  const maxAmount = selectedFreeze?.remainingAmount ?? 0
  const [postUnfreezeTransaction, { isLoading }] =
    usePostUnfreezeTransactionMutation()

  const handleCancel = () => {
    if (!isLoading) onCancel?.()
  }

  useEffect(() => {
    reset({
      freezeId: releasableOrders[0]?.id ?? '',
      unfreezeType: 1,
      amount: releasableOrders[0]?.remainingAmount ?? 0,
      reason: ''
    })
  }, [releasableOrders, reset, sourceTransactionId])

  useEffect(() => {
    setValue('amount', unfreezeType === 1 ? maxAmount : 0, {
      shouldValidate: false
    })
  }, [maxAmount, setValue, unfreezeType])

  const onSubmit = async (values: UnfreezeTransactionFormValues) => {
    if (!selectedFreeze) return
    if (values.amount > selectedFreeze.remainingAmount) {
      setError('amount', {
        message: 'Số tiền mở băng không được vượt quá số tiền đang giữ'
      })
      return
    }

    try {
      await postUnfreezeTransaction({
        accountId: selectedFreeze.accountId,
        freezeId: selectedFreeze.id,
        sourceTransactionId,
        amount: values.amount,
        reason: values.reason
      }).unwrap()
      successMess(
        `Đã mở băng ${formatCurrency(values.amount, {
          symbol: selectedFreeze.currency || currency,
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
      footer={releasableOrders.length === 0 ? (
        <ButtonComponent
          htmlType='button'
          type='default'
          content='Đóng'
          disabled={isLoading}
          onClick={handleCancel}
        />
      ) : (
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
            form={UNFREEZE_TRANSACTION_FORM_ID}
            loading={isLoading}
            content='Xác nhận mở băng'
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
        <span className='flex items-center gap-2 text-emerald-700'>
          <LockKeyOpenIcon size={18} weight='regular' aria-hidden />
          Mở băng giao dịch
        </span>
      )}
    >
    {releasableOrders.length === 0 ? (
      <div className='rounded-md bg-orange-50 p-3 text-orange-800'>
        <p className='flex items-center gap-1 font-medium'>
          <WarningIcon aria-hidden />
          Chưa có tiền đang giữ để mở băng
        </p>
        <p className='mt-1 text-sm'>
          {(freezeSummary?.shortfallAmount ?? 0) > 0
            ? 'Giao dịch còn yêu cầu đóng băng thiếu hụt, nhưng số tiền đang giữ hiện bằng 0. Hãy kiểm tra lại sau khi ví được bù tiền.'
            : 'Không tìm thấy khoản tiền nào còn đang giữ cho giao dịch này. Hãy làm mới danh sách và thử lại.'}
        </p>
      </div>
    ) : (
    <form id={UNFREEZE_TRANSACTION_FORM_ID} onSubmit={handleSubmit(onSubmit)}>
      <div className='grid grid-cols-1 gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 sm:grid-cols-2'>
        <div className='min-w-0'>
          <p className='text-xs text-emerald-800'>Mã giao dịch</p>
          <p className='truncate font-medium text-emerald-950' title={transactionCode}>
            {transactionCode || '--'}
          </p>
        </div>
        <div className='sm:text-right'>
          <p className='text-xs text-emerald-800'>Số tiền đang giữ</p>
          <p className='font-semibold text-emerald-950'>
            {formatCurrency(maxAmount, {
              symbol: selectedFreeze?.currency || currency,
              position: 'after'
            })}
          </p>
        </div>
      </div>

      <div className='mt-3 flex flex-col gap-3'>
        {releasableOrders.length > 1 && (
          <FormSelect
            required
            label='Khoản cần mở băng'
            control={control}
            name='freezeId'
            options={releasableOrders.map((freeze) => ({
              value: freeze.id,
              label: `${getFreezeLabel(freeze)} - ${formatCurrency(freeze.remainingAmount, {
                symbol: freeze.currency || currency,
                position: 'after'
              })}`
            }))}
            allowClear={false}
          />
        )}

        {releasableOrders.length === 1 && (
          <div className='rounded-md bg-gray-50 p-3'>
            <p className='text-xs text-gray-500'>Ví đang giữ tiền</p>
            <p className='truncate font-medium text-gray-900' title={getFreezeLabel(releasableOrders[0])}>
              {getFreezeLabel(releasableOrders[0])}
            </p>
          </div>
        )}

        <FormRadio
          label='Hình thức mở băng'
          control={control}
          name='unfreezeType'
          options={[
            { value: 1, label: 'Mở băng toàn bộ' },
            { value: 2, label: 'Mở băng một phần' }
          ]}
        />

        <FormInputNumber
          required
          disabled={unfreezeType === 1}
          min={1}
          max={maxAmount}
          suffix={selectedFreeze?.currency || currency}
          control={control}
          name='amount'
          placeholder='Nhập số tiền...'
          formatter={(value) =>
            `${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
          }
          parser={(value) => Number(value?.replace(/,/g, ''))}
          label='Số tiền cần mở băng'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />

        <FormTextArea
          required
          maxLength={500}
          showCount
          control={control}
          name='reason'
          placeholder='Nhập lý do mở băng...'
          label='Lý do mở băng'
          onKeyDown={blockLeadingAndRepeatedSpace}
        />
      </div>

      <div className='mt-3 rounded-md bg-orange-50 p-3 text-orange-800'>
        <p className='flex items-center gap-1 font-medium'>
          <WarningIcon aria-hidden />
          Lưu ý
        </p>
        <p className='mt-1 text-sm'>
          Tiền mở băng sẽ được chuyển từ số dư đóng băng về số dư khả dụng của
          đúng ví đã giữ tiền trong giao dịch này.
        </p>
      </div>

    </form>
    )}
    </DialogModal>
  )
}

export default DialogUnfreezeTransaction
