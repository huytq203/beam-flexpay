import { zodResolver } from '@hookform/resolvers/zod'
import { useMessage } from '@hooks/useMessage'
import {
  useCloseUserWalletMutation,
  useGetWalletClosureCheckQuery
} from '@services/apiWalletClose'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  WalletCloseSchema,
  type WalletCloseFormValues
} from '../schemas/WalletClose.schema'
import {
  getCloseErrorDetail,
  getWalletCloseView,
  isCloseConflict,
  isCloseResultUnknown
} from '../utils/walletClose'

const FALLBACK_ERROR = 'Không thể xóa ví, vui lòng thử lại.'
const INCOMPLETE_WARNING =
  'Đã hủy ví nhưng chưa thu hồi xong phiên đăng nhập, vui lòng bấm lại.'

interface UseWalletCloseOptions {
  userId?: string
  onSuccess?: () => void
}

export const useWalletClose = ({
  userId,
  onSuccess
}: UseWalletCloseOptions) => {
  const { successMess } = useMessage()
  const [submitError, setSubmitError] = useState<string>()
  // Ví đã hủy ở lượt này nhưng BE báo accountClosed=false: bấm lại để hoàn tất.
  const [incomplete, setIncomplete] = useState(false)

  const check = useGetWalletClosureCheckQuery(userId ?? '', {
    skip: !userId,
    refetchOnMountOrArgChange: true
  })
  const [closeWallet, { isLoading: isClosing }] = useCloseUserWalletMutation()
  const form = useForm<WalletCloseFormValues>({
    defaultValues: { reason: '' },
    resolver: zodResolver(WalletCloseSchema)
  })

  const data = check.data
  const view = incomplete ? 'retry' : data ? getWalletCloseView(data) : null

  const handleError = (error: unknown) => {
    setSubmitError(getCloseErrorDetail(error) ?? FALLBACK_ERROR)
    // Kết quả chưa rõ hoặc số dư/giao dịch đã đổi: vẽ lại popup theo trạng thái thật.
    if (isCloseResultUnknown(error) || isCloseConflict(error)) {
      void check.refetch()
    }
  }

  const submit = async (reason?: string) => {
    if (!userId || !data) return
    setSubmitError(undefined)
    try {
      const result = await closeWallet(
        reason === undefined
          ? { userId }
          : { userId, reason, expectedBalance: data.balance }
      ).unwrap()
      if (result.accountClosed) {
        successMess('Xóa ví điện tử thành công')
        onSuccess?.()
        return
      }
      setIncomplete(true)
      setSubmitError(INCOMPLETE_WARNING)
    } catch (error) {
      handleError(error)
    }
  }

  const confirm = () =>
    view === 'retry'
      ? submit()
      : form.handleSubmit((values) => submit(values.reason))()

  return {
    check,
    data,
    view,
    form,
    isClosing,
    submitError,
    confirm,
    canConfirm: view === 'form' || view === 'retry',
    loadError: check.isError
      ? (getCloseErrorDetail(check.error) ??
        'Không thể kiểm tra điều kiện xóa ví.')
      : undefined
  }
}
