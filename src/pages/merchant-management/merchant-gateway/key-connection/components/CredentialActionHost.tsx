import type { CredentialSecret } from '@/app/services/merchantGatewayApi'
import type { CredentialAction } from '../types/credential.types'
import { CredentialActionDialog } from './CredentialActionDialog'
import { CredentialConfigDialog } from './CredentialConfigDialog'
import { IpWhitelistDialog } from './IpWhitelistDialog'

interface CredentialActionHostProps {
  action: CredentialAction | null
  onClose: () => void
  onSecret: (secret: CredentialSecret) => void
}

/** Mở đúng hộp thoại thay đổi (đều cần OTP riêng của bộ khóa). */
export function CredentialActionHost({
  action,
  onClose,
  onSecret
}: CredentialActionHostProps) {
  if (!action) return null
  const { type, credential } = action
  if (type === 'ip')
    return (
      <IpWhitelistDialog
        credential={credential}
        onClose={onClose}
      />
    )
  if (type === 'status' || type === 'convert')
    return (
      <CredentialConfigDialog
        kind={type}
        credential={credential}
        onClose={onClose}
        onSecret={onSecret}
      />
    )
  return (
    <CredentialActionDialog
      type={type}
      credential={credential}
      onClose={onClose}
      onRotated={onSecret}
    />
  )
}
