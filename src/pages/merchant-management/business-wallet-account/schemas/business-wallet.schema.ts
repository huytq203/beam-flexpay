import { z } from 'zod'
import dayjs from 'dayjs'

import type { UploadFile } from '@components/form'

export const businessWalletSearchSchema = z.object({
  username: z.string().trim().max(100, 'Tên doanh nghiệp tối đa 100 ký tự').optional(),
  ownerId: z.string().trim().max(100, 'Mã chủ ví tối đa 100 ký tự').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'FROZEN', 'LOCKED']).optional()
})

export type BusinessWalletSearchValues = z.infer<
  typeof businessWalletSearchSchema
>

const PHONE_REGEX = /^0\d{9,10}$/
const ID_NUMBER_REGEX = /^(\d{9}|\d{12})$/
const TAX_CODE_REGEX = /^\d{10}(\d{3})?$/

const PHONE_MESSAGE = 'Số điện thoại gồm 10–11 số và bắt đầu bằng 0'
const ID_NUMBER_MESSAGE = 'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số'

const uploadFileSchema = z.custom<UploadFile>()

export const businessWalletFormSchema = z
  .object({
    email: z.email('Email đăng ký không đúng định dạng').max(255, 'Email tối đa 255 ký tự'),
    contactPhone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),
    businessName: z
      .string()
      .trim()
      .min(1, 'Vui lòng nhập tên doanh nghiệp')
      .max(255, 'Tên doanh nghiệp tối đa 255 ký tự'),
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
          dayjs(value).isValid() && dayjs(value).isAfter(dayjs(), 'day'),
        'Ngày hết hạn CCCD phải sau hôm nay'
      ),
    otpPhone: z.string().regex(PHONE_REGEX, PHONE_MESSAGE),
    businessLicense: z
      .array(uploadFileSchema)
      .min(1, 'Vui lòng tải lên Giấy phép ĐKKD'),
    authorizationLetter: z.array(uploadFileSchema),
    idCardFront: z
      .array(uploadFileSchema)
      .min(1, 'Vui lòng tải lên ảnh CCCD mặt trước'),
    idCardBack: z
      .array(uploadFileSchema)
      .min(1, 'Vui lòng tải lên ảnh CCCD mặt sau'),
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

export type BusinessWalletFormValues = z.infer<
  typeof businessWalletFormSchema
>

export const EMPTY_BUSINESS_WALLET_FORM: BusinessWalletFormValues = {
  email: '',
  contactPhone: '',
  businessName: '',
  taxCode: '',
  headOfficeAddress: '',
  legalRepName: '',
  legalRepIdNumber: '',
  managerName: '',
  managerPosition: '',
  managerIdNumber: '',
  managerIdExpiry: '',
  otpPhone: '',
  businessLicense: [],
  authorizationLetter: [],
  idCardFront: [],
  idCardBack: [],
  isInternalWallet: false
}
