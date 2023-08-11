import ScreenLoading from '@components/screen-loading/ScreenLoading'
import { EventEmitter } from 'events'
import ReactDOM from 'react-dom/client'
import { I18nextProvider } from 'react-i18next'
import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'

import i18next from './app/languages/i18n'
import { store } from './app/store'
import { WalletRoutes } from './routes'

import './styles/index.scss'
import React from 'react'

// add events to global
window.events = new EventEmitter()

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Provider store={store}>
      <I18nextProvider i18n={i18next}>
        <React.Suspense fallback={<ScreenLoading />}>
          <RouterProvider
            router={WalletRoutes}
            fallbackElement={<ScreenLoading />}
          />
        </React.Suspense>
        <ScreenLoading />
      </I18nextProvider>
    </Provider>
  </React.StrictMode>
)
