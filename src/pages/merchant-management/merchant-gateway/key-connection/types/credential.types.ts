import type { ApiCredential } from '@/app/services/merchantGatewayApi'

export type CredentialActionType =
  | 'rotate'
  | 'revoke'
  | 'ip'
  | 'status'
  | 'convert'

export interface CredentialAction {
  type: CredentialActionType
  credential: ApiCredential
}
