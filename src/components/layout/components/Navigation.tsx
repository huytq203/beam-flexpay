import {
  MERCHANT,
  _FEEMANAGEMENT_V4,
  _MERCHANT,
  _ROLEMANAGEMENT_V2,
  _TRANSACTIONMANAGEMENT,
  _WALLETADMINISTRATION
} from '@constants/routersConstant'
import type { ScreenId } from '@/app/permissions'
import type { Key, ReactNode } from 'react'
import i18n from '@languages/i18n'
import {
  ArrowsLeftRightIcon,
  BankIcon,
  ScalesIcon,
  ClipboardTextIcon,
  CurrencyCircleDollarIcon,
  FingerprintIcon,
  GearIcon,
  LockIcon,
  LockKeyOpenIcon,
  MoneyIcon,
  ShieldCheckIcon,
  StorefrontIcon,
  UserGearIcon,
  UsersThreeIcon,
  WalletIcon
} from '@phosphor-icons/react'
export interface ItemTypeCustom {
  key: Key
  icon?: ReactNode
  label?: ReactNode
  groupLabel?: ReactNode
  link?: string
  screen?: ScreenId
  children?: ItemTypeCustom[]
}

/** Đường dẫn thật của item con trên sidebar: ưu tiên `link`, mặc định ghép theo key. */
export const resolveNavLink = (
  parent: ItemTypeCustom,
  child: ItemTypeCustom
): string => child.link ?? `/${String(parent.key)}/${String(child.key)}`

export const COlOR = 'rgb(43,217,208)'
const size = 20
const weight = 'regular'

const feeManagementV4: ItemTypeCustom = {
  key: _FEEMANAGEMENT_V4,
  groupLabel: 'Nhóm quản lý giao dịch',
  icon: (
    <GearIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  children: [
    {
      key: 'fee-managementV4',
      screen: 'FEE_POLICY',
      icon: (
        <WalletIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý chính sách phí',
    },
    {
      key: 'fee-bankV4',
      screen: 'FEE_BANK_POLICY',
      icon: (
        <BankIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Phí ngân hàng',
    },
    {
      key: 'fee-assignmentV4',
      screen: 'FEE_ASSIGNMENT',
      icon: (
        <CurrencyCircleDollarIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý gán phí',
    },
    {
      key: 'fee-scheduleV4',
      screen: 'FEE_SCHEDULE',
      icon: (
        <ScalesIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Biểu phí hiệu lực',
    }
  ],
  label: 'Quản lý phí',
}

const roleManagementV2: ItemTypeCustom = {
  key: _ROLEMANAGEMENT_V2,
  groupLabel: 'Nhóm tài khoản và phân quyền',
  icon: (
    <UserGearIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản lý tài khoản',
  children: [
    {
      key: 'user-account',
      screen: 'USER_ACCOUNT',
      icon: (
        <UsersThreeIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.admin-and-permission-management')
    },
    {
      key: 'permission-management',
      screen: 'ROLE_MANAGEMENT',
      icon: (
        <ShieldCheckIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: "Quản lý nhóm quyền"
    },
    {
      key: 'role-management',
      screen: 'PERMISSION_MANAGEMENT',
      icon: (
        <LockKeyOpenIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: "Quản lý quyền"
    }
  ]

}

const walletManagement: ItemTypeCustom = {
  key: _WALLETADMINISTRATION,
  groupLabel: 'Nhóm quản lý giao dịch',
  icon: (
    <WalletIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản trị ví cá nhân ',
  children: [
    {
      key: 'e-walletManagement',
      screen: 'EWALLET_MANAGEMENT',
      icon: (
        <WalletIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý ví điện tử'
    },
    {
      key: 'confirm-eKYC',
      screen: 'CONFIRM_EKYC',
      icon: (
        <FingerprintIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: "Duyệt eKYC"
    },
  ]

}


const transactionManagement: ItemTypeCustom = {
  key: _TRANSACTIONMANAGEMENT,
  groupLabel: 'Nhóm quản lý giao dịch',
  icon: (
    <ArrowsLeftRightIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản lý giao dịch',
  children: [
    {
      key: 'transaction-wallet',
      screen: 'TRANSACTION_WALLET',
      icon: (
        <ArrowsLeftRightIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý giao dịch'
    },
    {
      key: 'frozen-transactions',
      screen: 'FROZEN_TRANSACTIONS',
      icon: (
        <LockIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Giao dịch đóng băng'
    },
    {
      key: 'system-ledger',
      screen: 'SYSTEM_LEDGER',
      icon: (
        <ClipboardTextIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Sổ cái hệ thống'
    },
    {
      key: 'withdraw-history',
      screen: 'WITHDRAW_HISTORY',
      icon: (
        <MoneyIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Lịch sử rút tiền'
    },
  ]
}

const merchantManagement: ItemTypeCustom = {
  key: _MERCHANT,
  groupLabel: 'Nhóm quản lý cổng ĐVCNTT',
  icon: (
    <StorefrontIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản lý ĐVCNTT',
  children: [
    
    {
      key: 'merchant-management',
      screen: 'MERCHANT_MANAGEMENT',
      icon: (
        <StorefrontIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý danh sách merchant'
    },
    {
      key: 'bank-account',
      screen: 'MERCHANT_BANK_ACCOUNT',
      link: `${MERCHANT}/bank-account`,
      icon: (
        <BankIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Tài khoản ngân hàng'
    }
  ]
}

const businessWalletManagement: ItemTypeCustom = {
  key: 'business-wallet',
  groupLabel: 'Nhóm quản lý cổng ĐVCNTT',
  icon: (
    <WalletIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Ví doanh nghiệp',
  children: [
    {
      key: 'business-wallet-account',
      screen: 'BUSINESS_WALLET_ACCOUNT',
      link: `${MERCHANT}/business-wallet-account`,
      icon: (
        <StorefrontIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý ví doanh nghiệp'
    }
  ]
}


export const navigationItems: ItemTypeCustom[] = [
  transactionManagement,
  walletManagement,
  roleManagementV2,
  businessWalletManagement,
  merchantManagement,
  // feeManagementV3,
  feeManagementV4
]
