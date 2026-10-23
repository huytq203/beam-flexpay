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
  ArrowCounterClockwiseIcon,
  ArrowsLeftRightIcon,
  BankIcon,
  BellIcon,
  ClockCountdownIcon,
  // CalendarStarIcon, // tạm ẩn cùng mục Tháng đặc biệt
  ClipboardTextIcon,
  CreditCardIcon,
  FingerprintIcon,
  GearIcon,
  GitBranchIcon,
  KeyIcon,
  LockIcon,
  LockKeyOpenIcon,
  MoneyIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  StorefrontIcon,
  TerminalIcon,
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
      key: 'fee-policy',
      screen: 'FEE_CONFIG',
      icon: (
        <ReceiptIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Cấu hình phí'
    },
    {
      key: 'fee-input-cost',
      screen: 'FEE_INPUT_COST',
      icon: (
        <ReceiptIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Cấu hình phí đầu vào'
    },
    {
      key: 'wallet-limit',
      screen: 'WALLET_LIMIT',
      icon: (
        <SlidersHorizontalIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Hạn mức ví'
    }
    /*
     * Tạm ẩn mục Tháng đặc biệt (giữ nguyên code, bật lại khi cần):
     * {
     *   key: 'wallet-limit-special-month',
     *   screen: 'WALLET_LIMIT_SPECIAL_MONTH',
     *   icon: <CalendarStarIcon size={size} weight={weight} color={COlOR} />,
     *   label: 'Tháng đặc biệt'
     * }
     */
    /*
     * Bốn mục cũ (Quản lý chính sách phí, Phí ngân hàng, Quản lý gán phí, Biểu
     * phí hiệu lực) đã gộp vào Cấu hình phí nên rút khỏi menu. Route vẫn còn để
     * link cũ không gãy trong lúc đối chiếu; xoá hẳn cả màn ở lần dọn sau.
     */
  ],
  label: 'Quản lý phí'
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
      label: 'Quản lý nhóm quyền'
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
      label: 'Quản lý quyền'
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
      label: 'Duyệt eKYC'
    }
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
      key: 'refund-management',
      screen: 'REFUND_MANAGEMENT',
      icon: (
        <ArrowCounterClockwiseIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý hoàn tiền'
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
    }
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
    },
    {
      key: 'key-connection',
      screen: 'MERCHANT_KEY_CONNECTION',
      icon: (
        <KeyIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Key kết nối'
    },
    {
      key: 'payment-method',
      screen: 'MERCHANT_PAYMENT_METHOD',
      icon: (
        <CreditCardIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Hình thức thanh toán'
    },
    {
      key: 'notification',
      screen: 'MERCHANT_NOTIFICATION',
      icon: (
        <BellIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Thông báo'
    },
    {
      key: 'transaction',
      screen: 'MERCHANT_TRANSACTION',
      icon: (
        <ReceiptIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Giao dịch'
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

const subMerchantManagement: ItemTypeCustom = {
  key: 'sub-merchant-management',
  groupLabel: 'Nhóm quản lý cổng ĐVCNTT',
  icon: (
    <StorefrontIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản lý sub-merchant',
  children: [
    {
      key: 'sub-merchant',
      screen: 'MERCHANT_SUB_MERCHANT',
      link: `${MERCHANT}/sub-merchant`,
      icon: (
        <GitBranchIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Danh sách sub-merchant'
    },
    {
      key: 'terminal',
      screen: 'MERCHANT_TERMINAL',
      link: `${MERCHANT}/terminal`,
      icon: (
        <TerminalIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý Terminal'
    },
    {
      key: 'settlement-config',
      screen: 'MERCHANT_SETTLEMENT_CONFIG',
      link: `${MERCHANT}/settlement-config`,
      icon: (
        <ClockCountdownIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Cấu hình quyết toán'
    },
    {
      key: 'withdrawal-limit',
      screen: 'MERCHANT_WITHDRAWAL_LIMIT',
      link: `${MERCHANT}/withdrawal-limit`,
      icon: (
        <SlidersHorizontalIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Hạn mức rút'
    }
  ]
}

const merchantUserManagement: ItemTypeCustom = {
  key: 'merchant-user-management',
  groupLabel: 'Nhóm quản lý cổng ĐVCNTT',
  icon: (
    <UsersThreeIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: 'Quản lý User Merchant',
  children: [
    {
      key: 'user',
      screen: 'MERCHANT_USER',
      link: `${MERCHANT}/user`,
      icon: (
        <UsersThreeIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Danh sách User'
    },
    {
      key: 'user-role',
      screen: 'MERCHANT_ROLE',
      link: `${MERCHANT}/user-role`,
      icon: (
        <ShieldCheckIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Nhóm quyền Merchant'
    }
  ]
}

export const navigationItems: ItemTypeCustom[] = [
  transactionManagement,
  walletManagement,
  roleManagementV2,
  businessWalletManagement,
  merchantManagement,
  subMerchantManagement,
  merchantUserManagement,
  // feeManagementV3,
  feeManagementV4
]
