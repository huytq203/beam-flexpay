import { message } from 'antd'
import { getGlobalMessage } from '@hooks/useMessage'

// The root MessageProvider owns the visible toast layer and its theme context.
// Keep the static fallback for isolated screens and tests without that provider.
export const feedback = {
  success: (content: string): void => {
    const instance = getGlobalMessage()
    if (instance) void instance.success(content)
    else void message.success(content)
  },
  warning: (content: string): void => {
    const instance = getGlobalMessage()
    if (instance) void instance.warning(content)
    else void message.warning(content)
  },
  error: (content: string): void => {
    const instance = getGlobalMessage()
    if (instance) void instance.error(content)
    else void message.error(content)
  }
}
