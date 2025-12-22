import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { apiService } from '@services/apiService'
import { authApiService } from '@services/authApiService'
import authReducer from '@slices/authSlice'
import { TypedUseSelectorHook, useSelector } from 'react-redux'

export const store = configureStore({
  reducer: {
    [apiService.reducerPath]: apiService.reducer,
    [authApiService.reducerPath]: authApiService.reducer,
    auth: authReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiService.middleware,
      authApiService.middleware
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

