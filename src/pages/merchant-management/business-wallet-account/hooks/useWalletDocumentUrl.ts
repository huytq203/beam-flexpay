import { useCallback } from 'react'
import type { UploadFile } from 'antd'

import { resolveLiveDocumentUrl } from '@services/merchantDocumentUrl'
import type { EnterpriseWalletDto } from '@services/merchantEnterpriseWalletApi'

const findFile = (wallet: EnterpriseWalletDto | undefined, uid: string) =>
  wallet
    ? [
        wallet.businessLicense,
        wallet.idCardFront,
        wallet.idCardBack,
        wallet.authorizationLetter
      ].find((item) => item?.id === uid)
    : undefined

/** Cấp lại URL đọc giấy tờ: dùng URL còn hạn, không thì làm mới detail. */
export function useWalletDocumentUrl(
  id: string | undefined,
  detailData: EnterpriseWalletDto | undefined,
  refetchDetail: () => { unwrap: () => Promise<EnterpriseWalletDto> }
) {
  return useCallback(
    async (file: UploadFile) => {
      if (!id) throw new Error('Enterprise wallet is not saved')
      return resolveLiveDocumentUrl(findFile(detailData, file.uid), async () =>
        findFile(
          await refetchDetail()
            .unwrap()
            .catch(() => undefined),
          file.uid
        )
      )
    },
    [detailData, id, refetchDetail]
  )
}
