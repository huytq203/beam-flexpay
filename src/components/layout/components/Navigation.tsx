import { DollarOutlined } from '@ant-design/icons'
import {
  _BANKANDCONNECT,
  _CUSTOMERS,
  _CUSTOMERTRANSACTION,
  _FEEMANAGEMENT,
  _FEEMANAGEMENT_V2,
  _INTERNAL,
  _INTERNAL_WALLET,
  _PERSONALWALLET,
  _REPAYMENTANDDISBURSE,
  _REPORTS,
  _ROLEMANAGEMENT,
  _STATE_BANK,
  _FEEMANAGEMENR_V3

} from '@constants/routersConstant'
import i18n from '@languages/i18n'
import {
  ArrowCircleDownIcon,
  ArrowsDownUpIcon,
  ArrowsLeftRightIcon,
  BankIcon,
  BellIcon,
  CardholderIcon,
  ChartBarIcon,
  ClipboardTextIcon,
  ClockCounterClockwiseIcon,
  CreditCardIcon,
  CurrencyCircleDollar,
  CurrencyCircleDollarIcon,
  CurrencyDollarIcon,
  EnvelopeSimpleIcon,
  FileLockIcon,
  FileTextIcon,
  FingerprintIcon,
  FolderOpenIcon,
  GearIcon,
  GearSixIcon,
  HandArrowDownIcon,
  HandCoinsIcon,
  HandshakeIcon,
  InvoiceIcon,
  ListIcon,
  ListNumbersIcon,
  LockIcon,
  LockKeyOpenIcon,
  LockOpenIcon,
  MagnifyingGlassIcon,
  MoneyIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SlidersIcon,
  StampIcon,
  StorefrontIcon,
  SwapIcon,
  TrashIcon,
  UserGearIcon,
  UsersFourIcon,
  UsersIcon,
  UsersThreeIcon,
  WalletIcon
} from '@phosphor-icons/react'
import { ArrowCircleUpIcon } from '@phosphor-icons/react/dist/ssr'
import { ItemType } from 'antd/es/menu/interface'

export type ItemTypeCustom = ItemType & {
  link?: string
  permission?: string
  children?: ItemTypeCustom[]
}

export const COlOR = 'rgb(43,217,208)'
const size = 20
const weight = 'regular'
const roleManagement = {
  key: _ROLEMANAGEMENT,
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
      key: 'admin-account',
      permission: 'admin',
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
      key: 'manage-group-permissions',
      permission: 'group',
      icon: (
        <ShieldCheckIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.manage-group-permissions')
    }
  ]
}

const personalWallet = {
  key: _PERSONALWALLET,
  icon: (
    <WalletIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.accounts'),
  children: [
    {
      key: 'customers-group',
      icon: (
        <UsersFourIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.customer-group-manage'),
      permission: 'customer_group'
    },
    {
      key: _CUSTOMERS,
      icon: (
        <CardholderIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.accounts'),
      permission: 'customer',
      children: [
        {
          key: 'list',
          icon: (
            <ListIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.accountList')
        },
        {
          key: 'lookup',
          icon: (
            <MagnifyingGlassIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.look-up')
        },
        {
          key: 'cancel',
          icon: (
            <TrashIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.cancel-account')
        },
        {
          key: 'ekyc',
          icon: (
            <FingerprintIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.ekyc')
        },
        {
          key: 'freeze-account',
          icon: (
            <LockIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.freeze-account')
        },
        {
          key: 'un-freeze-account',
          icon: (
            <LockOpenIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.un-freeze-account')
        }
      ]
    },
    {
      key: _CUSTOMERTRANSACTION,
      icon: (
        <ArrowsLeftRightIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.transfer'),
      permission: 'customer_transaction',
      children: [
        {
          key: 'transfer-history',
          icon: (
            <ClockCounterClockwiseIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.transfer-history')
        }
      ]
    }
  ]
}

const feeManagement = {
  key: _FEEMANAGEMENT,
  icon: (
    <GearIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.policy-management'),
  children: [
    {
      key: 'policy-management',
      icon: (
        <CurrencyDollarIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.policy-management'),
      permission: 'policy_management'
    },
    {
      key: 'direct-deposit',
      icon: (
        <ArrowCircleDownIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.policy-payment-management'),
      permission: 'direct_deposit'
    },
    {
      key: 'e-wallet-transfer-money',
      icon: (
        <ArrowsDownUpIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.e-wallet-transfer'),
      permission: 'wallet_transfer'
    },
    {
      key: 'payment',
      icon: (
        <WalletIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.omipay-payment'),
      permission: 'wallet_payment'
    },
    {
      key: 'account-bank-payment',
      icon: (
        <CreditCardIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.account-bank-payment'),
      permission: 'bank_payment'
    },
    {
      key: 'withdraw-money',
      icon: (
        <ArrowCircleUpIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.withdraw-money'),
      permission: 'withdraw_money'
    },
    {
      key: 'limit-regulations',
      icon: (
        <ListNumbersIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.limit-regulations'),
      permission: 'transaction_limit'
    },
    {
      key: 'form-setting',
      icon: (
        <SlidersHorizontalIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.form-setting'),
      permission: 'transaction_limit'
    }
  ]
}

const feeManagementV2 = {
  key: _FEEMANAGEMENT_V2,
  icon: (
    <GearIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.policy-management-v2'),
  children: [
    {
      key: 'outbound-fee-management',
      icon: (
        <CurrencyDollarIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.outbound-fee-management'),
      permission: 'policy_management'
    },
    {
      key: 'inbound-fee-management',
      icon: (
        <ArrowCircleDownIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.inbound-fee-management'),
      permission: 'policy_management'
    },
    {
      key: 'vat-fee-management',
      icon: (
        <CurrencyCircleDollarIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: 'Quản lý phí VAT',
      permission: 'policy_management'
    },
  ]
}

const bankAndConnect = {
  key: _BANKANDCONNECT,
  icon: (
    <BankIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.bank-management'),
  children: [
    {
      key: 'banks',
      icon: (
        <BankIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.bank'),
      permission: 'bank_management'
    },
    // dont have permission
    {
      key: 'notification-management',
      icon: (
        <BellIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.notification-management'),
      permission: 'connect_management'
    }
  ]
}

const repaymentAndDisburse = {
  key: _REPAYMENTANDDISBURSE,
  icon: (
    <UsersIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.partner'),
  children: [
    {
      key: 'dashboard',
      icon: (
        <SwapIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.partner-transaction'),
      permission: 'payment_transaction'
    },
    {
      key: 'sms-metrics',
      icon: (
        <EnvelopeSimpleIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.sms-metrics'),
      permission: 'sms_stat'
    },
    {
      key: 'repayment',
      icon: (
        <HandArrowDownIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.repayment'),
      permission: 'repayment',
      children: [
        {
          key: 'repayment-transaction',
          icon: (
            <ArrowsLeftRightIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.repayment-transaction'),
          permission: 'repayment'
        },
        {
          key: 'partner-contact',
          icon: (
            <HandshakeIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.partner-contact'),
          permission: 'repayment'
        },
        {
          key: 'invoice-query',
          icon: (
            <InvoiceIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.invoice-query'),
          permission: 'repayment'
        },
        {
          key: 'payment-service',
          icon: (
            <StorefrontIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.payment-service'),
          permission: 'repayment'
        }
      ]
    },
    {
      key: 'disburse',
      icon: (
        <HandCoinsIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.pay-on-behalf'),
      permission: 'repayment',
      children: [
        {
          key: 'disburse-transaction',
          icon: (
            <CurrencyCircleDollarIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.pay-on-behalf-collection-list'),
          permission: 'repayment'
        },
        {
          key: 'disburse-partner-contact',
          icon: (
            <HandshakeIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.disburse-partner-contact'),
          permission: 'repayment'
        },
        {
          key: 'disburse-invoice-query',
          icon: (
            <ListIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.disburse-invoice-query'),
          permission: 'repayment'
        }
      ]
    }
  ]
}

const reports = {
  key: _REPORTS,
  icon: (
    <FileTextIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.report'),
  children: [
    {
      key: _INTERNAL,
      icon: (
        <FileLockIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.internal-report'),
      permission: 'internal_report',
      children: [
        {
          key: 'accounts',
          icon: (
            <FolderOpenIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.internal-accounts-report')
        },
        {
          key: 'detail-account',
          icon: (
            <FileTextIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.internal-account-report')
        }
      ]
    },
    {
      key: _STATE_BANK,
      icon: (
        <BankIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('navigation.state-bank-report'),
      permission: 'state_bank_report',
      children: [
        {
          key: 'overview',
          icon: (
            <ChartBarIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.overview-report')
        },
        {
          key: 'account-guarantee',
          icon: (
            <LockKeyOpenIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.account-management-ensure-payment')
        },
        {
          key: 'transaction-management-report',
          icon: (
            <ClipboardTextIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('navigation.transaction-management-report')
        }
      ]
    }
  ]
}

const internal_wallet = {
  key: _INTERNAL_WALLET,
  icon: (
    <WalletIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  label: i18n.t('navigation.internal-wallet'),
  permission: 'internalwallet',
  children: [
    {
      key: 'group',
      icon: (
        <UsersIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('internal-wallet.group'),
      permission: 'internalwalletgroup'
    },
    {
      key: 'account',
      icon: (
        <CreditCardIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('internal-wallet.account'),
      children: [
        {
          key: 'details',
          icon: (
            <GearIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('internal-wallet.account-details')
        },
        {
          key: 'transactions',
          icon: (
            <MoneyIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('internal-wallet.account-transactions')
        }
      ]
    },
    {
      key: 'setting',
      icon: (
        <SlidersIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('internal-wallet.setting')
    },
    {
      key: 'internal-accounting',
      icon: (
        <GearSixIcon
          size={size}
          weight={weight}
          color={COlOR}
        />
      ),
      label: i18n.t('internal-wallet.internal-accounting'),
      children: [
        {
          key: 'deposit-request',
          icon: (
            <CurrencyDollarIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('internal-wallet.deposit-request')
        },
        {
          key: 'deposit-approval',
          icon: (
            <StampIcon
              size={size}
              weight={weight}
              color={COlOR}
            />
          ),
          label: i18n.t('internal-wallet.deposit-approval')
        }
      ]
    }
  ]
}

const feeManagementV3 = {
  key: _FEEMANAGEMENR_V3,
  icon: (
    <GearIcon
      size={size}
      weight={weight}
      color={COlOR}
    />
  ),
  children: [
    {
      key: 'fee-management',
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
      key: 'fee-assignment',
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
export const navigationItems: ItemTypeCustom[] = [
  roleManagement,
  personalWallet,
  feeManagement,
  feeManagementV2,
  bankAndConnect,
  repaymentAndDisburse,
  reports,
  internal_wallet,
  feeManagementV3
]
