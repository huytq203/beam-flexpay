import {
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@components/icons'
import type { ReactNode } from 'react'

interface StatusEKYC {
  label: string
  value: boolean
  color: string
  icon: ReactNode
}

export const statusEKYCConstant = {
  INVALID: false,
  VERIFIED: true
} as const

export const StatusEKYCLabel = {
  true: 'Đã eKYC',
  false: 'Chưa eKYC'
} as const

export const statusEKYC: StatusEKYC[] = [
  {
    label: StatusEKYCLabel.true,
    value: statusEKYCConstant.VERIFIED,
    color: 'bg-success/10 text-success',
    icon: <CheckCircleOutlined />
  },
  {
    label: StatusEKYCLabel.false,
    value: statusEKYCConstant.INVALID,
    color: 'bg-danger/10 text-danger',
    icon: <CloseCircleOutlined />
  }
]
