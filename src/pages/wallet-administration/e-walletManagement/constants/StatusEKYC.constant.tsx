import {
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@components/icons'

interface StatusEKYC {
  label?: string
  value?: string | null
  color?: string
  icon?: React.ReactNode
}

const statusEKYCConstant = {
  INVALID: 'INVALID',
  VERIFIED: 'VERIFIED',

}
export const StatusEKYCLabel = {
  [statusEKYCConstant.INVALID]: 'Chưa eKYC',
  [statusEKYCConstant.VERIFIED]: 'Đã eKYC',
}
export const statusEKYC: StatusEKYC[] = [
  {
    label: StatusEKYCLabel[statusEKYCConstant.VERIFIED],
    value: statusEKYCConstant.VERIFIED,
    color: 'bg-success/10 text-success',
    icon: <CheckCircleOutlined />
  },
  {
    label: StatusEKYCLabel[statusEKYCConstant.INVALID],
    value: statusEKYCConstant.INVALID,
    color: 'bg-danger/10 text-danger',
    icon: <CloseCircleOutlined />
  }
]
