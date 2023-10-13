import {
  BookTwoTone,
  DatabaseTwoTone,
  PieChartTwoTone,
  PoundCircleTwoTone,
  PushpinTwoTone,
  SaveTwoTone,
  SettingTwoTone,
  WalletTwoTone
} from '@ant-design/icons'
import {
  _BANK,
  _BANKANDCONNECT,
  _CUSTOMERS,
  _CUSTOMERTRANSACTION,
  _FEEMANAGEMENT,
  _INTERNAL,
  _INTERNAL_WALLET,
  _PERSONALWALLET,
  _PRODUCTS,
  _REPAYMENTANDDISBURSE,
  _REPORTS,
  _ROLEMANAGEMENT
} from '@constants/routersConstant'
import i18n from '@languages/i18n'
import { ItemType } from 'antd/es/menu/hooks/useItems'

export type ItemTypeCustom = ItemType & {
  link?: string
  permission?: string
  children?: ItemTypeCustom[]
}

const COlOR = '#653780'

const roleManagement = {
  key: _ROLEMANAGEMENT,
  icon: <SaveTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.account'),
  children: [
    {
      key: 'admin-account',
      permission: 'admin',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.admin-and-permission-management')
    },
    {
      key: 'manage-group-permissions',
      permission: 'group',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.manage-group-permissions')
    }
  ]
}

const personalWallet = {
  key: _PERSONALWALLET,
  icon: <WalletTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.accounts'),
  children: [
    {
      key: 'customers-group',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.customer-group-manage'),
      permission: 'customer_group'
    },
    {
      key: _CUSTOMERS,
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.accounts'),
      permission: 'customer',
      children: [
        {
          key: 'list',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.accountList')
        },
        {
          key: 'lookup',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.look-up')
        },
        {
          key: 'cancel',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.cancel-account')
        },
        {
          key: 'ekyc',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.ekyc')
        },
        {
          key: 'freeze-account',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.freeze-account')
        },
        {
          key: 'un-freeze-account',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.un-freeze-account')
        }
      ]
    },
    {
      key: _CUSTOMERTRANSACTION,
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.transfer'),
      permission: 'customer_transaction',
      children: [
        {
          key: 'transfer-history',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.transfer-history')
        },
      ]
    }
  ]
}

const feeManagement = {
  key: _FEEMANAGEMENT,
  icon: <BookTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.policy-management'),
  children: [
    {
      key: 'direct-deposit',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.policy-payment-management'),
      permission: 'direct_deposit'
    },
    {
      key: 'e-wallet-transfer-money',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.e-wallet-transfer'),
      permission: 'wallet_transfer'
    },
    {
      key: 'payment',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.omipay-payment'),
      permission: 'wallet_payment'
    },
    {
      key: 'account-bank-payment',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.account-bank-payment'),
      permission: 'bank_payment'
    },
    {
      key: 'withdraw-money',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.withdraw-money'),
      permission: 'withdraw_money'
    },
    {
      key: 'limit-regulations',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.limit-regulations'),
      permission: 'transaction_limit'
    },
    {
      key: 'form-setting',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.form-setting'),
      permission: 'transaction_limit'
    }
  ]
}

const bankAndConnect = {
  key: _BANKANDCONNECT,
  icon: <SettingTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.bank-management'),
  children: [
    {
      key: 'banks',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.bank'),
      permission: 'bank_management'
    },
    // dont have permission
    {
      key: 'notification-management',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.notification-management'),
      permission: 'connect_management'
    }
  ]
}

const repaymentAndDisburse = {
  key: _REPAYMENTANDDISBURSE,
  icon: <PoundCircleTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.partner'),
  children: [
    {
      key: 'dashboard',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.partner-transaction'),
      permission: 'payment_transaction'
    },
    {
      key: 'sms-metrics',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.sms-metrics'),
      permission: 'sms_stat'
    },
    {
      key: 'repayment',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.repayment'),
      permission: 'repayment',
      children: [
        {
          key: 'repayment-transaction',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.repayment-transaction'),
          permission: 'repayment'
        },
        {
          key: 'partner-contact',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.partner-contact'),
          permission: 'repayment'
        },
        {
          key: 'invoice-query',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.invoice-query'),
          permission: 'repayment'
        },
        {
          key: 'payment-service',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.payment-service'),
          permission: 'repayment'
        }
      ]
    },
    {
      key: 'disburse',
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.pay-on-behalf'),
      permission: 'repayment',
      children: [
        {
          key: 'disburse-transaction',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.pay-on-behalf-collection-list'),
          permission: 'repayment'
        },
        {
          key: 'disburse-partner-contact',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.disburse-partner-contact'),
          permission: 'repayment'
        },
        {
          key: 'disburse-invoice-query',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.disburse-invoice-query'),
          permission: 'repayment'
        }
      ]
    }
  ]
}

const reports = {
  key: _REPORTS,
  icon: <PieChartTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.report'),
  children: [
    {
      key: _INTERNAL,
      icon: <PushpinTwoTone twoToneColor={COlOR} />,
      label: i18n.t('navigation.internal-report'),
      permission: 'internal_report',
      children: [
        {
          key: 'accounts',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.internal-accounts-report')
        },
        {
          key: 'detail-account',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('navigation.internal-account-report')
        }
      ]
    }
  ]
}

const internal_wallet = {
  key: _INTERNAL_WALLET,
  icon: <PieChartTwoTone twoToneColor={COlOR} />,
  label: i18n.t('navigation.internal-wallet'),
  children: [
   
        {
          key: 'group',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('internal-wallet.group')
        },
        {
          key: 'account',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
          label: i18n.t('internal-wallet.account')
        },
        {
          key: 'setting',
          icon: <PushpinTwoTone twoToneColor={COlOR} />,
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
