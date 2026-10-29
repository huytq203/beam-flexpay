import type { UploadFile } from '@components/form'
import {
  useGetEnterpriseWalletQuery,
  useLazyGetEnterpriseWalletQuery
} from '@services/merchantEnterpriseWalletApi'
import { resolveLiveDocumentUrl } from '@services/merchantDocumentUrl'
import type { EnterpriseWalletDto } from '@type/enterpriseWallet'
import type { AcountItem } from '@pages/wallet-administration/e-walletManagement/types/ResponseWalletAccount.type'
import { findEnterpriseDocument } from '../utils/enterprise-wallet-format'

export interface EnterpriseWalletDetailState {
  wallet?: EnterpriseWalletDto
  /** Chỉ ví ENTERPRISE mới có hồ sơ ở `/enterprise-wallets`. */
  isEnterprise: boolean
  isLoading: boolean
  isError: boolean
  refetch: () => void
  resolveFileUrl: (file: UploadFile) => Promise<string>
}

/** Hồ sơ doanh nghiệp của ví: `ownerId` của ví ENTERPRISE chính là id enterprise-wallet. */
export function useEnterpriseWalletDetail(
  account?: AcountItem
): EnterpriseWalletDetailState {
  const walletId =
    account?.ownerType === 'ENTERPRISE' ? account.ownerId : undefined
  const { currentData, isFetching, isError, refetch } =
    useGetEnterpriseWalletQuery(walletId ?? '', { skip: !walletId })
  const [getEnterpriseWallet] = useLazyGetEnterpriseWalletQuery()

  const resolveFileUrl = (file: UploadFile) =>
    resolveLiveDocumentUrl(
      findEnterpriseDocument(currentData, file.uid),
      async () => {
        if (!walletId) return undefined
        const refreshed = await getEnterpriseWallet(walletId, false)
          .unwrap()
          .catch(() => undefined)
        return findEnterpriseDocument(refreshed, file.uid)
      }
    )

  return {
    wallet: currentData,
    isEnterprise: Boolean(walletId),
    isLoading: isFetching && !currentData,
    isError,
    refetch: () => void refetch(),
    resolveFileUrl
  }
}
