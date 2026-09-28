import { useAccessLookups } from '../hooks/useAccessLookups'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { useMemo, useState } from 'react'

import { FormField, FormInput } from '@components/form'
import {
  ButtonComponent,
  DialogModal,
  SelectComponent,
  feedback
} from '@components/index'
import {
  useCreateMerchantUserMutation,
  useUpdateMerchantUserMutation,
  useAssignMerchantUserMerchantsMutation,
  useListMerchantGroupsQuery
} from '@/app/services/merchantAccessApi'

import { toMerchantRole } from '../dto/merchantAccess.api'
import {
  merchantUserSchema,
  type MerchantUserForm
} from '../schemas/merchantAccess.schemas'
import type { MerchantUser } from '../types/merchantAccess.types'

const FORM_ID = 'merchant-user-editor'
const EMPTY_IDS: string[] = []

export function UserEditorModal({
  user,
  onClose
}: {
  user: MerchantUser | null
  onClose: () => void
}) {
  const { merchants, subMerchants } = useAccessLookups()
  const groupsQuery = useListMerchantGroupsQuery(
    { page: 1, size: 100 },
    { skip: Boolean(user) }
  )
  const [groupIds, setGroupIds] = useState<string[]>([])
  const [subMerchantIds, setSubMerchantIds] = useState<string[]>([])
  const [createUser, { isLoading: isCreating }] =
    useCreateMerchantUserMutation()
  const [updateUser, { isLoading: isUpdating }] =
    useUpdateMerchantUserMutation()
  const [assignMerchants, { isLoading: isAssigning }] =
    useAssignMerchantUserMerchantsMutation()
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
  const availableGroups = useMemo(
    () =>
      (groupsQuery.data?.content ?? [])
        .map(toMerchantRole)
        .filter(
          (group) =>
            group.merchantId === null ||
            (selectedMerchantIds.length === 1 &&
              group.merchantId === selectedMerchantIds[0])
        ),
    [groupsQuery.data, selectedMerchantIds]
  )
  const availableSubs = subMerchants.filter((sub) =>
    selectedMerchantIds.includes(sub.merchantId)
  )

  const submit = async (values: MerchantUserForm): Promise<void> => {
    try {
      if (user) {
        await updateUser({
          id: user.id,
          body: { fullName: values.name.trim(), phone: values.phone }
        }).unwrap()
        if (values.merchantIds.join(',') !== user.merchantIds.join(',')) {
          await assignMerchants({
            id: user.id,
            ids: values.merchantIds
          }).unwrap()
        }
      } else {
        await createUser({
          email: values.email.trim().toLowerCase(),
          fullName: values.name.trim(),
          phone: values.phone,
          merchantIds: values.merchantIds,
          groupIds: groupIds.filter((id) =>
            availableGroups.some((group) => group.id === id)
          ),
          subMerchantIds:
            values.merchantIds.length === 1
              ? subMerchantIds.filter((id) =>
                  availableSubs.some((sub) => sub.id === id)
                )
              : []
        }).unwrap()
      }
      feedback.success(
        user ? 'Đã cập nhật User' : 'Đã tạo User ở trạng thái Chờ kích hoạt'
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
            loading={isCreating || isUpdating || isAssigning}
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
      <p className='mb-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground'>
        {user
          ? 'Nhóm quyền và Sub-merchant được thay đổi tại thao tác Phân quyền.'
          : 'Chọn Merchant quản lý, sau đó gán nhóm quyền và Sub-merchant phù hợp.'}
      </p>
      <form
        className='grid gap-4 sm:grid-cols-2'
        id={FORM_ID}
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <FormInput
          className='flex flex-col gap-1'
          control={form.control}
          label='Họ và tên'
          maxLength={100}
          name='name'
          placeholder='Họ và tên User'
          required
        />
        <FormInput
          className='flex flex-col gap-1'
          control={form.control}
          disabled={Boolean(user)}
          label='Email'
          maxLength={100}
          name='email'
          placeholder='user@merchant.vn'
          required
        />
        <FormInput
          className='flex flex-col gap-1'
          control={form.control}
          inputMode='numeric'
          label='Số điện thoại'
          maxLength={10}
          name='phone'
          placeholder='09xxxxxxxx'
          required
        />
        <FormField
          control={form.control}
          label='Merchant trong phạm vi quản lý'
          name='merchantIds'
          required
          className='flex flex-col gap-1 sm:col-span-2'
          render={(field) => (
            <SelectComponent<string[]>
              id={field.name}
              mode='multiple'
              onBlur={field.onBlur}
              onChange={field.onChange}
              optionFilterProp='label'
              options={merchants.map((merchant) => ({
                label: `${merchant.code} — ${merchant.name}`,
                value: merchant.id
              }))}
              placeholder='Chọn Merchant'
              showSearch
              value={Array.isArray(field.value) ? field.value : []}
            />
          )}
        />
        {!user && (
          <div className='space-y-4 sm:col-span-2'>
            <div className='border-t border-border pt-4'>
              <h3 className='mb-3 text-sm font-semibold text-foreground'>
                Phân quyền ban đầu
              </h3>
              <div className='grid gap-4 sm:grid-cols-2'>
                <div className='flex flex-col gap-1'>
                  <label
                    className='text-sm font-medium text-foreground'
                    htmlFor='new-user-groups'
                  >
                    Nhóm quyền
                  </label>
                  <SelectComponent<string[]>
                    id='new-user-groups'
                    className='w-full'
                    mode='multiple'
                    value={groupIds.filter((id) =>
                      availableGroups.some((group) => group.id === id)
                    )}
                    onChange={setGroupIds}
                    options={availableGroups.map((group) => ({
                      value: group.id,
                      label: `${group.name} · ${group.merchantId ? merchants.find((merchant) => merchant.id === group.merchantId)?.name : 'Dùng chung'}`
                    }))}
                    placeholder='Chọn nhóm quyền'
                  />
                </div>
                <div className='flex flex-col gap-1'>
                  <label
                    className='text-sm font-medium text-foreground'
                    htmlFor='new-user-subs'
                  >
                    Sub-merchant được truy cập
                  </label>
                  <SelectComponent<string[]>
                    id='new-user-subs'
                    className='w-full'
                    mode='multiple'
                    disabled={selectedMerchantIds.length !== 1}
                    value={subMerchantIds.filter((id) =>
                      availableSubs.some((sub) => sub.id === id)
                    )}
                    onChange={setSubMerchantIds}
                    options={availableSubs.map((sub) => ({
                      value: sub.id,
                      label: sub.name
                    }))}
                    placeholder={
                      selectedMerchantIds.length === 1
                        ? 'Chọn Sub-merchant'
                        : 'Chọn một Merchant'
                    }
                  />
                </div>
              </div>
              {selectedMerchantIds.length > 1 && (
                <p className='mt-2 text-xs text-muted-foreground'>
                  User quản lý nhiều Merchant chỉ dùng nhóm quyền dùng chung.
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </DialogModal>
  )
}
