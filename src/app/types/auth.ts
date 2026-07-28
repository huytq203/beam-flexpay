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
