import dayjs from 'dayjs'
import type { UploadFile } from 'antd'

import { apiWalletCore } from '@services/apiService'
import type { BusinessWalletFormValues } from '@pages/merchant-management/business-wallet-account/schemas/business-wallet.schema'

export interface BusinessWalletAttachments {
  businessLicense: string[]
  authorizationLetter: string[]
  idCardFront: string[]
  idCardBack: string[]
}

export interface BusinessWalletPayload {
  email: string
  contactPhone: string
  businessName: string
  taxCode: string
  headOfficeAddress: string
  legalRepName: string
  legalRepIdNumber: string
  managerName: string
  managerPosition: string
  managerIdNumber: string
  managerIdExpiry: string
  otpPhone: string
  attachments: BusinessWalletAttachments
  isInternalWallet: boolean
}

const toFileNames = (files: UploadFile[]): string[] =>
  files.map((file) => file.name)

/** TODO(BE): đổi tên tệp sang id tệp khi backend có endpoint upload. */
export const toBusinessWalletPayload = (
  values: BusinessWalletFormValues
): BusinessWalletPayload => ({
  email: values.email.trim(),
  contactPhone: values.contactPhone.trim(),
  businessName: values.businessName.trim(),
  taxCode: values.taxCode.trim(),
  headOfficeAddress: values.headOfficeAddress.trim(),
  legalRepName: values.legalRepName.trim(),
  legalRepIdNumber: values.legalRepIdNumber.trim(),
  managerName: values.managerName.trim(),
  managerPosition: values.managerPosition.trim(),
  managerIdNumber: values.managerIdNumber.trim(),
  managerIdExpiry: dayjs(values.managerIdExpiry).format('YYYY-MM-DD'),
  otpPhone: values.otpPhone.trim(),
  attachments: {
    businessLicense: toFileNames(values.businessLicense),
    authorizationLetter: toFileNames(values.authorizationLetter),
    idCardFront: toFileNames(values.idCardFront),
    idCardBack: toFileNames(values.idCardBack)
  },
  isInternalWallet: values.isInternalWallet
})

/**
 * TODO(BE): POST/PUT chưa tồn tại trên wallet-core ngày 2026-09-03.
 * Khi backend chốt contract, chỉ sửa url/body trong adapter này.
 */
const businessWalletApi = apiWalletCore.injectEndpoints({
  endpoints: (build) => ({
    postBusinessWallet: build.mutation<unknown, BusinessWalletPayload>({
      query: (body) => ({
        url: '/wallet/accounts',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Wallet']
    }),
    putBusinessWallet: build.mutation<
      unknown,
      { id: string; body: BusinessWalletPayload }
    >({
      query: ({ id, body }) => ({
        url: `/wallet/accounts/${id}`,
        method: 'PUT',
        body
      }),
      invalidatesTags: ['Wallet']
    })
  })
})

export const {
  usePostBusinessWalletMutation,
  usePutBusinessWalletMutation
} = businessWalletApi
