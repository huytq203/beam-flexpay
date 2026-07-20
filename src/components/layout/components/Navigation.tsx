import {
  _FEEMANAGEMENT_V4,
  _ROLEMANAGEMENT_V2,
  _WALLETADMINISTRATION,
  _MERCHANT,
  _TRANSACTIONMANAGEMENT,

} from '@constants/routersConstant'
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
import { ItemType } from 'antd/es/menu/interface'

export type ItemTypeCustom = ItemType & {
  link?: string
  permission?: string | string[]
  children?: ItemTypeCustom[]
}

export const COlOR = 'rgb(43,217,208)'
const size = 20
const weight = 'regular'

const feeManagementV4 = {
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
      permission: ['FEE:FULL', 'FEE:VIEW', 'FEE:CREATE', 'FEE:UPDATE', 'FEE:DELETE', 'ADMIN:FULL'],
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
      permission: ['FEE:FULL', 'FEE:VIEW', 'FEE:CREATE', 'FEE:UPDATE', 'FEE:DELETE', 'ADMIN:FULL'],
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

const roleManagementV2 = {
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
      permission: ['ROLE:FULL', 'ROLE:VIEW', 'ROLE:CREATE', 'ROLE:UPDATE', 'ROLE:DELETE', 'ADMIN:FULL'],
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
      permission: ['ROLE:FULL', 'ROLE:VIEW', 'ROLE:CREATE', 'ROLE:UPDATE', 'ROLE:DELETE', 'ADMIN:FULL'],
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
      permission: ['ROLE:FULL', 'ROLE:VIEW', 'ROLE:CREATE', 'ROLE:UPDATE', 'ROLE:DELETE', 'ADMIN:FULL'],
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

const walletManagement = {
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
      permission: ['WALLET:FULL', 'WALLET:VIEW', 'WALLET:CREATE', 'WALLET:UPDATE', 'WALLET:DELETE', 'ADMIN:FULL'],
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
      permission: ['WALLET:FULL', 'WALLET:VIEW', 'WALLET:CREATE', 'WALLET:UPDATE', 'WALLET:DELETE', 'ADMIN:FULL'],
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


const transactionManagement = {
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
      permission: ['WALLET:FULL', 'WALLET:VIEW', 'WALLET:CREATE', 'WALLET:UPDATE', 'WALLET:DELETE', 'ADMIN:FULL'],
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
      permission: ['TRANSACTION:FULL', 'TRANSACTION:VIEW', 'TRANSACTION:CREATE', 'TRANSACTION:UPDATE', 'TRANSACTION:DELETE', 'ADMIN:FULL'],
      icon: (
        <LockIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Giao dịch đóng băng'
    },
    // {
    //   key: 'refund-management',
    //   permission: ['TRANSACTION:FULL', 'TRANSACTION:VIEW', 'TRANSACTION:CREATE', 'TRANSACTION:UPDATE', 'TRANSACTION:DELETE', 'ADMIN:FULL'],
    //   icon: (
    //     <ClockCounterClockwiseIcon
    //       size={size}
    //       weight={weight}
    //       color={COlOR}
    //     />
    //   ),
    //   label: 'Quản lý hoàn tiền'
    // },
    {
      key: 'system-ledger',
      permission: ['TRANSACTION:FULL', 'TRANSACTION:VIEW', 'TRANSACTION:CREATE', 'TRANSACTION:UPDATE', 'TRANSACTION:DELETE', 'ADMIN:FULL'],
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
      permission: ['TRANSACTION:FULL', 'TRANSACTION:VIEW', 'TRANSACTION:CREATE', 'TRANSACTION:UPDATE', 'TRANSACTION:DELETE', 'ADMIN:FULL'],
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

const merchantManagement = {
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
      permission: ['MERCHANT:FULL', 'MERCHANT:VIEW', 'MERCHANT:CREATE', 'MERCHANT:UPDATE', 'MERCHANT:DELETE', 'ADMIN:FULL'],
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
      permission: ['MERCHANT:FULL', 'MERCHANT:VIEW', 'MERCHANT:CREATE', 'MERCHANT:UPDATE', 'MERCHANT:DELETE', 'ADMIN:FULL'],
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
      permission: ['MERCHANT:FULL', 'MERCHANT:VIEW', 'MERCHANT:CREATE', 'MERCHANT:UPDATE', 'MERCHANT:DELETE', 'ADMIN:FULL'],
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
