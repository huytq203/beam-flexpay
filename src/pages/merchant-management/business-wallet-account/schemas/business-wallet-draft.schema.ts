import { z } from 'zod'

const TAX_CODE_REGEX = /^\d{10}(\d{3})?$/
const ID_NUMBER_REGEX = /^(\d{9}|\d{12})$/

const blankOr = (regex: RegExp, message: string) =>
  z
    .string()
    .refine((value) => value.trim() === '' || regex.test(value), message)

const maxText = (max: number, message: string) =>
  z.string().trim().max(max, message)

/**
 * "Lưu nháp" chỉ bắt buộc email đăng ký (FR-MER-0501-03). Các trường khác có
 * thể để trống, nhưng nếu đã nhập thì phải đúng định dạng như khi gửi duyệt.
 */
export const businessWalletDraftSchema = z.object({
  email: z
    .email('Email đăng ký không đúng định dạng')
    .max(255, 'Email tối đa 255 ký tự'),
  businessName: maxText(255, 'Tên doanh nghiệp tối đa 255 ký tự'),
  taxCode: blankOr(TAX_CODE_REGEX, 'Mã số thuế gồm 10 hoặc 13 số'),
  headOfficeAddress: maxText(500, 'Địa chỉ trụ sở tối đa 500 ký tự'),
  legalRepName: maxText(255, 'Tên người đại diện tối đa 255 ký tự'),
  legalRepIdNumber: blankOr(
    ID_NUMBER_REGEX,
    'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số'
  ),
  managerName: maxText(255, 'Họ tên người quản lý ví tối đa 255 ký tự'),
  managerPosition: maxText(255, 'Chức vụ tối đa 255 ký tự'),
  managerIdNumber: blankOr(ID_NUMBER_REGEX, 'Số CCCD/Hộ chiếu gồm 9 hoặc 12 số')
})
