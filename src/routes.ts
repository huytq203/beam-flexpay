import { createElement, lazy, Suspense, type ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Spin } from 'antd'

import AppLayout from '@components/layout/AppLayout'
import AuthLayout from '@components/layout/AuthLayout'
import {
  AUTHENTICATION,
  FORBIDDENERROR,
  ROLEMANAGEMENT_V2,
  WALLETADMINISTRATION,
  MERCHANT,
  TRANSACTIONMANAGEMENT,
  FEEMANAGEMENT_V4,
} from '@constants/routersConstant'

import NotFound from '@pages/auth/not-found/NotFound'

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
      fallback: createElement(
        'div',
        { className: 'flex items-center justify-center min-h-[60vh]' },
        createElement(Spin, { size: 'large' }),
      ),
    },
    createElement(Lazy),
  )
}

/** Với trang export theo tên thay vì export default. */
const namedPage = <T extends string>(
  factory: () => Promise<Record<T, ComponentType>>,
  name: T,
) => page(() => factory().then((m) => ({ default: m[name] })))

const authentication = {
  path: AUTHENTICATION,
  element: createElement(AuthLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: AUTHENTICATION + '/login',
      element: page(() => import('@pages/auth/login/Login')),
    },
    {
      path: AUTHENTICATION + '/forgot-password',
      element: page(() => import('@pages/auth/forgot-password/ForgotPassword')),
    },
    {
      path: AUTHENTICATION + '/reset-password',
      element: page(() => import('@pages/auth/reset-password/ResetPassword')),
    },
    {
      path: AUTHENTICATION + '/forget-password',
      element: page(() => import('@pages/auth/forgot-password/ForgotPassword')),
    },
    {
      path: AUTHENTICATION + '/verify-token',
      element: page(() => import('@pages/auth/verify-token/VerifyToken')),
    },
  ],
}

const forbidden = {
  path: FORBIDDENERROR,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FORBIDDENERROR,
      element: page(() => import('@pages/error/ForbiddenError')),
    },
  ],
}

const feeManagementV4 = {
  path: FEEMANAGEMENT_V4,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: FEEMANAGEMENT_V4 + '/fee-managementV4',
          element: page(() => import('@pages/fee-management-v4/fee-management/FeeManagement')),
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-managementV4/:mode',
          element: page(() => import('@pages/fee-management-v4/fee-management/AddFeePolicy')),
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-managementV4/:mode/:id',
          element: page(() => import('@pages/fee-management-v4/fee-management/AddFeePolicy')),
        },
      ],
    },
    {
      path: FEEMANAGEMENT_V4,
      children: [
        {
          path: FEEMANAGEMENT_V4 + '/fee-assignmentV4',
          element: page(() => import('@pages/fee-management-v4/fee-assignment/FeeAssignmentManagement')),
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-assignmentV4/create',
          element: page(() => import('@pages/fee-management-v4/fee-assignment/components/FeeAssignAdd')),
        },
        {
          path: FEEMANAGEMENT_V4 + '/fee-assignmentV4/:mode/:id',
          element: page(() => import('@pages/fee-management-v4/fee-assignment/components/FeeAssignAdd')),
        },
      ],
    },
  ],
}

const roleManagementV2 = {
  path: ROLEMANAGEMENT_V2,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: ROLEMANAGEMENT_V2 + '/user-account',
          element: page(() => import('@pages/role-management-V2/user-management/UserManagement')),
        },
      ],
    },
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: ROLEMANAGEMENT_V2 + '/permission-management',
          element: namedPage(
            () => import('@pages/role-management-V2/permission-management/PermissionManagement'),
            'PermissionManagement',
          ),
        },
      ],
    },
    {
      path: ROLEMANAGEMENT_V2,
      children: [
        {
          path: ROLEMANAGEMENT_V2 + '/role-management',
          element: page(() => import('@pages/role-management-V2/role-management/RoleManagement')),
        },
      ],
    },
  ],
}

const walletAdministration = {
  path: WALLETADMINISTRATION,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: WALLETADMINISTRATION + '/e-walletManagement',
          element: page(() => import('@pages/wallet-administration/e-walletManagement/EwalletManagement')),
        },
        {
          path: WALLETADMINISTRATION + '/e-walletManagement/:id',
          element: page(() => import('@pages/wallet-administration/e-walletManagement/DetailUser')),
        },
      ],
    },
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: WALLETADMINISTRATION + '/confirm-eKYC',
          element: page(() => import('@pages/wallet-administration/confirm-ekyc/ConfirmEKYC')),
        },
      ],
    },
    {
      path: WALLETADMINISTRATION,
      children: [
        {
          path: WALLETADMINISTRATION + '/transaction-wallet',
          element: page(() => import('@pages/wallet-administration/transaction-wallet/TransactionManagement')),
        },
      ],
    },
  ],
}

const merchantManagement = {
  path: MERCHANT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: MERCHANT,
      children: [
        {
          path: MERCHANT + '/dashboard-merchant',
          element: page(() => import('@pages/merchant-management/dashboard-merchant/DashBoard')),
        },
        {
          path: MERCHANT + '/merchant-management',
          element: page(() => import('@pages/merchant-management/merchanr-management/MerchantManagement')),
        },
        {
          path: MERCHANT + '/merchant-management/create',
          element: page(() => import('@pages/merchant-management/merchanr-management/CreateMerchant')),
        },
        {
          path: MERCHANT + '/merchant-management/create/:id',
          element: page(() => import('@pages/merchant-management/merchanr-management/CreateMerchant')),
        },
        {
          path: MERCHANT + '/merchant-management/detail/:id',
          element: page(() => import('@pages/merchant-management/merchanr-management/MerchantDetail')),
        },
        {
          path: MERCHANT + '/merchant-management/:id',
          element: page(() => import('@pages/merchant-management/merchanr-management/MerchantDetail')),
        },
        {
          path: MERCHANT + '/merchant-order',
          element: page(() => import('@pages/merchant-management/merchant-order/OrderFeature')),
        },
        {
          path: MERCHANT + '/merchant-order/qr/:id',
          element: page(() => import('@pages/merchant-management/merchant-order/OrderQrFeature')),
        },
      ],
    },
  ],
}

const transactionManagement = {
  path: TRANSACTIONMANAGEMENT,
  element: createElement(AppLayout),
  errorElement: createElement(NotFound),
  children: [
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/transaction-wallet',
          element: page(() => import('@pages/wallet-administration/transaction-wallet/TransactionManagement')),
        },
        {
          path: TRANSACTIONMANAGEMENT + '/transaction-wallet/:id',
          element: page(() => import('@pages/wallet-administration/transaction-wallet/DetailTransaction')),
        },
      ],
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/frozen-transactions',
          element: page(() => import('@pages/transaction-management/frozen-transactions/FrozenTransactions')),
        },
      ],
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/refund-management',
          element: page(() => import('@pages/transaction-management/refund-management/RefundManagement')),
        },
      ],
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/system-ledger',
          element: page(() => import('@pages/transaction-management/system-ledger/SystemLedgerManagement')),
        },
        {
          path: TRANSACTIONMANAGEMENT + '/system-ledger/:id',
          element: page(() => import('@pages/transaction-management/system-ledger/DetailSystemLedger')),
        },
      ],
    },
    {
      path: TRANSACTIONMANAGEMENT,
      children: [
        {
          path: TRANSACTIONMANAGEMENT + '/withdraw-history',
          element: page(() => import('@pages/transaction-management/withdraw-history/WithdrawHistory')),
        },
      ],
    },
  ],
}

export const WalletRoutes = createBrowserRouter([
  {
    path: '/',
    element: createElement(Navigate, { to: AUTHENTICATION + '/login', replace: true }),
  },
  authentication,
  forbidden,
  feeManagementV4,
  roleManagementV2,
  walletAdministration,
  merchantManagement,
  transactionManagement,
  {
    path: '/test',
    element: page(() => import('@pages/test/TestPage')),
  },
  {
    path: '/secure-panel/*',
    element: createElement(NotFound),
  },
])
