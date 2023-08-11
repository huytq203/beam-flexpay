import { ResponseType } from '@type/api'
import { INotificationResponse } from '@type/notification'
import { apiService } from './apiService'
export const apiNotification = apiService.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: (payload) => ({
        url: '/notification-context-setting-cms',
        method: 'GET',
        params: payload
      }),
      transformResponse: (res: ResponseType<INotificationResponse>) => res.data
    }),
    getNotification: builder.query({
      query: (id) => ({
        url: '/notification-context-setting-cms/' + id,
        method: 'GET'
      })
    }),
    createNotification: builder.mutation({
      query: (payload) => ({
        url: '/notification-context-setting-cms',
        method: 'POST',
        body: payload
      })
    }),
    updateNotification: builder.mutation({
      query: ({ id, ...payload }) => ({
        url: '/notification-context-setting-cms/' + id,
        method: 'PUT',
        body: payload
      })
    }),
    deleteNotification: builder.query({
      query: (id) => ({
        url: '/notification-context-setting-cms/' + id,
        method: 'DELETE'
      })
    }),
    publishNotification: builder.query({
      query: ({ id, status }) => ({
        url: '/notification-context-setting-cms/publish/' + id,
        method: 'PUT',
        body: { status }
      })
    })
  })
})

export const {
  useLazyGetNotificationQuery,
  useGetNotificationsQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useLazyDeleteNotificationQuery,
  useLazyPublishNotificationQuery
} = apiNotification
