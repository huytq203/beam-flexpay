import { zodResolver } from '@hookform/resolvers/zod'
import { ButtonComponent, DialogModal } from '@components/index'
import { LockKeyOpenIcon } from '@components/icons'
import { useIdempotencyKey } from '@hooks/useIdempotencyKey'
import { useMessage } from '@hooks/useMessage'
import { usePostUnfreezeTransactionMutation } from '@services/apiWalletAccount.api'
import type { TransactionFreezeSummary } from '@type/apiResponseJournal'
import type { FreezeItem } from '@type/freeze.type'
import { formatCurrency } from '@utils/formatNumber'
import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { UnfreezeEmptyNotice } from './UnfreezeEmptyNotice'
import {
  unfreezeTransactionSchema,
  type UnfreezeTransactionFormValues
} from '../schemas/unfreezeTransaction.schema'
import { UnfreezeTransactionFields } from './UnfreezeTransactionFields'

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
  const { control, handleSubmit, reset, setError, setValue } =
    useForm<UnfreezeTransactionFormValues>({
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
  const idempotency = useIdempotencyKey()

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
        reason: values.reason,
        idempotencyKey: idempotency.take()
      }).unwrap()
      idempotency.reset()
      successMess(
        `Đã mở băng ${formatCurrency(values.amount, {
          symbol: currency,
          position: 'after'
        })} thành công`
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
      footer={
        releasableOrders.length === 0 ? (
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
        )
      }
      styles={{
        footer: {
          borderTop: '1px solid var(--border)',
          marginTop: 20,
          paddingTop: 16
        }
      }}
      title={
        <span className='flex items-center gap-2 text-emerald-700'>
          <LockKeyOpenIcon
            size={18}
            weight='regular'
            aria-hidden
          />
          Mở băng giao dịch
        </span>
      }
    >
      {releasableOrders.length === 0 ? (
        <UnfreezeEmptyNotice
          hasShortfall={(freezeSummary?.shortfallAmount ?? 0) > 0}
        />
      ) : (
        <form
          id={UNFREEZE_TRANSACTION_FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
        >
          <UnfreezeTransactionFields
            control={control}
            transactionCode={transactionCode}
            currency={currency}
            maxAmount={maxAmount}
            releasableOrders={releasableOrders}
            unfreezeType={unfreezeType}
          />
        </form>
      )}
    </DialogModal>
  )
}

export default DialogUnfreezeTransaction
