import { appName } from '@constants/appConstant'
import {
  BANKANDCONNECT,
  FEEMANAGEMENR_V3,
  FEEMANAGEMENT,
  INTERNAL_WALLET,
  PERSONALWALLET,
  PRODUCTS,
  ROLEMANAGEMENT
} from '@constants/routersConstant'
import {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
  fetchBaseQuery
} from '@reduxjs/toolkit/dist/query'
import { hideLoading, showLoading } from '@utils/events'
import { notification } from 'antd'
import { t } from 'i18next'
import { RootState } from '../store'

export const openNotification = (
  message: string,
  messageType?: 'warning' | 'info' | 'success' | 'error'
) => {
  if (messageType) {
    switch (messageType) {
      case 'warning':
        break
      case 'info':
        break
      case 'error':
        notification.error({
          message: t(message),
          placement: 'top'
        })
        break
        break
      default:
        notification.success({
          message: t(message),
          placement: 'top'
        })
        break
    }
  } else {
    notification.error({
      message: t(message),
      placement: 'top',
      style: { width: 400 }
    })
  }
}

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL,
  prepareHeaders: (headers, { getState }) => {
    const { accessToken } = (getState() as RootState).auth
    if (accessToken) {
      headers.set('authorization', `Bearer ${accessToken}`)
    }
    return headers
  }
})

const whiteList = [
  { pathname: PERSONALWALLET + '/customers-group', requestUrl: '/customer' },
  { pathname: PRODUCTS + '/sales-fee', requestUrl: '/service/services' },
  { pathname: PRODUCTS + '/sales-fee', requestUrl: '/service' },
  {
    pathname: PRODUCTS + '/product-discount',
    requestUrl: '/service/services'
  },
  { pathname: PRODUCTS + '/product-discount', requestUrl: '/service' },
  {
    pathname: PRODUCTS + '/product-discount',
    requestUrl: '/account-group'
  },
  { pathname: PRODUCTS + '/product-discount', requestUrl: '/customer' },
  { pathname: PRODUCTS + '/sales-fee', requestUrl: '/account-group' },
  { pathname: PRODUCTS + '/sales-fee', requestUrl: '/customer' },
  {
    pathname: FEEMANAGEMENT + '/e-wallet-transfer-money',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/e-wallet-transfer-money',
    requestUrl: '/customer'
  },
  {
    pathname: FEEMANAGEMENT + '/direct-deposit',
    requestUrl: '/bank/find-all-active'
  },
  {
    pathname: FEEMANAGEMENT + '/withdraw-money',
    requestUrl: '/bank/find-all-active'
  },
  {
    pathname: FEEMANAGEMENT + '/limit-regulations',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/limit-regulations',
    requestUrl: '/customer'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/bank/find-all-active'
  },
  {
    pathname: FEEMANAGEMENT + '/direct-deposit',
    requestUrl: '/user'
  },
  {
    pathname: FEEMANAGEMENT + '/withdraw-money',
    requestUrl: '/user'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/user'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/user'
  },
  {
    pathname: FEEMANAGEMENT + '/direct-deposit',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/direct-deposit',
    requestUrl: '/customer'
  },
  {
    pathname: FEEMANAGEMENT + '/withdraw-money',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/withdraw-money',
    requestUrl: '/customer'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/customer'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/account-bank-payment',
    requestUrl: '/customer'
  },
  {
    pathname: FEEMANAGEMENT + '/payment',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/payment',
    requestUrl: '/customer'
  },
  {
    pathname: BANKANDCONNECT + '/notification-management',
    requestUrl: '/customer'
  },
  {
    pathname: BANKANDCONNECT + '/notification-management',
    requestUrl: '/account-group'
  },
  {
    pathname: FEEMANAGEMENT + '/limit-regulations',
    requestUrl: '/user'
  },
  {
    pathname: ROLEMANAGEMENT + '/manage-group-permissions',
    requestUrl: '/group-permission'
  },
  {
    pathname: INTERNAL_WALLET + '/account',
    requestUrl: '/balance-internal-group'
  },
  {
    pathname: FEEMANAGEMENR_V3 + '/fee-v3/fee-assignment',
    requestUrl: '/banks'
  }
]

const isWhiteList = (url?: string, pathname?: string) => {
  return whiteList.find((w) => w.pathname === pathname && w.requestUrl === url)
}

export const fetchBaseQueryCustom: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const pathName =
    window.location.pathname.charAt(window.location.pathname.length - 1) === '/'
      ? window.location.pathname.slice(0, -1)
      : window.location.pathname
  const isLoading = (args as any)?.params?.isLoading

  isLoading !== false &&
    !isWhiteList((args as any).url, pathName) &&
    showLoading()
  const result = await baseQuery(args, api, extraOptions)
  hideLoading()
  if (result.error && result.error.status) {
    switch (result.error.status) {
      case 401:
        localStorage.removeItem(appName)
        if (window.location.pathname !== '/auth/login') {
          setTimeout(() => {
            window.location.href = '/auth/login'
          }, 700)
        } else {
          openNotification((result.error.data as any).message)
        }
        break
      case 400:
        openNotification((result.error.data as any).message)
        break
      case 'FETCH_ERROR':
        break
      default:
        openNotification((result.error.data as any).message)
        break
    }
  }
  return result
}
