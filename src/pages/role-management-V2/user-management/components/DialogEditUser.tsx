import { memo, useMemo, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { ButtonComponent } from '@components/index'
import { SkeletonInput } from '@components/ui/skeletons/Skeleton'
import { EditUserFormFields } from './EditUserFormFields'
import { useMessage } from '@hooks/useMessage'
import {
  useGetUserByIdQuery,
  useUpdateManagerUserMutation
} from '@services/apiUserManagement'
import { useGetUserRoleQuery } from '@services/apiUserRoleAssign'
import { DataRoleItem } from '@type/roleManagement'
import { getApiErrorDetail } from '@pages/role-management-V2/utils/RoleManagement.utils'
import {
  UpdateAdminUserFormData,
  UpdateAdminUserSchema
} from '../schemas/UpdateAdminUser.schema'
import {
  UpdateAdminUserRequest,
  UserRoleOption
} from '../types/UserManagement.type'

interface Props {
  userId?: string
  roleOptions?: UserRoleOption[]
  onSuccess: () => void
  onCancel: () => void
  onLoadingChange?: (loading: boolean) => void
}

const EMPTY_VALUES: UpdateAdminUserFormData = {
  email: '',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  enabled: 'true',
  roleIds: []
}

const isFetchError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'status' in error &&
  error.status === 'FETCH_ERROR'

const getUpdateErrorMessage = (error: unknown): string => {
  if (isFetchError(error)) {
    return 'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi thử lại.'
  }

  return (
    getApiErrorDetail(error) ??
    'Không thể cập nhật tài khoản. Vui lòng thử lại.'
  )
}

const getLoadErrorMessage = (error: unknown): string => {
  if (isFetchError(error)) {
    return 'Không kết nối được máy chủ. Kiểm tra kết nối mạng rồi tải lại.'
  }

  return (
    getApiErrorDetail(error) ??
    'Không thể tải thông tin tài khoản. Vui lòng tải lại.'
  )
}

const haveSameIds = (left: string[], right: string[]): boolean =>
  left.length === right.length && left.every((id) => right.includes(id))

const DialogEditUser = ({
  userId,
  roleOptions = [],
  onSuccess,
  onCancel,
  onLoadingChange
}: Props) => {
  const { successMess } = useMessage()
  const [submitError, setSubmitError] = useState<string | null>(null)
  const {
    data: userResponse,
    error: userError,
    isLoading: isLoadingUser,
    isFetching: isFetchingUser,
    refetch: refetchUser
  } = useGetUserByIdQuery(userId ?? '', { skip: !userId })
  const {
    data: userRoleResponse,
    error: userRoleError,
    isLoading: isLoadingUserRoles,
    isFetching: isFetchingUserRoles,
    refetch: refetchUserRoles
  } = useGetUserRoleQuery(userId ?? '', { skip: !userId })
  const [updateManagerUser, { isLoading: isUpdating }] =
    useUpdateManagerUserMutation()

  const user = userResponse?.data
  const assignedRoleIds = useMemo(() => {
    const assignedRoles = (userRoleResponse?.data ?? []) as DataRoleItem[]
    return assignedRoles.map((role) => role.id)
  }, [userRoleResponse?.data])
  const formValues = useMemo<UpdateAdminUserFormData>(() => {
    if (!user) return EMPTY_VALUES

    return {
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      enabled: user.enabled ? 'true' : 'false',
      roleIds: assignedRoleIds
    }
  }, [assignedRoleIds, user])
  const { control, handleSubmit, setError } = useForm<UpdateAdminUserFormData>({
    resolver: zodResolver(UpdateAdminUserSchema),
    mode: 'onSubmit',
    values: formValues
  })
  const enabled = useWatch({ control, name: 'enabled' })
  const email = useWatch({ control, name: 'email' })
  const roleIds = useWatch({ control, name: 'roleIds' }) ?? []

  const hasSecurityImpact = Boolean(
    user &&
      ((user.email ?? '').toLowerCase() !== email.trim().toLowerCase() ||
        (user.enabled && enabled === 'false') ||
        !haveSameIds(assignedRoleIds, roleIds))
  )
  const isLoadingDetails =
    isLoadingUser || isFetchingUser || isLoadingUserRoles || isFetchingUserRoles
  const loadError = userError ?? userRoleError

  const retryLoad = (): void => {
    setSubmitError(null)
    if (userId) {
      void refetchUser()
      void refetchUserRoles()
    }
  }

  const onSubmit = async (data: UpdateAdminUserFormData): Promise<void> => {
    if (!userId || isUpdating) return

    setSubmitError(null)
    onLoadingChange?.(true)

    const payload: UpdateAdminUserRequest = {
      email: data.email.trim().toLowerCase(),
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      phoneNumber: data.phoneNumber.trim(),
      enabled: data.enabled === 'true',
      roleIds: data.roleIds
    }

    try {
      await updateManagerUser({ userId, body: payload }).unwrap()
      successMess('Cập nhật tài khoản thành công')
      onSuccess()
    } catch (error) {
      const message = getUpdateErrorMessage(error)

      if (/số điện thoại/i.test(message)) {
        setError('phoneNumber', { type: 'server', message })
        return
      }

      if (/email/i.test(message)) {
        setError('email', { type: 'server', message })
        return
      }

      setSubmitError(message)
    } finally {
      onLoadingChange?.(false)
    }
  }

  if (isLoadingDetails) {
    return (
      <div
        className='grid grid-cols-1 gap-3 p-3 sm:grid-cols-2'
        aria-busy='true'
        aria-label='Đang tải thông tin tài khoản'
      >
        {Array.from({ length: 6 }).map((_, index) => (
          <SkeletonInput key={index} />
        ))}
      </div>
    )
  }

  if (!userId || loadError || !user) {
    return (
      <div className='flex flex-col gap-4 p-3'>
        <div
          className='rounded-lg bg-red-50 px-4 py-3 text-sm leading-5 text-red-800'
          role='alert'
        >
          {getLoadErrorMessage(loadError)} Dữ liệu chưa được thay đổi.
        </div>
        <div className='flex flex-wrap items-center justify-end gap-2'>
          <ButtonComponent
            type='default'
            content='Đóng'
            onClick={onCancel}
          />
          {userId && (
            <ButtonComponent
              type='primary'
              content='Tải lại'
              onClick={retryLoad}
            />
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      className='flex flex-col gap-4 rounded-lg bg-white p-3'
      noValidate
      onSubmit={handleSubmit(onSubmit)}
    >
      <EditUserFormFields
        control={control}
        username={user.username}
        roleOptions={roleOptions}
      />

      {hasSecurityImpact && (
        <div
          className='rounded-lg bg-amber-50 px-3 py-2.5 text-sm leading-5 text-amber-900'
          role='note'
        >
          Thay đổi email, trạng thái hoặc nhóm quyền có thể ảnh hưởng đến xác
          thực và kết thúc các phiên đăng nhập hiện tại để dữ liệu mới có hiệu
          lực ngay.
        </div>
      )}

      {submitError && (
        <p
          className='text-sm text-red-600'
          role='alert'
          aria-live='polite'
        >
          {submitError}
        </p>
      )}

      <div className='flex flex-wrap items-center justify-end gap-2 pt-1'>
        <ButtonComponent
          type='default'
          content='Hủy'
          disabled={isUpdating}
          onClick={onCancel}
        />
        <ButtonComponent
          type='primary'
          content='Lưu thay đổi'
          htmlType='submit'
          loading={isUpdating}
          disabled={isUpdating}
        />
      </div>
    </form>
  )
}

export default memo(DialogEditUser)
