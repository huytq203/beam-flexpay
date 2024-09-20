import { NOTIFICATION_TYPE_OBJECT, NOTIFICATION_TYPE_SERVICE } from '@pages/system-management/notification-management/NotificationManagementConst'
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
  serviceType: NOTIFICATION_TYPE_SERVICE
  applicableObject?: APPLICABLE_OBJECTS
  applicableObjectId?: number | string
  title?: string
  body?: string
  id?: number | string
  status?: boolean | number
  startDate?: string
  accountGroup?: any
  accountNumber?: any
}

export interface INotificationResponse {
  data: INotification[]
  meta: Pagination
}
