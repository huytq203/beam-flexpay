import { createElement, lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'

import AppLayout from '@components/layout/AppLayout'
import AuthLayout from '@components/layout/AuthLayout'
import ScreenLoading from '@components/screen-loading/ScreenLoading'
import {
  AUTHENTICATION,
  SECURE_PANEL,
  FORBIDDENERROR,
  ROLEMANAGEMENT_V2,
  WALLETADMINISTRATION,
  MERCHANT,
  TRANSACTIONMANAGEMENT,
  FEEMANAGEMENT_V4
} from '@constants/routersConstant'

import RouteErrorBoundary from '@components/error/RouteErrorBoundary'
import NotFound from '@pages/auth/not-found/NotFound'
import { SCREENS } from '@/app/permissions'

/**
 * Bọc một trang được tải động vào Suspense.
 * Mỗi lời gọi tạo ra một chunk riêng, nên bundle ban đầu chỉ còn
 * layout + shell thay vì toàn bộ ứng dụng.
 */
const page = (factory: () => Promise<{ default: ComponentType }>) => {
  const Lazy = lazy(factory)
  return createElement(
    Suspense,
    {
      fallback: createElement(ScreenLoading)
    },
    createElement(Lazy)
  )
}

/** Với trang export theo tên thay vì export default. */
const namedPage = <T extends string>(
  factory: () => Promise<Record<T, ComponentType>>,
  name: T
) => page(() => factory().then((m) => ({ default: m[name] })))

const authentication = {
  path: AUTHENTICATION,
  element: createElement(AuthLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: AUTHENTICATION + '/login',
      element: page(() => import('@pages/auth/login/Login'))
    },
    {
      path: AUTHENTICATION + '/forgot-password',
      element: page(() => import('@pages/auth/forgot-password/ForgotPassword'))
    },
    {
      path: AUTHENTICATION + '/reset-password',
      element: page(() => import('@pages/auth/reset-password/ResetPassword'))
    },
    {
      path: AUTHENTICATION + '/forget-password',
      element: page(() => import('@pages/auth/forgot-password/ForgotPassword'))
    },
    {
      path: AUTHENTICATION + '/verify-token',
      element: page(() => import('@pages/auth/verify-token/VerifyToken'))
    }
  ]
}

const forbidden = {
  path: FORBIDDENERROR,
  element: createElement(AppLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: FORBIDDENERROR,
      element: page(() => import('@pages/error/ForbiddenError'))
    }
  ]
}

/** Điểm vào chung: chuyển hướng theo quyền, không dựng UI riêng. */
const workspaceHome = {
  path: SECURE_PANEL,
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      index: true,
      element: page(() => import('@pages/landing/LandingRedirect'))
    }
  ]
}

const feeManagementV4 = {
  path: FEEMANAGEMENT_V4,
  element: createElement(AppLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: SCREENS.FEE_CONFIG.path,
          element: page(
            () =>
              import('@pages/fee-management/fee-policy-list/FeePolicyList')
          )
        },
        {
          path: `${SCREENS.FEE_CONFIG.path}/create`,
          element: page(
            () => import('@pages/fee-management/fee-config/FeeConfig')
          )
        },
        {
          path: `${SCREENS.FEE_CONFIG.path}/edit/:id`,
          element: page(
            () => import('@pages/fee-management/fee-config/FeeConfig')
          )
        }
      ]
    },
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: SCREENS.FEE_POLICY.path,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-management/FeeManagement')
          )
        },
        {
          path: `${SCREENS.FEE_POLICY.path}/:mode`,
          element: page(
            () => import('@pages/fee-management-v4/fee-management/AddFeePolicy')
          )
        },
        {
          path: `${SCREENS.FEE_POLICY.path}/:mode/:id`,
          element: page(
            () => import('@pages/fee-management-v4/fee-management/AddFeePolicy')
          )
        }
      ]
    },
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: SCREENS.FEE_ASSIGNMENT.path,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-assignment/FeeAssignmentManagement')
          )
        },
        {
          path: `${SCREENS.FEE_ASSIGNMENT.path}/create`,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-assignment/components/FeeAssignAdd')
          )
        },
        {
          path: `${SCREENS.FEE_ASSIGNMENT.path}/:mode/:id`,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-assignment/components/FeeAssignAdd')
          )
        }
      ]
    },
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: SCREENS.FEE_BANK_POLICY.path,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-bank/BankFeeManagement')
          )
        },
        {
          path: `${SCREENS.FEE_BANK_POLICY.path}/:mode`,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-bank/AddBankFeePolicy')
          )
        },
        {
          path: `${SCREENS.FEE_BANK_POLICY.path}/:mode/:id`,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-bank/AddBankFeePolicy')
          )
        }
      ]
    },
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: SCREENS.FEE_SCHEDULE.path,
          element: page(
            () =>
              import('@pages/fee-management-v4/fee-schedule/FeeScheduleManagement')
          )
        }
      ]
    }
  ]
}

const roleManagementV2 = {
  path: ROLEMANAGEMENT_V2,
  element: createElement(AppLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: SCREENS.USER_ACCOUNT.path,
          element: page(
            () =>
              import('@pages/role-management-V2/user-management/UserManagement')
          )
        }
      ]
    },
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: SCREENS.ROLE_MANAGEMENT.path,
          element: namedPage(
            () =>
              import('@/pages/role-management-V2/role-management/RoleManagement'),
            'PermissionManagement'
          )
        }
      ]
    },
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: SCREENS.PERMISSION_MANAGEMENT.path,
          element: page(
            () =>
              import('@/pages/role-management-V2/permission-management/PermissionManagement')
          )
        }
      ]
    }
  ]
}

const walletAdministration = {
  path: WALLETADMINISTRATION,
  element: createElement(AppLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: SCREENS.EWALLET_MANAGEMENT.path,
          element: page(
            () =>
              import('@pages/wallet-administration/e-walletManagement/EwalletManagement')
          )
        },
        {
          path: `${SCREENS.EWALLET_MANAGEMENT.path}/:id`,
          element: page(
            () =>
              import('@pages/wallet-administration/e-walletManagement/DetailUser')
          )
        }
      ]
    },
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: SCREENS.CONFIRM_EKYC.path,
          element: page(
            () =>
              import('@pages/wallet-administration/confirm-ekyc/ConfirmEKYC')
          )
        }
      ]
    },
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: SCREENS.TRANSACTION_WALLET.aliasPaths[0],
          element: page(
            () =>
              import('@pages/wallet-administration/transaction-wallet/TransactionManagement')
          )
        }
      ]
    }
  ]
}

const merchantManagement = {
  path: MERCHANT,
  element: createElement(AppLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: MERCHANT,
      children: [
        {
          path: SCREENS.MERCHANT_MANAGEMENT.path,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-management/merchant/pages/MerchantManagement')
          )
        },
        {
          path: `${SCREENS.MERCHANT_MANAGEMENT.path}/create`,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-management/merchant/pages/CreateMerchant')
          )
        },
        {
          path: `${SCREENS.MERCHANT_MANAGEMENT.path}/create/:id`,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-management/merchant/pages/CreateMerchant')
          )
        },
        {
          path: `${SCREENS.MERCHANT_MANAGEMENT.path}/detail/:id`,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-management/merchant/pages/MerchantDetail')
          )
        },
        {
          path: `${SCREENS.MERCHANT_MANAGEMENT.path}/:id`,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-management/merchant/pages/MerchantDetail')
          )
        },
        {
          path: SCREENS.MERCHANT_BANK_ACCOUNT.path,
          element: page(
            () =>
              import('@pages/merchant-management/merchant-management/bank-account/pages/BankAccount')
          )
        },
        {
          path: SCREENS.MERCHANT_KEY_CONNECTION.path,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-gateway/key-connection/pages/KeyConnectionPage')
          )
        },
        {
          path: SCREENS.MERCHANT_PAYMENT_METHOD.path,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-gateway/payment-method/pages/PaymentMethodPage')
          )
        },
        {
          path: SCREENS.MERCHANT_NOTIFICATION.path,
          element: page(
            () =>
              import('@/pages/merchant-management/merchant-gateway/notification/pages/NotificationPage')
          )
        },
        {
          path: SCREENS.BUSINESS_WALLET_ACCOUNT.path,
          element: page(
            () =>
              import('@pages/merchant-management/business-wallet-account/pages/BusinessWallet')
          )
        },
        {
          path: `${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/create`,
          element: page(
            () =>
              import('@pages/merchant-management/business-wallet-account/pages/BusinessWalletForm')
          )
        },
        {
          path: `${SCREENS.BUSINESS_WALLET_ACCOUNT.path}/edit/:id`,
          element: page(
            () =>
              import('@pages/merchant-management/business-wallet-account/pages/BusinessWalletForm')
          )
        },
        {
          path: SCREENS.MERCHANT_SUB_MERCHANT.path,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantListPage')
          )
        },
        {
          path: `${SCREENS.MERCHANT_SUB_MERCHANT.path}/create`,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantFormPage')
          )
        },
        {
          path: `${SCREENS.MERCHANT_SUB_MERCHANT.path}/edit/:id`,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantFormPage')
          )
        },
        {
          path: `${SCREENS.MERCHANT_SUB_MERCHANT.path}/detail/:id`,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/sub-merchant/pages/SubMerchantDetailPage')
          )
        },
        {
          path: SCREENS.MERCHANT_TERMINAL.path,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/terminal/pages/TerminalListPage')
          )
        },
        {
          path: `${SCREENS.MERCHANT_TERMINAL.path}/create`,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/terminal/pages/TerminalFormPage')
          )
        },
        {
          path: `${SCREENS.MERCHANT_TERMINAL.path}/edit/:id`,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/terminal/pages/TerminalFormPage')
          )
        },
        {
          path: `${SCREENS.MERCHANT_TERMINAL.path}/detail/:id`,
          element: page(
            () =>
              import('@pages/merchant-management/sub-merchant-management/terminal/pages/TerminalDetailPage')
          )
        }
      ]
    }
  ]
}
const transactionManagement = {
  path: TRANSACTIONMANAGEMENT,
  element: createElement(AppLayout),
  errorElement: createElement(RouteErrorBoundary),
  children: [
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: SCREENS.TRANSACTION_WALLET.path,
          element: page(
            () =>
              import('@pages/wallet-administration/transaction-wallet/TransactionManagement')
          )
        },
        {
          path: `${SCREENS.TRANSACTION_WALLET.path}/:id`,
          element: page(
            () =>
              import('@pages/wallet-administration/transaction-wallet/DetailTransaction')
          )
        }
      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: SCREENS.FROZEN_TRANSACTIONS.path,
          element: page(
            () =>
              import('@pages/transaction-management/frozen-transactions/FrozenTransactions')
          )
        }
      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: `${SCREENS.TRANSACTION_MANAGEMENT.path}/refund-management`,
          element: page(
            () =>
              import('@pages/transaction-management/refund-management/RefundManagement')
          )
        }
      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: SCREENS.SYSTEM_LEDGER.path,
          element: page(
            () =>
              import('@pages/transaction-management/system-ledger/SystemLedgerManagement')
          )
        },
        {
          path: `${SCREENS.SYSTEM_LEDGER.path}/:id`,
          element: page(
            () =>
              import('@pages/transaction-management/system-ledger/DetailSystemLedger')
          )
        }
      ]
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: SCREENS.WITHDRAW_HISTORY.path,
          element: page(
            () =>
              import('@pages/transaction-management/withdraw-history/WithdrawHistory')
          )
        }
      ]
    }
  ]
}

export const WalletRoutes = createBrowserRouter([
  {
    path: '/',
    element: createElement(Navigate, {
      to: SECURE_PANEL,
      replace: true
    })
  },
  authentication,
  workspaceHome,
  forbidden,
  feeManagementV4,
  roleManagementV2,
  walletAdministration,
  merchantManagement,
  transactionManagement,
  {
    path: '/test',
    element: page(() => import('@pages/test/TestPage'))
  },
  {
    path: '/secure-panel/*',
    element: createElement(NotFound)
  }
])
