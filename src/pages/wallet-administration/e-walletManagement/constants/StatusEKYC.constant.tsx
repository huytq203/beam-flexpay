import * as Icon from '@components/icons'

interface StatusEKYC {
  label?: string
  value?: string
  color?: string
  icon?: React.ReactNode
}

export const statusEKYC: StatusEKYC[] = [
  {
    label: 'Đã eKYC',
    value: 'VERIFIED',
    color: 'bg-success/10 text-success',
    icon: <Icon.CheckCircleOutlined />
  },
  {
    label: 'Chưa eKYC',
    value: 'UNVERIFIED',
    color: 'bg-danger/10 text-danger',
    icon: <Icon.CloseCircleOutlined />
  }
]
