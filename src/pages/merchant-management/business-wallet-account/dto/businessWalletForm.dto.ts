import { getLiveMerchantDocumentUrl } from '@services/merchantDocumentUrl'
import type {
  EnterpriseWalletDocument,
  EnterpriseWalletDto
} from '@services/merchantEnterpriseWalletApi'

import {
  EMPTY_BUSINESS_WALLET_FORM,
  type BusinessWalletFormValues
} from '../schemas/business-wallet.schema'

const storedFile = (file?: EnterpriseWalletDocument) =>
  file?.id
    ? [
        {
          uid: file.id,
          name: file.filename || 'Tệp đã tải lên',
          type: file.contentType,
          size: file.sizeBytes,
          status: 'done' as const,
          url: getLiveMerchantDocumentUrl(file) ?? undefined
        }
      ]
    : []

export const detailToForm = (
  wallet: EnterpriseWalletDto
): BusinessWalletFormValues => ({
  ...EMPTY_BUSINESS_WALLET_FORM,
  email: wallet.registeredEmail || '',
  businessName: wallet.legalName || '',
  taxCode: wallet.taxCode || '',
  businessType: wallet.businessType || 'ENTERPRISE',
  headOfficeAddress: wallet.headOfficeAddress || '',
  legalRepName: wallet.legalRepresentativeName || '',
  legalRepIdNumber: wallet.legalRepresentativeIdNumber || '',
  managerName: wallet.managerName || '',
  managerPosition: wallet.managerTitle || '',
  managerIdNumber: wallet.managerIdNumber || '',
  managerIdExpiry: wallet.managerIdExpiryDate || '',
  businessLicense: storedFile(wallet.businessLicense),
  authorizationLetter: storedFile(wallet.authorizationLetter),
  idCardFront: storedFile(wallet.idCardFront),
  idCardBack: storedFile(wallet.idCardBack),
  isInternalWallet: wallet.internalWallet || false
})
