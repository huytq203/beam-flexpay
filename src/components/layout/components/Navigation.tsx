import {
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
  ChartBarIcon,
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
  link?: string
  screen?: ScreenId
  children?: ItemTypeCustom[]
}

export const COlOR = 'rgb(43,217,208)'
const size = 20
const weight = 'regular'

const feeManagementV4: ItemTypeCustom = {
  key: _FEEMANAGEMENT_V4,
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
    }
  ],
  label: 'Quản lý phí',
}

const roleManagementV2: ItemTypeCustom = {
  key: _ROLEMANAGEMENT_V2,
  icon: (
    <UserGearIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.account'),
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
  icon: (
    <StorefrontIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản lý merchant ',
  children: [
    {
      key: 'dashboard-merchant',
      screen: 'MERCHANT_DASHBOARD',
      icon: (
        <ChartBarIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Tổng quan'
    },
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
      key: 'merchant-order',
      screen: 'MERCHANT_ORDER',
      icon: (
        <ClipboardTextIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý đơn hàng'
    },
  ]
}


export const navigationItems: ItemTypeCustom[] = [
  transactionManagement,
  walletManagement,
  roleManagementV2,
  merchantManagement,
  // feeManagementV3,
  feeManagementV4
]
