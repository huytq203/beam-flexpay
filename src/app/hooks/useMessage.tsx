import React, { createContext, useContext, ReactNode, useEffect } from 'react';
import { message } from 'antd';
import type { MessageInstance } from 'antd/es/message/interface';

interface MessageContextType {
  infoMess: (content: string) => void;
  successMess: (content: string) => void;
  errorMess: (content: string) => void;
  warningMess: (content: string) => void;
  messageApi: MessageInstance;
}

const MessageContext = createContext<MessageContextType | undefined>(undefined);

/**
 * Global message instance for use outside React components (middleware, utils, etc.)
 */
let globalMessageApi: MessageInstance | null = null;

export const getGlobalMessage = () => globalMessageApi;

export const globalMessage = {
  info: (content: string) => globalMessageApi?.info(content),
  success: (content: string) => globalMessageApi?.success(content),
  error: (content: string) => globalMessageApi?.error(content),
  warning: (content: string) => globalMessageApi?.warning(content),
};

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

  // Set global message instance
  useEffect(() => {
    globalMessageApi = messageApi;
  }, [messageApi]);

  const value: MessageContextType = {
    infoMess: (content: string) => messageApi.info(content),
    successMess: (content: string) => messageApi.success(content),
    errorMess: (content: string) => messageApi.error(content),
    warningMess: (content: string) => messageApi.warning(content),
    messageApi,
  };

  return (
    <MessageContext.Provider value={value}>
      {contextHolder}
      {children}
    </MessageContext.Provider>
  );
};

export const useMessage = () => {
  const context = useContext(MessageContext);
  if (!context) {
    throw new Error('useMessage phải được sử dụng trong MessageProvider');
  }
  return context;
};
