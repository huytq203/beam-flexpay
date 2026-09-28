import { usePermissionCatalog } from '../hooks/usePermissionCatalog'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { FormInput, FormTextArea } from '@components/form'
import {
  ButtonComponent,
  CheckboxComponent,
  DialogModal,
  feedback
} from '@components/index'
import {
  useCreateMerchantGroupMutation,
  useCreateMerchantSystemGroupMutation,
  useUpdateMerchantGroupMutation,
  useUpdateMerchantSystemGroupMutation
} from '@/app/services/merchantAccessApi'
import { PERMISSION, useAccess } from '@/app/permissions'

import {
  merchantRoleSchema,
  type MerchantRoleForm
} from '../schemas/merchantAccess.schemas'
import type { MerchantRole } from '../types/merchantAccess.types'
import { RoleScopeField } from './RoleScopeField'

const FORM_ID = 'merchant-role-editor'

export function RoleEditorModal({
  role,
  existingRoles,
  onClose
}: {
  role: MerchantRole | null
  existingRoles: readonly MerchantRole[]
  onClose: () => void
}) {
  const { permissions: catalog } = usePermissionCatalog()
  const canManageSystemGroups = useAccess().has(
    PERMISSION.MERCHANT_SYSTEM_GROUP_MANAGE
  )
  const [createGroup, { isLoading: isCreating }] =
    useCreateMerchantGroupMutation()
  const [createSystemGroup, { isLoading: isCreatingSystem }] =
    useCreateMerchantSystemGroupMutation()
  const [updateGroup, { isLoading: isUpdating }] =
    useUpdateMerchantGroupMutation()
  const [updateSystemGroup, { isLoading: isUpdatingSystem }] =
    useUpdateMerchantSystemGroupMutation()
  const form = useForm<MerchantRoleForm>({
    resolver: zodResolver(merchantRoleSchema),
    defaultValues: {
      code: role?.code ?? '',
      name: role?.name ?? '',
      description: role?.description ?? '',
      merchantId: role?.merchantId ?? (canManageSystemGroups ? 'shared' : '')
    }
  })
  const [permissions, setPermissions] = useState<string[]>(
    role?.permissions ?? []
  )
  const groups = useMemo(
    () => Array.from(new Set(catalog.map((permission) => permission.group))),
    [catalog]
  )

  const submit = async (values: MerchantRoleForm): Promise<void> => {
    const name = values.name.trim()
    const merchantId = values.merchantId === 'shared' ? null : values.merchantId
    if (
      existingRoles.some(
        (row) =>
          row.id !== role?.id &&
          row.merchantId === merchantId &&
          row.name.toLocaleLowerCase('vi-VN') ===
            name.toLocaleLowerCase('vi-VN')
      )
    ) {
      form.setError('name', {
        message: 'Tên nhóm quyền đã tồn tại trong phạm vi này'
      })
      return
    }
    if (permissions.length === 0) {
      feedback.warning('Vui lòng chọn ít nhất một quyền')
      return
    }
    const body = {
      code: values.code.trim(),
      name,
      description: values.description.trim(),
      merchantId: merchantId ?? undefined,
      permissions
    }
    try {
      if (role?.system) await updateSystemGroup({ id: role.id, body }).unwrap()
      else if (role) await updateGroup({ id: role.id, body }).unwrap()
      else if (merchantId === null) await createSystemGroup(body).unwrap()
      else await createGroup(body).unwrap()
      feedback.success(role ? 'Đã cập nhật nhóm quyền' : 'Đã thêm nhóm quyền')
      onClose()
    } catch {
      feedback.error('Không thể lưu nhóm quyền')
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
            loading={
              isCreating || isCreatingSystem || isUpdating || isUpdatingSystem
            }
            content={role ? 'Lưu thay đổi' : 'Thêm nhóm quyền'}
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
      title={role ? 'Cập nhật nhóm quyền' : 'Thêm mới nhóm quyền'}
      width={{ xs: 'calc(100vw - 24px)', md: 760 }}
    >
      <form
        className='grid gap-4 sm:grid-cols-2'
        id={FORM_ID}
        noValidate
        onSubmit={form.handleSubmit(submit)}
      >
        <FormInput
          className='flex flex-col gap-1'
          control={form.control}
          label='Tên nhóm quyền'
          maxLength={100}
          name='name'
          placeholder='Ví dụ: Quản lý chi nhánh'
          required
        />
        <FormInput
          className='flex flex-col gap-1'
          control={form.control}
          disabled={Boolean(role)}
          label='Mã nhóm'
          maxLength={50}
          name='code'
          placeholder='VD: BRANCH_MANAGER'
          required
        />
        <RoleScopeField
          control={form.control}
          locked={Boolean(role)}
          canManageSystemGroups={canManageSystemGroups}
        />
        <FormTextArea
          className='flex flex-col gap-1 sm:col-span-2'
          control={form.control}
          label='Mô tả'
          maxLength={300}
          name='description'
          placeholder='Nhóm quyền này dành cho ai và có thể làm gì?'
          required
          rows={2}
        />
      </form>
      <div className='mt-5 space-y-3'>
        <div className='flex flex-wrap items-center justify-between gap-2'>
          <div>
            <h3 className='font-semibold text-foreground'>Danh mục quyền</h3>
            <p className='text-xs text-muted-foreground'>
              Chọn các quyền cần có trong nhóm. {permissions.length}/
              {catalog.length} quyền đã chọn.
            </p>
          </div>
          <ButtonComponent
            content={
              permissions.length === catalog.length
                ? 'Bỏ chọn tất cả'
                : 'Chọn tất cả'
            }
            htmlType='button'
            onClick={() =>
              setPermissions(
                permissions.length === catalog.length
                  ? []
                  : catalog.map((item) => item.code)
              )
            }
            size='small'
            type='default'
          />
        </div>
        <div className='grid max-h-72 gap-3 overflow-y-auto pr-1 md:grid-cols-2'>
          {groups.map((group) => {
            const items = catalog.filter(
              (permission) => permission.group === group
            )
            const allSelected = items.every((item) =>
              permissions.includes(item.code)
            )
            return (
              <section
                className='rounded-lg border border-border p-3'
                key={group}
              >
                <CheckboxComponent
                  checked={allSelected}
                  indeterminate={
                    !allSelected &&
                    items.some((item) => permissions.includes(item.code))
                  }
                  onChange={(event) =>
                    setPermissions((current) =>
                      event.target.checked
                        ? Array.from(
                            new Set([
                              ...current,
                              ...items.map((item) => item.code)
                            ])
                          )
                        : current.filter(
                            (code) => !items.some((item) => item.code === code)
                          )
                    )
                  }
                >
                  <strong className='text-sm text-foreground'>{group}</strong>
                </CheckboxComponent>
                <div className='mt-2 space-y-2 pl-6'>
                  {items.map((item) => (
                    <div
                      className='flex items-start gap-2'
                      key={item.code}
                    >
                      <CheckboxComponent
                        aria-label={item.label}
                        checked={permissions.includes(item.code)}
                        onChange={(event) =>
                          setPermissions((current) =>
                            event.target.checked
                              ? [...current, item.code]
                              : current.filter((code) => code !== item.code)
                          )
                        }
                      />
                      <span className='min-w-0'>
                        <span className='block text-xs font-medium text-foreground'>
                          {item.label}
                        </span>
                        <span className='block text-xs text-muted-foreground'>
                          {item.description}
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      </div>
    </DialogModal>
  )
}
