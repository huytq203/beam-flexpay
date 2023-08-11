import { APPLICABLE_OBJECTS } from './policyManagement'
import { Pagination } from './table'

export interface NotificationParams {
  page: number
  take: number
  [key: string]: any
}

export enum notificationMode {
  CREATE = 'CREATE',
  DELETE = 'DELETE',
  UPDATE = 'UPDATE',
  VIEW = 'VIEW',
  PUBLISH = 'PUBLISH'
}

export enum notificationService {
  DEPOSIT_LINK_BANK = 'DEPOSIT_LINK_BANK',
  DEPOSIT_CARD_PHONE = 'DEPOSIT_CARD_PHONE',
  DEPOSIT_FAIL = 'DEPOSIT_FAIL',
  CHARGE_CARD_PHONE_NUMBER = 'CHARGE_CARD_PHONE_NUMBER',
  CHARGE_DATA_3G_4G = 'CHARGE_DATA_3G_4G',
  PAYMENT_CARD_PHONE = 'PAYMENT_CARD_PHONE',
  PAYMENT_DATA_3G_4G = 'PAYMENT_DATA_3G_4G',
  TRANSFER_RECEIVE = 'TRANSFER_RECEIVE',
  TRANSFER_MOVER = 'TRANSFER_MOVER',
  WITHDRAW_LINK_BANK = 'WITHDRAW_LINK_BANK',
  WITHDRAW_NOT_LINK_BANK = 'WITHDRAW_NOT_LINK_BANK',
  LINK_BANK = 'LINK_BANK',
  UNLINK_BANK = 'UNLINK_BANK',
  PAYMENT_BILL = 'PAYMENT_BILL',
  WARNING_LOGIN_NEW_DEVICE = 'WARNING_LOGIN_NEW_DEVICE',
  WARNING_CHANGE_PASSWORD = 'WARNING_CHANGE_PASSWORD',
  OTHER = 'OTHER'
}

export interface INotification {
  applicableObject: APPLICABLE_OBJECTS | null
  applicableObjectId: string | null
  body: string | null
  createdAt: string | null
  id: number | null
  serviceType: string | null
  startDate: string | null
  status: number | null
  title: string | null
  updatedAt: string | null
  applicableObjectName?: string
}

export interface INotificationForm {
  serviceType: notificationService
  applicableObject?: APPLICABLE_OBJECTS
  applicableObjectId?: number | string
  title?: string
  body?: string
  id?: number | string
  status?: boolean
  startDate?: string
  accountGroup?: any
  accountNumber?: any
}

export interface INotificationResponse {
  data: INotification[]
  meta: Pagination
}
