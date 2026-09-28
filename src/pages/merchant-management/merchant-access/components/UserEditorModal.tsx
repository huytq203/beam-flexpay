import { useAccessMerchants } from '../hooks/useAccessMerchants'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useState } from 'react'

import { FormInput } from '@components/form'
import { ButtonComponent, DialogModal, feedback } from '@components/index'
import {
  useCreateMerchantUserMutation,
  useUpdateMerchantUserMutation,
  useCreateMerchantUserScopeProposalMutation
} from '@/app/services/merchantAccessApi'
import { useScreenAccess } from '@/app/permissions'

import {
  merchantUserSchema,
  type MerchantUserForm
} from '../schemas/merchantAccess.schemas'
import type { MerchantUser } from '../types/merchantAccess.types'
import { ScopeChangeReasonField } from './ScopeChangeReasonField'
import { UserSubMerchantField } from './UserSubMerchantField'
import { useUserScopeDraft } from '../hooks/useUserScopeDraft'
import type { PickedGroup } from './MerchantGroupPickerDialog'
import { UserInitialAccessFields } from './UserInitialAccessFields'
import { UserMerchantScopeField } from './UserMerchantScopeField'

const FORM_ID = 'merchant-user-editor'
const EMPTY_IDS: string[] = []

export function UserEditorModal({
  user,
  onClose
}: {
  user: MerchantUser | null
  onClose: () => void
}) {
  const { getMerchant, getSubMerchant } = useAccessMerchants()
  const [groups, setGroups] = useState<PickedGroup[]>([])
  const scope = useUserScopeDraft(user, getSubMerchant)
  const [createUser, { isLoading: isCreating }] =
    useCreateMerchantUserMutation()
  const [updateUser, { isLoading: isUpdating }] =
    useUpdateMerchantUserMutation()
  const [proposeScope, { isLoading: isProposing }] =
    useCreateMerchantUserScopeProposalMutation()
  const canProposeScope = useScreenAccess('MERCHANT_USER').can('proposeScope')
  const form = useForm<MerchantUserForm>({
    resolver: zodResolver(merchantUserSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      phone: user?.phone ?? '',
      merchantIds: user?.merchantIds ?? []
    }
  })
  const selectedMerchantIds =
    useWatch({ control: form.control, name: 'merchantIds' }) ?? EMPTY_IDS
  const isScopeChanged = scope.isChanged(selectedMerchantIds)
  // Nhóm riêng chỉ hợp lệ khi User thuộc đúng Merchant sở hữu nhóm đó.
  const handleMerchantsChange = (merchantIds: string[]) => {
    scope.syncWithMerchants(merchantIds)
    setGroups((current) =>
      current.filter(
        (group) =>
          group.merchantId === null ||
          (merchantIds.length === 1 && group.merchantId === merchantIds[0])
      )
    )
  }

  const submit = async (values: MerchantUserForm): Promise<void> => {
    if (user) {
      await saveExisting(user, values)
      return
    }
    try {
      await createUser({
        email: values.email.trim().toLowerCase(),
        fullName: values.name.trim(),
        phone: values.phone,
        merchantIds: values.merchantIds,
        groupIds: groups.map((group) => group.id),
        subMerchantIds:
          values.merchantIds.length === 1 ? scope.subs.map((sub) => sub.id) : []
      }).unwrap()
      feedback.success('Đã tạo User ở trạng thái Chờ kích hoạt')
      onClose()
    } catch {
      feedback.error('Không thể lưu User')
    }
  }

  // Thông tin cá nhân lưu ngay; phạm vi Merchant chỉ tạo đề xuất chờ người khác duyệt.
  const saveExisting = async (
    current: MerchantUser,
    values: MerchantUserForm
  ): Promise<void> => {
    if (isScopeChanged && !scope.requireReason()) return
    try {
      await updateUser({
        id: current.id,
        body: { fullName: values.name.trim(), phone: values.phone }
      }).unwrap()
      if (isScopeChanged) {
        await proposeScope({
          id: current.id,
          merchantIds: values.merchantIds,
          subMerchantIds: scope.subs.map((sub) => sub.id),
          reason: scope.reason.trim()
        }).unwrap()
      }
      feedback.success(
        isScopeChanged
          ? 'Đã lưu thông tin User. Thay đổi phạm vi đã được gửi duyệt.'
          : 'Đã cập nhật User'
      )
      onClose()
    } catch {
      feedback.error('Không thể lưu User')
    }
  }

  return (
    <DialogModal
      footer={
        <div className='flex justify-end gap-2'>
          <ButtonComponent
            content='Hủy'
            htmlType='button'
            onClick={onClose}
            type='default'
          />
          <ButtonComponent
            loading={isCreating || isUpdating || isProposing}
            content={user ? 'Lưu thay đổi' : 'Thêm User'}
            form={FORM_ID}
            htmlType='submit'
          />
        </div>
      }
      onCancel={onClose}
      onOk={() => {
        void form.handleSubmit(submit)()
      }}
      open
      title={user ? 'Sửa thông tin User' : 'Thêm mới User'}
      width={{ xs: 'calc(100vw - 24px)', md: 640 }}
    >
      <form
        className='flex flex-col gap-4'
        id={FORM_ID}
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
          <FormInput
            className='min-w-0'
            control={form.control}
            label='Họ và tên'
            maxLength={100}
            name='name'
            placeholder='Họ và tên User'
            required
          />
          <FormInput
            className='min-w-0'
            control={form.control}
            disabled={Boolean(user)}
            label='Email'
            maxLength={100}
            name='email'
            placeholder='user@merchant.vn'
            required
          />
          <FormInput
            className='min-w-0'
            control={form.control}
            inputMode='numeric'
            label='Số điện thoại'
            maxLength={10}
            name='phone'
            placeholder='09xxxxxxxx'
            required
          />
        </div>
        <UserMerchantScopeField
          control={form.control}
          getMerchant={getMerchant}
          onMerchantsChange={handleMerchantsChange}
          disabled={Boolean(user) && !canProposeScope}
        />
        {user && (
          <UserSubMerchantField
            id='edit-user-subs'
            merchantIds={selectedMerchantIds}
            selected={scope.subs}
            disabled={!canProposeScope}
            onChange={scope.setSubs}
          />
        )}
        {isScopeChanged && (
          <ScopeChangeReasonField
            id='merchant-scope-reason'
            value={scope.reason}
            error={scope.reasonError}
            onChange={scope.changeReason}
          />
        )}
        {!user && (
          <UserInitialAccessFields
            merchantIds={selectedMerchantIds}
            groups={groups}
            subMerchants={scope.subs}
            getMerchant={getMerchant}
            onGroupsChange={setGroups}
            onSubMerchantsChange={scope.setSubs}
          />
        )}
      </form>
    </DialogModal>
  )
}
