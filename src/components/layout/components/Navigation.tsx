import {
  _BANKANDCONNECT,
  _CUSTOMERS,
  _CUSTOMERTRANSACTION,
  _FEEMANAGEMENT,
  _INTERNAL,
  _INTERNAL_WALLET,
  _PERSONALWALLET,
  _REPAYMENTANDDISBURSE,
  _REPORTS,
  _ROLEMANAGEMENT,
  _STATE_BANK
} from '@constants/routersConstant';
import i18n from '@languages/i18n';
//import { ArrowCircleDown, ArrowCircleUp, ArrowsDownUp, ArrowsLeftRight, Bank, Bell, Cardholder, ChartBar, ClipboardText, ClockCounterClockwise, CreditCard, CurrencyCircleDollar, EnvelopeSimple, FileLock, FileText, Fingerprint, FolderOpen, Gear, HandArrowDown, HandCoins, HandPalm, Handshake, Invoice, List, ListNumbers, Lock, LockKeyOpen, LockOpen, MagnifyingGlass, Money, ShieldCheck, Sliders, SlidersHorizontal, Storefront, Swap, Trash, UserGear, Users, UsersFour, UsersThree, Wallet } from "@phosphor-icons/react";
import { ItemType } from 'antd/es/menu/hooks/useItems';


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
  //icon: <UserGear size={size} weight={weight} color={COlOR} />,
  label: i18n.t('navigation.account'),
  children: [
    {
      key: 'admin-account',
      permission: 'admin',
      //icon: <UsersThree size={size} weight={weight} color={COlOR}/>,
      label: i18n.t('navigation.admin-and-permission-management')
    },
    {
      key: 'manage-group-permissions',
      permission: 'group',
      //icon: <ShieldCheck size={size} weight={weight} color={COlOR}/>,
      label: i18n.t('navigation.manage-group-permissions')
    }
  ]
}

const personalWallet = {
  key: _PERSONALWALLET,
  //icon: <Wallet size={size} weight={weight} color={COlOR} />,
  label: i18n.t('navigation.accounts'),
  children: [
    {
      key: 'customers-group',
      //icon: <UsersFour size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.customer-group-manage'),
      permission: 'customer_group'
    },
    {
      key: _CUSTOMERS,
      //icon: <Cardholder size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.accounts'),
      permission: 'customer',
      children: [
        {
          key: 'list',
          //icon: <List size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.accountList')
        },
        {
          key: 'lookup',
          //icon: <MagnifyingGlass size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.look-up')
        },
        {
          key: 'cancel',
          //icon: <Trash size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.cancel-account')
        },
        {
          key: 'ekyc',
          //icon: <Fingerprint size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.ekyc')
        },
        {
          key: 'freeze-account',
          //icon: <Lock size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.freeze-account')
        },
        {
          key: 'un-freeze-account',
          //icon: <LockOpen size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.un-freeze-account')
        }
      ]
    },
    {
      key: _CUSTOMERTRANSACTION,
      //icon: <ArrowsLeftRight size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.transfer'),
      permission: 'customer_transaction',
      children: [
        {
          key: 'transfer-history',
          //icon: <ClockCounterClockwise size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.transfer-history')
        },
      ]
    }
  ]
}

const feeManagement = {
  key: _FEEMANAGEMENT,
  //icon: <Gear size={size} weight={weight} color={COlOR} />,
  label: i18n.t('navigation.policy-management'),
  children: [
    {
      key: 'direct-deposit',
      //icon: <ArrowCircleDown size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.policy-payment-management'),
      permission: 'direct_deposit'
    },
    {
      key: 'e-wallet-transfer-money',
      //icon: <ArrowsDownUp size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.e-wallet-transfer'),
      permission: 'wallet_transfer'
    },
    {
      key: 'payment',
      //icon: <Wallet size={size} weight={weight} color={COlOR}/>,
      label: i18n.t('navigation.omipay-payment'),
      permission: 'wallet_payment'
    },
    {
      key: 'account-bank-payment',
      //icon: <CreditCard size={size} weight={weight} color={COlOR}/>,
      label: i18n.t('navigation.account-bank-payment'),
      permission: 'bank_payment'
    },
    {
      key: 'withdraw-money',
      //icon: <ArrowCircleUp size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.withdraw-money'),
      permission: 'withdraw_money'
    },
    {
      key: 'limit-regulations',
      //icon: <ListNumbers size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.limit-regulations'),
      permission: 'transaction_limit'
    },
    {
      key: 'form-setting',
      //icon: <SlidersHorizontal size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.form-setting'),
      permission: 'transaction_limit'
    }
  ]
}

const bankAndConnect = {
  key: _BANKANDCONNECT,
  //icon: <Bank size={size} weight={weight} color={COlOR}/>,
  label: i18n.t('navigation.bank-management'),
  children: [
    {
      key: 'banks',
      //icon: <Bank size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.bank'),
      permission: 'bank_management'
    },
    // dont have permission
    {
      key: 'notification-management',
      //icon: <Bell size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.notification-management'),
      permission: 'connect_management'
    }
  ]
}

const repaymentAndDisburse = {
  key: _REPAYMENTANDDISBURSE,
  //icon: <Users size={size} weight={weight} color={COlOR} />,
  label: i18n.t('navigation.partner'),
  children: [
    {
      key: 'dashboard',
      //icon: <Swap size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.partner-transaction'),
      permission: 'payment_transaction'
    },
    {
      key: 'sms-metrics',
      //icon: <EnvelopeSimple size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.sms-metrics'),
      permission: 'sms_stat'
    },
    {
      key: 'repayment',
      //icon: <HandArrowDown size={size} weight={weight} color={COlOR}/>,
      label: i18n.t('navigation.repayment'),
      permission: 'repayment',
      children: [
        {
          key: 'repayment-transaction',
          //icon: <ArrowsLeftRight size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.repayment-transaction'),
          permission: 'repayment'
        },
        {
          key: 'partner-contact',
          //icon: <Handshake size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.partner-contact'),
          permission: 'repayment'
        },
        {
          key: 'invoice-query',
          //icon: <Invoice size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.invoice-query'),
          permission: 'repayment'
        },
        {
          key: 'payment-service',
          //icon: <Storefront size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.payment-service'),
          permission: 'repayment'
        }
      ]
    },
    {
      key: 'disburse',
      //icon: <HandCoins size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.pay-on-behalf'),
      permission: 'repayment',
      children: [
        {
          key: 'disburse-transaction',
          //icon: <CurrencyCircleDollar size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.pay-on-behalf-collection-list'),
          permission: 'repayment'
        },
        {
          key: 'disburse-partner-contact',
          //icon: <Handshake size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.disburse-partner-contact'),
          permission: 'repayment'
        },
        {
          key: 'disburse-invoice-query',
          //icon: <List size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.disburse-invoice-query'),
          permission: 'repayment'
        }
      ]
    }
  ]
}

const reports = {
  key: _REPORTS,
  //icon: <FileText size={size} weight={weight} color={COlOR}/>,
  label: i18n.t('navigation.report'),
  children: [
    {
      key: _INTERNAL,
      //icon: <FileLock size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.internal-report'),
      permission: 'internal_report',
      children: [
        {
          key: 'accounts',
          //icon: <FolderOpen size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.internal-accounts-report')
        },
        {
          key: 'detail-account',
          //icon: <FileText size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.internal-account-report')
        }
      ]
    },
    {
      key: _STATE_BANK,
      //icon: <Bank size={size} weight={weight} color={COlOR} />,
      label: i18n.t('navigation.state-bank-report'),
      permission: 'state_bank_report',
      children: [
        {
          key: 'overview',
          //icon: <ChartBar size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.overview-report')
        },
        {
          key: 'account-guarantee',
          //icon: <LockKeyOpen size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.account-management-ensure-payment')
        },
        {
          key: 'transaction-management-report',
          //icon: <ClipboardText size={size} weight={weight} color={COlOR} />,
          label: i18n.t('navigation.transaction-management-report')
        }
      ]
    }
  ]
}

const internal_wallet = {
  key: _INTERNAL_WALLET,
  //icon: <Wallet size={size} weight={weight} color={COlOR} />,
  label: i18n.t('navigation.internal-wallet'),
  permission: 'internalwallet',
  children: [
    {
      key: 'group',
      //icon: <Users size={size} weight={weight} color={COlOR} />,
      label: i18n.t('internal-wallet.group'),
      permission: 'internalwalletgroup'
    },
    {
      key: 'account',
      //icon: <CreditCard size={size} weight={weight} color={COlOR} />,
      label: i18n.t('internal-wallet.account'),
      children: [
        {
          key: 'details',
          //icon: <Gear size={size} weight={weight} color={COlOR}/>,
          label: i18n.t('internal-wallet.account-details')
        },
        {
          key: 'transactions',
          //icon: <Money size={size} weight={weight} color={COlOR} />,
          label: i18n.t('internal-wallet.account-transactions')
        }

      ]

    },
    {
      key: 'setting',
      //icon: <Sliders size={size} weight={weight} color={COlOR} />,
      label: i18n.t('internal-wallet.setting')
    }
  ]
}

export const navigationItems: ItemTypeCustom[] = [
  roleManagement,
  personalWallet,
  feeManagement,
  bankAndConnect,
  repaymentAndDisburse,
  reports,
  internal_wallet
]