import { createContext, useContext } from 'react'
import type { MessageInstance } from 'antd/es/message/interface'

interface MessageContextType {
  infoMess: (content: string) => void
  successMess: (content: string) => void
  errorMess: (content: string) => void
  warningMess: (content: string) => void
  messageApi: MessageInstance
}

export const MessageContext = createContext<MessageContextType | undefined>(
  undefined
)

/**
 * Global message instance for use outside React components (middleware, utils, etc.)
 */
let globalMessageApi: MessageInstance | null = null

export const setGlobalMessage = (api: MessageInstance | null): void => {
  globalMessageApi = api
}

export const getGlobalMessage = () => globalMessageApi

export const globalMessage = {
  info: (content: string) => globalMessageApi?.info(content),
  success: (content: string) => globalMessageApi?.success(content),
  error: (content: string) => globalMessageApi?.error(content),
  warning: (content: string) => globalMessageApi?.warning(content)
}

export const useMessage = () => {
  const context = useContext(MessageContext)
  if (!context) {
    throw new Error('useMessage phải được sử dụng trong MessageProvider')
  }
  return context
}
