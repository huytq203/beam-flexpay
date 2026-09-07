import { z } from 'zod'

import {
  BankAccountScope,
  BankAccountStatus,
  BankLinkStatus,
  WithdrawCycle,
  WithdrawMode
} from '../types/bank-account.type'

export const bankAccountSearchSchema = z.object({
  keyword: z.string().trim().max(100, 'Từ khóa tối đa 100 ký tự').optional(),
  scope: z
    .enum([BankAccountScope.MASTER, BankAccountScope.SUB])
    .optional(),
  status: z
    .enum([BankAccountStatus.ACTIVE, BankAccountStatus.INACTIVE])
    .optional(),
  linkStatus: z
    .enum([BankLinkStatus.LINKED, BankLinkStatus.PENDING, BankLinkStatus.FAILED])
    .optional()
})

export type BankAccountSearchValues = z.infer<typeof bankAccountSearchSchema>

const ACCOUNT_NUMBER_REGEX = /^\d{6,20}$/

/** 0 hoặc bỏ trống nghĩa là không đặt hạn mức cho chiều đó. */
const optionalAmount = z
  .number('Hạn mức phải là số')
  .min(0, 'Hạn mức không được âm')
  .nullable()

export const bankAccountFormSchema = z
  .object({
    masterMerchantId: z.string().min(1, 'Vui lòng chọn Master Merchant'),
    subMerchantId: z.string().nullable(),
    bankCode: z.string().min(1, 'Vui lòng chọn ngân hàng'),
    accountNumber: z
      .string()
      .regex(ACCOUNT_NUMBER_REGEX, 'Số tài khoản gồm 6–20 chữ số'),
    accountName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên chủ tài khoản')
      .max(255, 'Tên chủ tài khoản tối đa 255 ký tự'),
    branchName: z.string().trim().max(255, 'Chi nhánh tối đa 255 ký tự'),
    withdrawMode: z.enum([WithdrawMode.MANUAL, WithdrawMode.AUTO]),
    withdrawCycle: z
      .enum([
        WithdrawCycle.T0,
        WithdrawCycle.T1,
        WithdrawCycle.T2,
        WithdrawCycle.T3
      ])
      .nullable(),
    minAmount: optionalAmount,
    maxAmount: optionalAmount
  })
  .superRefine((values, context) => {
    if (values.withdrawMode === WithdrawMode.AUTO && !values.withdrawCycle) {
      context.addIssue({
        code: 'custom',
        path: ['withdrawCycle'],
        message: 'Vui lòng chọn chu kỳ rút tự động'
      })
    }

    if (
      values.minAmount &&
      values.maxAmount &&
      values.maxAmount < values.minAmount
    ) {
      context.addIssue({
        code: 'custom',
        path: ['maxAmount'],
        message: 'Hạn mức tối đa phải lớn hơn hạn mức tối thiểu'
      })
    }
  })

export type BankAccountFormValues = z.infer<typeof bankAccountFormSchema>

export const EMPTY_BANK_ACCOUNT_FORM: BankAccountFormValues = {
  masterMerchantId: '',
  subMerchantId: null,
  bankCode: '',
  accountNumber: '',
  accountName: '',
  branchName: '',
  withdrawMode: WithdrawMode.MANUAL,
  withdrawCycle: null,
  minAmount: null,
  maxAmount: null
}

export const bankAccountLockSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(10, 'Lý do tối thiểu 10 ký tự')
    .max(500, 'Lý do tối đa 500 ký tự')
})

export type BankAccountLockValues = z.infer<typeof bankAccountLockSchema>
