import { useUploadMerchantDocumentMutation } from '@services/apiMerchant'

import type { BusinessWalletFormValues } from '../schemas/business-wallet.schema'
import type { WalletStagingIds } from '../utils/businessWalletPayload'

type DocumentType =
  | 'BUSINESS_LICENSE'
  | 'ID_CARD_FRONT'
  | 'ID_CARD_BACK'
  | 'AUTHORIZATION_LETTER'

/** Chỉ file mới chọn (có originFileObj) mới được tải lên; file cũ giữ nguyên. */
export function useWalletDocumentUpload() {
  const [uploadDocument, { isLoading }] = useUploadMerchantDocumentMutation()

  const upload = async (
    file: BusinessWalletFormValues['businessLicense'][number] | undefined,
    documentType: DocumentType
  ): Promise<string | undefined> => {
    if (!file?.originFileObj) return undefined
    const result = await uploadDocument({
      file: file.originFileObj,
      documentType
    }).unwrap()
    return result.stagingId
  }

  const uploadAll = async (
    values: BusinessWalletFormValues
  ): Promise<WalletStagingIds> => ({
    businessLicenseStagingId: await upload(
      values.businessLicense[0],
      'BUSINESS_LICENSE'
    ),
    authorizationLetterStagingId: await upload(
      values.authorizationLetter[0],
      'AUTHORIZATION_LETTER'
    ),
    idCardFrontStagingId: await upload(values.idCardFront[0], 'ID_CARD_FRONT'),
    idCardBackStagingId: await upload(values.idCardBack[0], 'ID_CARD_BACK')
  })

  return { uploadAll, isUploading: isLoading }
}
