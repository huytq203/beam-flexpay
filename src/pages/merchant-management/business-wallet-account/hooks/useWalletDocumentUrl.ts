import { useCallback } from 'react'
import type { UploadFile } from 'antd'

import { getLiveMerchantDocumentUrl } from '@services/merchantDocumentUrl'
import {
  useLazyGetEnterpriseWalletDocumentUrlQuery,
  type EnterpriseWalletDto
} from '@services/merchantEnterpriseWalletApi'

const findFile = (wallet: EnterpriseWalletDto, uid: string) =>
  [
    wallet.businessLicense,
    wallet.idCardFront,
    wallet.idCardBack,
    wallet.authorizationLetter
  ].find((item) => item?.id === uid)

/** Cấp lại URL đọc giấy tờ: dùng URL còn hạn, không thì làm mới detail rồi hỏi BE. */
export function useWalletDocumentUrl(
  id: string | undefined,
  detailData: EnterpriseWalletDto | undefined,
  refetchDetail: () => { unwrap: () => Promise<EnterpriseWalletDto> }
) {
  const [getDocumentUrl] = useLazyGetEnterpriseWalletDocumentUrlQuery()

  return useCallback(
    async (file: UploadFile) => {
      if (!id) throw new Error('Enterprise wallet is not saved')
      const currentFile = detailData
        ? findFile(detailData, file.uid)
        : undefined
      const currentUrl = getLiveMerchantDocumentUrl(currentFile)
      if (currentUrl) return currentUrl
      const refreshed = currentFile?.url
        ? await refetchDetail()
            .unwrap()
            .catch(() => null)
        : null
      const refreshedUrl = refreshed
        ? getLiveMerchantDocumentUrl(findFile(refreshed, file.uid))
        : null
      if (refreshedUrl) return refreshedUrl
      const result = await getDocumentUrl(
        { walletId: id, documentId: file.uid },
        false
      ).unwrap()
      return result.url
    },
    [detailData, getDocumentUrl, id, refetchDetail]
  )
}
