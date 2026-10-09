import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiFeeService, apiMerchant, apiService, apiUserWallet, apiWalletCore, authApiService } from '@services/apiService'
import { apiWeather } from '@services/apiWeather'
import authReducer from '@slices/authSlice'
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { errorMiddleware } from './middleware/errorMiddleware'

/** Factory để test dựng store sạch cho mỗi case, tránh rò cache RTK Query. */
export const createAppStore = () => configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    [authApiService.reducerPath]: authApiService.reducer,
    [apiFeeService.reducerPath]: apiFeeService.reducer,
    [apiWalletCore.reducerPath]: apiWalletCore.reducer,
    [apiMerchant.reducerPath]: apiMerchant.reducer,
    [apiUserWallet.reducerPath]: apiUserWallet.reducer,
    [apiWeather.reducerPath]: apiWeather.reducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiService.middleware,
      authApiService.middleware,
      apiFeeService.middleware,
      apiWalletCore.middleware,
      apiMerchant.middleware,
      apiUserWallet.middleware,
      apiWeather.middleware,
      errorMiddleware
    )
})

export const store = createAppStore()

setupListeners(store.dispatch)

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>
export const useTypedSelector: TypedUseSelectorHook<RootState> = useSelector
