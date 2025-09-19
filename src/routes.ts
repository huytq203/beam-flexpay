import { createElement } from 'react'
import { createBrowserRouter } from 'react-router-dom'

import AppLayout from '@components/layout/AppLayout'
import AuthLayout from '@components/layout/AuthLayout'
import {
  AUTHENTICATION,
  BANKANDCONNECT,
  CUSTOMERS,
  CUSTOMERTRANSACTION,
  FEEMANAGEMENT,
  FEEMANAGEMENT_V2,
  FORBIDDENERROR,
  INTERNAL,
  INTERNAL_WALLET,
  PERSONALWALLET,
  REPAYMENTANDDISBURSE,
  REPORTS,
  ROLEMANAGEMENT,
  STATE_BANK
} from '@constants/routersConstant'

import ForgotPassword from '@pages/auth/forgot-password/ForgotPassword'
import Login from '@pages/auth/login/Login'
import NotFound from '@pages/auth/not-found/NotFound'
import ResetPassword from '@pages/auth/reset-password/ResetPassword'
import VerifyToken from '@pages/auth/verify-token/VerifyToken'
import Customers from '@pages/customers/Customers'
import CustomerCancel from '@pages/customers/customer-cancel/CustomerCancel'
import CustomerGroup from '@pages/customers/customer-group/CustomerGroups'
import CustomerLookup from '@pages/customers/customer-lookup/CustomerLookup'
import ForbiddenError from '@pages/error/ForbiddenError'
import InternalAccountReport from '@pages/internal-report/internal-account-report/InternalAccountReport'
import InternalAccountsReport from '@pages/internal-report/internal-accounts-report/InternalAccountReport'
import InternalBalanceWallet from '@pages/internal-wallet/InternalBalanceWallet'
import InternalGroupWallet from '@pages/internal-wallet/InternalGroupWallet'
import InternalWalletAccount from '@pages/internal-wallet/InternalWalletAccount'
import TransactionAccountingConfiguration from '@pages/internal-wallet/TransactionAccountingConfiguration'
import Dashboard from '@pages/partner-management/dashboard/Dashboard'
import DisburseInvoiceQuery from '@pages/partner-management/disburse/DisburseInvoiceQuery'
import DisbursePartnerContact from '@pages/partner-management/disburse/DisbursePartnerContact'
import DisburseTransaction from '@pages/partner-management/disburse/DisburseTransaction'
import InvoiceQuery from '@pages/partner-management/repayment/InvoiceQuery'
import RepaymentPartnerContact from '@pages/partner-management/repayment/RepaymentPartnerContact'
import RepaymentService from '@pages/partner-management/repayment/RepaymentService'
import RepaymentTransaction from '@pages/partner-management/repayment/RepaymentTransaction'
import SmsMetrics from '@pages/partner-management/sms/SmsMetrics'
import AccountAndBankPaymentManagement from '@pages/policy-management/account-bank-payment/AccountAndBankPaymentManagement'
import EWalletMoneyTransferManagement from '@pages/policy-management/e-wallet-money-transfer/EWalletMoneyTransfer'
import LimitAndRegulation from '@pages/policy-management/limit-management/LimitAndRegulations'
import OmipayWalletPaymentPolicyManagement from '@pages/policy-management/omipay-wallet-payment-policy/OmipayWalletPaymentPolicyManagement'
import PaymentPolicyManagement from '@pages/policy-management/payment-policy/PaymentPolicyManagement'
import WithdrawManagement from '@pages/policy-management/withdraw-management/WithdrawManagement'
import RedirectRouter from '@pages/redirect-router/RedirectRouter'
import AdminManagement from '@pages/role-management/admin-management/AdminManagement'
import ManageGroupPermission from '@pages/role-management/manage-group-permission/ManageGroupPermission'
import FeeSettings from '@pages/settings/fee-settings/FeeSettings'
import NapasToken from '@pages/settings/napas-token/NapasToken'
import BankManagement from '@pages/system-management/bank-management/BankManagement'
import NotificationManagement from '@pages/system-management/notification-management/NotificationManagement'
import EkycPage from '@pages/transfer/ekyc-page/EkycPage'
import FreezeAccount from '@pages/transfer/freeze-account/FreezeAccount'
import TransferHistory from '@pages/transfer/transfer-history/TransferHistory'
import UnfreezeAccount from '@pages/transfer/unfreeze-account/UnfreezeAccount'
import VerifyAzure from '@pages/verify/sso/VerifyAzure'
import StateBankOverviewReport from '@pages/bank-report/state-bank-overview/StateBankOverviewReport'
import AccountGuaranteeReport from '@pages/bank-report/account-guarantee-report/AccountGuaranteeReport'
import TransactionManagementReport from '@pages/bank-report/transaction-management-report/TransactionManagementReport'
import DepositRequest from '@pages/internal-wallet/deposit-request/DepositRequest'
import VerifyCode from '@pages/auth/verify-code/VerifyCode'
import PolicyManagement from '@pages/policy-management/PolicyManagement'
import { OutboundFeeManagement } from '@pages/outbound-fee-management'
import { OutboundFeeCreate } from '@pages/outbound-fee-management/outboundfee-create'
import { OutboundFeeUpdate } from '@pages/outbound-fee-management/outboundfee-update'

const authentication = {
  path: AUTHENTICATION,
  element: createElement(AuthLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: AUTHENTICATION + '/login',
      element: createElement(Login)
    },
    {
      path: AUTHENTICATION + '/forgot-password',
      element: createElement(ForgotPassword)
    },
    {
      path: AUTHENTICATION + '/reset-password',
      element: createElement(ResetPassword)
    },
    {
      path: AUTHENTICATION + '/forget-password',
      element: createElement(ForgotPassword)
    },
    {
      path: AUTHENTICATION + '/verify-token',
      element: createElement(VerifyToken)
    },
    {
      path: AUTHENTICATION + '/verify',
      element: createElement(VerifyAzure)
    },
    {
      path: AUTHENTICATION + '/verify-code',
      element: createElement(VerifyCode)
    }
  ]
}

const roleManagement = {
  path: ROLEMANAGEMENT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: ROLEMANAGEMENT + '/admin-account',
      element: createElement(AdminManagement)
    },
    {
      path: ROLEMANAGEMENT + '/manage-group-permissions',
      element: createElement(ManageGroupPermission)
    }
  ]
}

const forbidden = {
  path: FORBIDDENERROR,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FORBIDDENERROR,
      element: createElement(ForbiddenError)
    }
  ]
}

const defaultRouter = {
  path: '/',
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      index: true,
      element: createElement(RedirectRouter)
    }
  ]
}

const personalWallet = {
  path: PERSONALWALLET,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    // root
    {
      path: PERSONALWALLET + '/customers-group',
      element: createElement(CustomerGroup)
    },
    // customers
    {
      path: PERSONALWALLET + CUSTOMERS + '/list',
      element: createElement(Customers)
    },
    {
      path: PERSONALWALLET + CUSTOMERS + '/lookup',
      element: createElement(CustomerLookup)
    },
    {
      path: PERSONALWALLET + CUSTOMERS + '/cancel',
      element: createElement(CustomerCancel)
    },
    {
      path: PERSONALWALLET + CUSTOMERS + '/ekyc',
      element: createElement(EkycPage)
    },
    {
      path: PERSONALWALLET + CUSTOMERS + '/freeze-account',
      element: createElement(FreezeAccount)
    },
    {
      path: PERSONALWALLET + CUSTOMERS + '/un-freeze-account',
      element: createElement(UnfreezeAccount)
    },
    // transaction
    {
      path: PERSONALWALLET + CUSTOMERTRANSACTION + '/transfer-history',
      element: createElement(TransferHistory)
    },
    {
      path: PERSONALWALLET + CUSTOMERTRANSACTION + '/napas-token',
      element: createElement(NapasToken)
    }
  ]
}

const feeManagement = {
  path: FEEMANAGEMENT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FEEMANAGEMENT + '/policy-management',
      element: createElement(PolicyManagement)
    },
    {                                                     
      path: FEEMANAGEMENT + '/direct-deposit',
      element: createElement(PaymentPolicyManagement)
      // element: createElement(DirectDeposit)
    },
    {
      path: FEEMANAGEMENT + '/payment',
      element: createElement(OmipayWalletPaymentPolicyManagement)
    },
    {
      path: FEEMANAGEMENT + '/account-bank-payment',
      element: createElement(AccountAndBankPaymentManagement)
    },
    {
      path: FEEMANAGEMENT + '/withdraw-money',
      element: createElement(WithdrawManagement)
    },
    {
      path: FEEMANAGEMENT + '/limit-regulations',
      element: createElement(LimitAndRegulation)
    },
    {
      path: FEEMANAGEMENT + '/e-wallet-transfer-money',
      element: createElement(EWalletMoneyTransferManagement)
    },
    {
      path: FEEMANAGEMENT + '/form-setting',
      element: createElement(FeeSettings)
    }
  ]
}

const feeManagementV2 = {
  path: FEEMANAGEMENT_V2,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FEEMANAGEMENT_V2 + '/outbound-fee-management',
      element: createElement(OutboundFeeManagement)
    },
    {
      path: FEEMANAGEMENT_V2 + '/outbound-fee-management/create',
      element: createElement(OutboundFeeCreate)
    },
    {
      path: FEEMANAGEMENT_V2 + '/outbound-fee-management/update/:id',
      element: createElement(OutboundFeeUpdate)
    }
  ]
}

const bankAndConnect = {
  path: BANKANDCONNECT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: BANKANDCONNECT + '/banks',
      element: createElement(BankManagement)
    },
    {
      path: BANKANDCONNECT + '/notification-management',
      element: createElement(NotificationManagement)
    }
  ]
}

const reports = {
  path: REPORTS,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: REPORTS + INTERNAL + '/accounts',
      element: createElement(InternalAccountsReport)
    },
    {
      path: REPORTS + INTERNAL + '/detail-account',
      element: createElement(InternalAccountReport)
    },
    {
      path: REPORTS + STATE_BANK + '/overview',
      element: createElement(StateBankOverviewReport)
    },
    {
      path: REPORTS + STATE_BANK + '/account-guarantee',
      element: createElement(AccountGuaranteeReport)
    },
    {
      path: REPORTS + STATE_BANK + '/transaction-management-report',
      element: createElement(TransactionManagementReport)
    }
  ]
}

const repaymentAndDisburse = {
  path: REPAYMENTANDDISBURSE,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: REPAYMENTANDDISBURSE + '/dashboard',
      element: createElement(Dashboard)
    },
    {
      path: REPAYMENTANDDISBURSE + '/sms-metrics',
      element: createElement(SmsMetrics)
    },
    {
      path: REPAYMENTANDDISBURSE + '/repayment',
      children: [
        {
          path: REPAYMENTANDDISBURSE + '/repayment/partner-contact',
          element: createElement(RepaymentPartnerContact)
        },
        {
          path: REPAYMENTANDDISBURSE + '/repayment/invoice-query',
          element: createElement(InvoiceQuery)
        },
        {
          path: REPAYMENTANDDISBURSE + '/repayment/repayment-transaction',
          element: createElement(RepaymentTransaction)
        },
        {
          path: REPAYMENTANDDISBURSE + '/repayment/payment-service',
          element: createElement(RepaymentService)
        }
      ]
    },
    {
      path: REPAYMENTANDDISBURSE + '/disburse',
      children: [
        {
          path: REPAYMENTANDDISBURSE + '/disburse/disburse-transaction',
          element: createElement(DisburseTransaction)
        },
        {
          path: REPAYMENTANDDISBURSE + '/disburse/disburse-partner-contact',
          element: createElement(DisbursePartnerContact)
        },
        {
          path: REPAYMENTANDDISBURSE + '/disburse/disburse-invoice-query',
          element: createElement(DisburseInvoiceQuery)
        }
      ]
    }
  ]
}

const internalWallet = {
  path: INTERNAL_WALLET,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: INTERNAL_WALLET + '/group',
      children: [
        {
          path: INTERNAL_WALLET + '/group',
          element: createElement(InternalGroupWallet)
        }
      ]
    },
    {
      path: INTERNAL_WALLET + '/account',
      children: [
        {
          path: INTERNAL_WALLET + '/account/details',
          element: createElement(InternalWalletAccount)
        },
        {
          path: INTERNAL_WALLET + '/account/transactions',
          element: createElement(InternalBalanceWallet)
        }
      ]
    },
    {
      path: INTERNAL_WALLET + '/setting',
      children: [
        {
          path: INTERNAL_WALLET + '/setting',
          element: createElement(TransactionAccountingConfiguration)
        }
      ]
    },
    {
      path: INTERNAL_WALLET + '/internal-accounting',
      children: [
        {
          path: INTERNAL_WALLET + '/internal-accounting/deposit-request',
          element: createElement(DepositRequest)
        },
        {
          path: INTERNAL_WALLET + '/internal-accounting/deposit-approval'
        }
      ]
    }
  ]
}

export const WalletRoutes = createBrowserRouter([
  authentication,
  defaultRouter,
  forbidden,
  roleManagement,
  personalWallet,
  feeManagement,
  feeManagementV2,
  bankAndConnect,
  reports,
  repaymentAndDisburse,
  internalWallet,
])
