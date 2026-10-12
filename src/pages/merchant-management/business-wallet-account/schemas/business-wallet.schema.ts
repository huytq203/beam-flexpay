import { z } from 'zod'

import type { UploadFile } from '@components/form'

export const businessWalletSearchSchema = z.object({
  query: z.string().trim().max(100, 'Từ khóa tối đa 100 ký tự').optional(),
  taxCode: z.string().trim().max(13, 'Mã số thuế tối đa 13 ký tự').optional(),
  verificationStatus: z
    .enum(['DRAFT', 'PENDING_APPROVAL', 'VERIFIED', 'REJECTED'])
    .optional()
})

export type BusinessWalletSearchValues = z.infer<
  typeof businessWalletSearchSchema
>

const ID_NUMBER_REGEX = /^(\d{9}|\d{12})$/
const TAX_CODE_REGEX = /^\d{10}(\d{3})?$/

const ID_NUMBER_MESSAGE = 'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số'
const MAX_BUSINESS_LICENSE_SIZE = 5 * 1024 * 1024
const MAX_ID_CARD_SIZE = 5 * 1024 * 1024
const MAX_AUTHORIZATION_LETTER_SIZE = 10 * 1024 * 1024

const uploadFileSchema = z.custom<UploadFile>()
const getFileSize = (file: UploadFile) =>
  file.originFileObj?.size ?? file.size ?? 0
const filesWithinSize = (maxFileSize: number) => (files: UploadFile[]) =>
  files.every((file) => getFileSize(file) <= maxFileSize)

export const businessWalletFormSchema = z
  .object({
    email: z
      .email('Email đăng ký không đúng định dạng')
      .max(255, 'Email tối đa 255 ký tự'),
    businessName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên doanh nghiệp')
      .max(255, 'Tên doanh nghiệp tối đa 255 ký tự'),
    businessType: z.enum(['ENTERPRISE', 'HOUSEHOLD']),
    taxCode: z.string().regex(TAX_CODE_REGEX, 'Mã số thuế gồm 10 hoặc 13 số'),
    headOfficeAddress: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập địa chỉ trụ sở')
      .max(500, 'Địa chỉ trụ sở tối đa 500 ký tự'),
    legalRepName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên người đại diện pháp luật')
      .max(255, 'Tên người đại diện tối đa 255 ký tự'),
    legalRepIdNumber: z.string().regex(ID_NUMBER_REGEX, ID_NUMBER_MESSAGE),
    managerName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập họ tên người quản lý ví')
      .max(255, 'Họ tên người quản lý ví tối đa 255 ký tự'),
    managerPosition: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập chức vụ')
      .max(255, 'Chức vụ tối đa 255 ký tự'),
    managerIdNumber: z.string().regex(ID_NUMBER_REGEX, ID_NUMBER_MESSAGE),
    managerIdExpiry: z
      .string()
      .min(1, 'Vui lòng chọn ngày hết hạn CCCD')
      .refine(
        (value) =>
          !Number.isNaN(Date.parse(value)) &&
          new Date(value).getTime() > Date.now(),
        'Ngày hết hạn CCCD phải sau hôm nay'
      ),
    businessLicense: z
      .array(uploadFileSchema)
      .min(1, 'Vui lòng tải lên Giấy phép ĐKKD')
      .refine(
        filesWithinSize(MAX_BUSINESS_LICENSE_SIZE),
        'Giấy phép ĐKKD không được vượt quá 5MB'
      ),
    authorizationLetter: z
      .array(uploadFileSchema)
      .refine(
        filesWithinSize(MAX_AUTHORIZATION_LETTER_SIZE),
        'Giấy ủy quyền không được vượt quá 10MB'
      ),
    idCardFront: z
      .array(uploadFileSchema)
      .min(1, 'Vui lòng tải lên ảnh CCCD mặt trước')
      .refine(
        filesWithinSize(MAX_ID_CARD_SIZE),
        'Ảnh CCCD mặt trước không được vượt quá 5MB'
      ),
    idCardBack: z
      .array(uploadFileSchema)
      .min(1, 'Vui lòng tải lên ảnh CCCD mặt sau')
      .refine(
        filesWithinSize(MAX_ID_CARD_SIZE),
        'Ảnh CCCD mặt sau không được vượt quá 5MB'
      ),
    isInternalWallet: z.boolean()
  })
  .superRefine((values, context) => {
    if (
      values.managerIdNumber !== values.legalRepIdNumber &&
      values.authorizationLetter.length === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['authorizationLetter'],
        message:
          'Người quản lý ví khác người đại diện pháp luật — bắt buộc có giấy ủy quyền'
      })
    }
  })

export type BusinessWalletFormValues = z.infer<typeof businessWalletFormSchema>

export const EMPTY_BUSINESS_WALLET_FORM: BusinessWalletFormValues = {
  email: '',
  businessName: '',
  businessType: 'ENTERPRISE',
  taxCode: '',
  headOfficeAddress: '',
  legalRepName: '',
  legalRepIdNumber: '',
  managerName: '',
  managerPosition: '',
  managerIdNumber: '',
  managerIdExpiry: '',
  businessLicense: [],
  authorizationLetter: [],
  idCardFront: [],
  idCardBack: [],
  isInternalWallet: false
}

export const KYB_REJECT_REASON_MAX_LENGTH = 500

export const kybRejectSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'Lý do từ chối là bắt buộc')
    .max(
      KYB_REJECT_REASON_MAX_LENGTH,
      `Lý do từ chối tối đa ${KYB_REJECT_REASON_MAX_LENGTH} ký tự`
    )
})

export type KybRejectValues = z.infer<typeof kybRejectSchema>
