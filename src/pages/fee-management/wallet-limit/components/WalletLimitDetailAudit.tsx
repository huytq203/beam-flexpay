import type { WalletLimitPolicy } from '@type/walletLimit.type'
import { formatUTCToLocalDateTime } from '@utils/helper-functions/date'
import {
  WalletLimitDetailField,
  WalletLimitDetailGrid
} from './WalletLimitDetailSection'

interface WalletLimitDetailAuditProps {
  policy: WalletLimitPolicy
}

const stamp = (username: string | null, time: string | null): string => {
  const parts = [username, formatUTCToLocalDateTime(time)].filter(Boolean)
  return parts.length > 0 ? parts.join(' · ') : 'Chưa có'
}

export function WalletLimitDetailAudit({
  policy
}: WalletLimitDetailAuditProps) {
  return (
    <WalletLimitDetailGrid>
      <WalletLimitDetailField label='Tạo bởi'>
        {stamp(policy.createdByUsername, policy.createdAt)}
      </WalletLimitDetailField>
      <WalletLimitDetailField label='Cập nhật gần nhất'>
        {stamp(policy.updatedByUsername, policy.updatedAt)}
      </WalletLimitDetailField>
      <WalletLimitDetailField label='Phiên bản dữ liệu (rowVersion)'>
        {policy.rowVersion}
      </WalletLimitDetailField>
    </WalletLimitDetailGrid>
  )
}
