import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'

import { globalMessage } from '@hooks/useMessage'

import {
  BANK_OPTIONS,
  MASTER_MERCHANT_OPTIONS,
  SUB_MERCHANT_OPTIONS
} from '../constants/bank-account.constant'
import {
  bankAccountFormSchema,
  EMPTY_BANK_ACCOUNT_FORM,
  type BankAccountFormValues
} from '../schemas/bank-account.schema'
import {
  BankAccountScope,
  BankAccountStatus,
  BankLinkStatus,
  WithdrawMode,
  type BankAccountFormMode,
  type BankAccountRow
} from '../types/bank-account.type'

/** Nhãn option có dạng "Tên · Mã" — phần trước dấu chấm giữa là tên hiển thị. */
const nameFromOption = (label: string | undefined): string =>
  label?.split(' · ')[0] ?? ''

const toFormValues = (row: BankAccountRow | null): BankAccountFormValues =>
  row
    ? {
        masterMerchantId: row.masterMerchantCode,
        subMerchantId:
          row.scope === BankAccountScope.SUB ? row.merchantCode : null,
        bankCode: row.bankCode,
        accountNumber: row.accountNumber,
        accountName: row.accountName,
        branchName: row.branchName ?? '',
        withdrawMode: row.withdrawMode,
        withdrawCycle: row.withdrawCycle ?? null,
        minAmount: row.minAmount ?? null,
        maxAmount: row.maxAmount ?? null
      }
    : EMPTY_BANK_ACCOUNT_FORM

const toRow = (
  values: BankAccountFormValues,
  current: BankAccountRow | null
): BankAccountRow => {
  const isSub = Boolean(values.subMerchantId)
  const masterLabel = MASTER_MERCHANT_OPTIONS.find(
    (option) => option.value === values.masterMerchantId
  )?.label
  const subLabel = SUB_MERCHANT_OPTIONS.find(
    (option) => option.value === values.subMerchantId
  )?.label

  return {
    id: current?.id ?? `bank-account-${Date.now()}`,
    scope: isSub ? BankAccountScope.SUB : BankAccountScope.MASTER,
    merchantName: nameFromOption(isSub ? subLabel : masterLabel),
    merchantCode: (isSub ? values.subMerchantId : values.masterMerchantId) ?? '',
    masterMerchantCode: values.masterMerchantId,
    bankCode: values.bankCode,
    bankName:
      BANK_OPTIONS.find((option) => option.value === values.bankCode)?.label ??
      values.bankCode,
    accountNumber: values.accountNumber,
    accountName: values.accountName,
    branchName: values.branchName || undefined,
    withdrawMode: values.withdrawMode,
    withdrawCycle: values.withdrawCycle ?? undefined,
    minAmount: values.minAmount || undefined,
    maxAmount: values.maxAmount || undefined,
    status: current?.status ?? BankAccountStatus.ACTIVE,
    linkStatus: current?.linkStatus ?? BankLinkStatus.PENDING
  }
}

interface UseBankAccountFormOptions {
  row: BankAccountRow | null
  mode: BankAccountFormMode
  onSaved: (row: BankAccountRow) => void
}

export function useBankAccountForm({
  row,
  mode,
  onSaved
}: UseBankAccountFormOptions) {
  const { control, handleSubmit, setValue } = useForm<BankAccountFormValues>({
    resolver: zodResolver(bankAccountFormSchema),
    defaultValues: toFormValues(row)
  })

  const withdrawMode = useWatch({ control, name: 'withdrawMode' })

  useEffect(() => {
    if (withdrawMode === WithdrawMode.MANUAL) setValue('withdrawCycle', null)
  }, [setValue, withdrawMode])

  // Chưa có endpoint update/khóa ở BE — chỗ này là điểm cắm mutation sau này.
  const submit = handleSubmit((values) => {
    onSaved(toRow(values, row))
    globalMessage.success(
      mode === 'create'
        ? 'Đã thêm mới tài khoản ngân hàng'
        : 'Đã cập nhật tài khoản ngân hàng'
    )
  })

  return { control, setValue, withdrawMode, submit }
}
