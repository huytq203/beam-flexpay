import React, { ReactNode, useEffect } from 'react'
import { message } from 'antd'
import {
  MessageContext,
  getGlobalMessage,
  setGlobalMessage
} from './useMessage'

export const MessageProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [messageApi, contextHolder] = message.useMessage()

  // Set global message instance
  useEffect(() => {
    setGlobalMessage(messageApi)
    return () => {
      if (getGlobalMessage() === messageApi) setGlobalMessage(null)
    }
  }, [messageApi])

  const value = {
    infoMess: (content: string) => messageApi.info(content),
    successMess: (content: string) => messageApi.success(content),
    errorMess: (content: string) => messageApi.error(content),
    warningMess: (content: string) => messageApi.warning(content),
    messageApi
  }

  return (
    <MessageContext.Provider value={value}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  )
}
