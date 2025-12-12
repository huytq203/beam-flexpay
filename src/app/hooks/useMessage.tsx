import React, { createContext, useContext, ReactNode } from 'react';
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

export const MessageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [messageApi, contextHolder] = message.useMessage();

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
