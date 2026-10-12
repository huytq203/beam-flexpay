import { getDate } from '@/app/utils/helper-functions/date'
import type { EnterpriseWalletPayload } from '@services/merchantEnterpriseWalletApi'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'

export type WalletStagingIds = Pick<
  EnterpriseWalletPayload,
  | 'businessLicenseStagingId'
  | 'authorizationLetterStagingId'
  | 'idCardFrontStagingId'
  | 'idCardBackStagingId'
>

/** Chuỗi rỗng → undefined: BE kiểm định dạng từng trường nên không được gửi "". */
const optionalText = (value: string): string | undefined =>
  value.trim() || undefined

const requiredText = (value: string): string => value.trim()

export const buildWalletPayload = (
  values: BusinessWalletFormValues,
  stagingIds: WalletStagingIds,
  options: { draft: boolean }
): EnterpriseWalletPayload => {
  const text = options.draft ? optionalText : requiredText
  return {
    registeredEmail: values.email.trim(),
    legalName: text(values.businessName),
    taxCode: text(values.taxCode),
    businessType: values.businessType,
    headOfficeAddress: text(values.headOfficeAddress),
    legalRepresentativeName: text(values.legalRepName),
    legalRepresentativeIdNumber: text(values.legalRepIdNumber),
    managerName: text(values.managerName),
    managerTitle: text(values.managerPosition),
    managerIdNumber: text(values.managerIdNumber),
    managerIdExpiryDate: getDate(values.managerIdExpiry) || undefined,
    ...stagingIds,
    internalWallet: values.isInternalWallet
  }
}
