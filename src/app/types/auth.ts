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

export interface IChangePasswordInput {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  password: string
  otp: string
}

export interface IChangePassword {
  password: string
  newPassword: string
  otpCode: string
  trackingId: string
}
