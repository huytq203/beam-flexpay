import {
  BANKANDCONNECT,
  CUSTOMERS,
  CUSTOMERTRANSACTION,
  FEEMANAGEMENT,
  INTERNAL,
  PERSONALWALLET,
  REPAYMENTANDDISBURSE,
  REPORTS,
  ROLEMANAGEMENT
} from '@constants/routersConstant'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { useAppSelector } from './hook'

interface IMapping {
  pathName: string[]
  permission: string
}

const MappingRouterPermission: IMapping[] = [
  {
    pathName: [ROLEMANAGEMENT + '/admin-account'],
    permission: 'admin:view'
  },
  {
    pathName: [ROLEMANAGEMENT + '/manage-group-permissions'],
    permission: 'group:view'
  },
  {
    pathName: [PERSONALWALLET + '/customers-group'],
    permission: 'customer_group:view'
  },
  {
    pathName: [
      PERSONALWALLET + CUSTOMERS + '/list',
      PERSONALWALLET + CUSTOMERS + '/lookup',
      PERSONALWALLET + CUSTOMERS + '/cancel',
      PERSONALWALLET + CUSTOMERS + '/ekyc',
      PERSONALWALLET + CUSTOMERS + '/freeze-account',
      PERSONALWALLET + CUSTOMERS + '/un-freeze-account'
    ],
    permission: 'customer:view'
  },
  {
    pathName: [
      PERSONALWALLET + CUSTOMERTRANSACTION + '/transfer-history',
      PERSONALWALLET + CUSTOMERTRANSACTION + '/napas-token'
    ],
    permission: 'customer_transaction:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/direct-deposit'],
    permission: 'direct_deposit:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/payment'],
    permission: 'wallet_payment:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/e-wallet-transfer-money'],
    permission: 'wallet_transfer:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/account-bank-payment'],
    permission: 'bank_payment:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/withdraw-money'],
    permission: 'withdraw_money:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/limit-regulations'],
    permission: 'transaction_limit:view'
  },
  {
    pathName: [FEEMANAGEMENT + '/form-setting'],
    permission: 'transaction_limit:view'
  },
  {
    pathName: [BANKANDCONNECT + '/banks'],
    permission: 'bank_management:view'
  },
  {
    pathName: [BANKANDCONNECT + '/notification-management'],
    permission: 'connect_management:view'
  },
  {
    pathName: [REPAYMENTANDDISBURSE + '/dashboard'],
    permission: 'payment_transaction:view'
  },
  {
    pathName: [REPAYMENTANDDISBURSE + '/sms-metrics'],
    permission: 'sms_stat:view'
  },

  {
    pathName: [
      REPAYMENTANDDISBURSE + '/repayment/partner-contact',
      REPAYMENTANDDISBURSE + '/repayment/invoice-query',
      REPAYMENTANDDISBURSE + '/repayment/repayment-transaction',
      REPAYMENTANDDISBURSE + '/repayment/payment-service',
      REPAYMENTANDDISBURSE + '/disburse/disburse-transaction',
      REPAYMENTANDDISBURSE + '/disburse/disburse-partner-contact',
      REPAYMENTANDDISBURSE + '/disburse/disburse-invoice-query'
    ],
    permission: 'repayment:view'
  },
  {
    pathName: [
      REPORTS + INTERNAL + '/accounts',
      REPORTS + INTERNAL + '/detail-account'
    ],
    permission: 'internal_report:view'
  }
]

const usePermission = (): boolean => {
  const location = useLocation()
  const [isAccess, setAccess] = useState<boolean>(true)
  const { permissions } = useAppSelector((state) => state.auth.profile)

  const getPermissionAccess = () => {
    return new Promise<boolean>((resolve, reject) => {
      if (permissions.includes('admin*') || location.pathname === '/') {
        resolve(true)
        // return true
      } else {
        const result = MappingRouterPermission.find(
          (item) =>
            item.pathName.includes(location.pathname) &&
            permissions.includes(item.permission)
        )

        if (result) resolve(true)
        else resolve(false)
      }
    })
  }

  useEffect(() => {
    ;async () => {
      setAccess(await getPermissionAccess())
    }
  }, [location.pathname])

  return isAccess
}

export default usePermission
