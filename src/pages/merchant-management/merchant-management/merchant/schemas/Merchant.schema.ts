import { z } from 'zod'
import type { UploadFile } from '@components/form'

const MAX_CONTRACT_SIZE = 10 * 1024 * 1024
const MAX_LOGO_SIZE = 2 * 1024 * 1024
const MAX_PRODUCT_IMAGE_SIZE = 5 * 1024 * 1024

const uploadFileSchema = z.custom<UploadFile>()

const getFileSize = (file: UploadFile) =>
  file.originFileObj?.size ?? file.size ?? 0

const getFileType = (file: UploadFile) =>
  file.originFileObj?.type ?? file.type ?? ''

export const CreateMerchantSchema = z
  .object({
    walletType: z.string().min(1, 'Vui lòng chọn loại ví'),
    walletId: z.string().min(1, 'Vui lòng chọn ví điện tử'),
    signSeparateSubMerchantContract: z.boolean(),
    merchantContract: z
      .array(uploadFileSchema)
      .max(1, 'Chỉ được tải lên một tệp hợp đồng')
      .refine(
        (files) =>
          files.every((file) => getFileSize(file) <= MAX_CONTRACT_SIZE),
        'Tệp hợp đồng không được vượt quá 10MB'
      )
      .refine(
        (files) =>
          files.every((file) => getFileType(file) === 'application/pdf'),
        'Hợp đồng phải là tệp PDF'
      ),
    mcc: z.string().min(1, 'Vui lòng chọn ngành nghề kinh doanh'),
    merchantType: z.string().min(1, 'Vui lòng chọn loại ĐVCNTT'),
    merchantName: z
      .string()
      .min(1, 'Tên merchant không được để trống')
      .max(200, 'Tên merchant không được vượt quá 200 ký tự'),
    merchantLogo: z
      .array(uploadFileSchema)
      .max(1, 'Chỉ được tải lên một logo')
      .refine(
        (files) => files.every((file) => getFileSize(file) <= MAX_LOGO_SIZE),
        'Logo không được vượt quá 2MB'
      )
      .refine(
        (files) =>
          files.every((file) =>
            ['image/png', 'image/jpeg'].includes(getFileType(file))
          ),
        'Logo phải là tệp PNG hoặc JPG'
      ),
    productImages: z
      .array(uploadFileSchema)
      .refine(
        (files) =>
          files.every((file) => getFileSize(file) <= MAX_PRODUCT_IMAGE_SIZE),
        'Mỗi ảnh sản phẩm không được vượt quá 5MB'
      )
      .refine(
        (files) =>
          files.every((file) =>
            ['image/png', 'image/jpeg'].includes(getFileType(file))
          ),
        'Ảnh sản phẩm phải là tệp PNG hoặc JPG'
      ),
    website: z.string().refine((value) => {
      if (!value) return true

      try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
      } catch {
        return false
      }
    }, 'Địa chỉ website không đúng định dạng'),
    productDescription: z
      .string()
      .max(1000, 'Mô tả không được vượt quá 1000 ký tự'),
    adminPassword: z.string().optional()
  })
  .superRefine((data, context) => {
    if (
      !data.signSeparateSubMerchantContract &&
      data.merchantContract.length === 0
    ) {
      context.addIssue({
        code: 'custom',
        path: ['merchantContract'],
        message: 'Vui lòng tải lên hợp đồng ĐVCNTT cấp Master'
      })
    }
  })

export type CreateMerchantSchemaType = z.infer<typeof CreateMerchantSchema>
