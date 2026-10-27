import { useCallback, useState } from 'react'
import { message } from 'antd'
import { useNavigate } from 'react-router-dom'
import { SCREENS } from '@/app/permissions'
import {
  useLazyGetAccountByIdQuery,
  useLazyGetAccountQuery
} from '@services/apiWalletAccount.api'

export interface WalletOwnerRef {
  ownerId?: string | null
  username?: string | null
}

export const walletDetailPath = (walletId: string) =>
  `${SCREENS.EWALLET_MANAGEMENT.path}/${walletId}`

/** BE đã che sẵn SĐT (có dấu `*`) thì không thể tra ngược ra ví. */
export const canResolveWallet = (ref: WalletOwnerRef) =>
  Boolean(ref.ownerId) ||
  (Boolean(ref.username) && !ref.username?.includes('*'))

/**
 * Các màn giao dịch, hoàn tiền chỉ trả chủ ví (id hoặc SĐT) chứ không trả id ví.
 * Hook này tra ví theo chủ ví, tải sẵn chi tiết vào cache rồi mới chuyển màn.
 */
const useOpenWalletDetail = () => {
  const navigate = useNavigate()
  const [loadAccounts] = useLazyGetAccountQuery()
  const [loadAccountById] = useLazyGetAccountByIdQuery()
  const [isOpening, setIsOpening] = useState(false)

  const openByOwner = useCallback(
    async ({ ownerId, username }: WalletOwnerRef) => {
      setIsOpening(true)
      try {
        const result = await loadAccounts(
          ownerId
            ? { ownerId, size: 20 }
            : { username: username ?? '', size: 20 }
        ).unwrap()
        const wallets = result.content ?? []
        const wallet =
          wallets.find((item) => item.ownerId === ownerId) ??
          wallets.find((item) => item.ownerUsername === username) ??
          (ownerId ? wallets[0] : undefined)

        if (!wallet) {
          message.warning('Không tìm thấy ví của tài khoản này')
          return
        }
        await loadAccountById(wallet.id, false).unwrap()
        navigate(walletDetailPath(wallet.id))
      } catch {
        // Base query đã hiển thị thông báo lỗi; giữ người dùng tại màn hiện tại.
      } finally {
        setIsOpening(false)
      }
    },
    [loadAccounts, loadAccountById, navigate]
  )

  return { openByOwner, isOpening }
}

export default useOpenWalletDetail
