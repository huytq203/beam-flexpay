export interface IUserLogin {
  email: string
  password: string
}

export interface IUserProfile {
  id: number
  email: string
  fullName: string
  status: boolean
  jwtId: string
  securityMethod: string
  accountStatus: string
  type: string
  phoneNumber: string
  avatar: string
  active?: number
  permissions: string[]
  roles: string[]
}

export interface AdminForgotPasswordRequest {
  email: string
}

export interface AdminResetTokenValidationResponse {
  valid: boolean
  maskedEmail: string
}

export interface AdminResetPasswordRequest {
  token: string
  newPassword: string
  confirmPassword: string
}

export interface OtpChallengeResponse {
  requestId: string
  maskedRecipient: string
  expiresIn: number
  canResendAfter: number
  resendRemaining: number
}

export interface AdminLoginOtpResponse extends OtpChallengeResponse {
  otpRequired: true
}

export interface AuthenticationResponse {
  accessToken: string
  expiresIn: number
  refreshToken: string
  refreshExpiresIn: number
}

export interface VerifyAdminOtpRequest {
  requestId: string
  otp: string
}

export interface ResendAdminOtpRequest {
  requestId: string
}

export interface OtpErrorBody {
  status?: string
  detail?: string
  message?: string
  retryAfter?: number
}
