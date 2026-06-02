// import { scan } from 'react-scan';

// if (import.meta.env.DEV) {
//   scan({
//     enabled: false,
//   });
// }

import ScreenLoading from '@components/screen-loading/ScreenLoading'
import { EventEmitter } from 'events'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { App, ConfigProvider } from 'antd'

import i18next from './app/languages/i18n'
import { store } from './app/store'
import { WalletRoutes } from './routes'

import './styles/index.scss'
import React from 'react'
import { MessageProvider } from '@hooks/useMessage'

// add events to global
window.events = new EventEmitter()
const primaryColor = '#2bd9d0'
const primaryHoverColor = '#9feeea'

const common = {
  colorPrimary: primaryColor,
  colorInfo: primaryColor,
  colorLink: primaryColor,
  colorPrimaryHover: primaryHoverColor,
  algorithm: true
}
const theme = {
  hashed: false,
  token: {
    colorPrimary: primaryColor,
    colorInfo: primaryColor,
    colorLink: primaryColor,
    colorLinkHover: primaryHoverColor,
    colorPrimaryHover: primaryHoverColor,
    Button: {
      colorPrimary: primaryColor,
      colorPrimaryHover: primaryHoverColor,
    },
  },
  components: {
    // Button: common,
    // Input: common,
    // Select: common,
    // DatePicker: common,
    // Link: common,
    // Table: common,
    // Pagination: { ...common, colorItemActiveColor: primaryColor },
    // Checkbox: common,
    // Modal: {
    //   ...common,
    //   Button: {
    //     colorPrimary: primaryColor, // Đặt màu cho nút trong Modal
    //     colorPrimaryHover: primaryHoverColor,
    //   },
    // }
  }
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  // <React.StrictMode>
  <Provider store={store}>
    <I18nextProvider i18n={i18next}>
      <ConfigProvider theme={theme}>
        <MessageProvider>
          <App>
            {/* reCAPTCHA v3 nạp thủ công trong @utils/recaptcha (không dùng
                GoogleReCaptchaProvider — provider của lib gây CSSMotion loop với React 19) */}
            <React.Suspense fallback={<ScreenLoading />}>
              <RouterProvider
                router={WalletRoutes}
                fallbackElement={<ScreenLoading />}
              />
            </React.Suspense>
            <ScreenLoading />
          </App>
        </MessageProvider>
      </ConfigProvider>
    </I18nextProvider>
  </Provider>
  // </React.StrictMode>
)
