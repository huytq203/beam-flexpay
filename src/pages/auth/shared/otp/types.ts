import type { OtpChallengeResponse } from '@type/auth'

export const OtpFlowStatus = {
  INPUT: 'input',
  EXPIRED: 'expired',
  LOCKED: 'locked',
  FLOW_EXPIRED: 'flow-expired',
  MAX_RESEND: 'max-resend',
  SUCCESS: 'success'
} as const

export type OtpFlowStatus =
  (typeof OtpFlowStatus)[keyof typeof OtpFlowStatus]

export type OtpChallenge = OtpChallengeResponse

export interface OtpVerifyPayload {
  requestId: string
  otp: string
}
