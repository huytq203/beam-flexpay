import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiFeeService, apiMerchant, apiService, apiWalletCore, authApiService } from '@services/apiService'
import authReducer from '@slices/authSlice'
import { TypedUseSelectorHook, useSelector } from 'react-redux'
import { errorMiddleware } from './middleware/errorMiddleware'

export const store = configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    [authApiService.reducerPath]: authApiService.reducer,
    [apiFeeService.reducerPath]: apiFeeService.reducer,
    [apiWalletCore.reducerPath]: apiWalletCore.reducer,
    [apiMerchant.reducerPath]: apiMerchant.reducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiService.middleware,
      authApiService.middleware,
      apiFeeService.middleware,
      apiWalletCore.middleware,
      apiMerchant.middleware,
      errorMiddleware
    )
})

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

