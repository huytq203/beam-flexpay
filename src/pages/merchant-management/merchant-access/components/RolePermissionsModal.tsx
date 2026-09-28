import { useMemo, useState } from 'react'

import {
  useUpdateMerchantGroupPermissionsMutation,
  useUpdateMerchantSystemGroupMutation
} from '@/app/services/merchantAccessApi'
import { ShieldCheckIcon } from '@components/icons'
import {
  ButtonComponent,
  CheckboxComponent,
  DialogModal,
  feedback
} from '@components/index'

import type {
  MerchantPermission,
  MerchantRole
} from '../types/merchantAccess.types'

const saveErrorMessage = (error: unknown): string => {
  const fallback = 'Không thể cập nhật quyền trong nhóm. Vui lòng thử lại.'
  if (typeof error !== 'object' || error === null || !('data' in error))
    return fallback
  const data = error.data
  if (typeof data !== 'object' || data === null) return fallback
  for (const key of ['detail', 'message', 'error']) {
    if (key in data && typeof data[key as keyof typeof data] === 'string') {
      const value = data[key as keyof typeof data] as string
      if (value.trim()) return value
    }
  }
  return fallback
}

interface Props {
  role: MerchantRole
  catalog: readonly MerchantPermission[]
  merchantName: string
  canEdit: boolean
  onClose: () => void
}

export function RolePermissionsModal({
  role,
  catalog,
  merchantName,
  canEdit,
  onClose
}: Props) {
  const [selected, setSelected] = useState<string[]>(role.permissions)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [updatePermissions, { isLoading: isUpdating }] =
    useUpdateMerchantGroupPermissionsMutation()
  const [updateSystemGroup, { isLoading: isUpdatingSystem }] =
    useUpdateMerchantSystemGroupMutation()
  const groups = useMemo(
    () => Array.from(new Set(catalog.map((item) => item.group))),
    [catalog]
  )
  const selectedCount = catalog.filter((item) =>
    selected.includes(item.code)
  ).length
  const hasChanges =
    selected.length !== role.permissions.length ||
    selected.some((code) => !role.permissions.includes(code))
  const saving = isUpdating || isUpdatingSystem
  const allSelected = catalog.length > 0 && selectedCount === catalog.length

  const toggleAll = (): void => {
    setErrorMessage(null)
    setSelected(allSelected ? [] : catalog.map((item) => item.code))
  }

  const toggleGroup = (codes: string[], checked: boolean): void => {
    setErrorMessage(null)
    setSelected((current) =>
      checked
        ? Array.from(new Set([...current, ...codes]))
        : current.filter((code) => !codes.includes(code))
    )
  }

  const save = async (): Promise<void> => {
    if (!canEdit || !hasChanges || saving) return
    if (selected.length === 0) {
      setErrorMessage('Vui lòng chọn ít nhất một quyền')
      feedback.warning('Vui lòng chọn ít nhất một quyền')
      return
    }
    setErrorMessage(null)
    try {
      if (role.system) {
        await updateSystemGroup({
          id: role.id,
          body: {
            code: role.code ?? '',
            name: role.name,
            description: role.description,
            permissions: selected
          }
        }).unwrap()
      } else {
        await updatePermissions({ id: role.id, permissions: selected }).unwrap()
      }
      feedback.success('Đã cập nhật quyền trong nhóm')
      onClose()
    } catch (error) {
      const message = saveErrorMessage(error)
      setErrorMessage(message)
      feedback.error(message)
    }
  }

  return (
    <DialogModal
      open
      title='Quản lý quyền trong nhóm'
      width={{ xs: 'calc(100vw - 24px)', md: 900 }}
      onCancel={onClose}
      onOk={() => void save()}
      footer={
        <div className='flex flex-wrap justify-end gap-2'>
          <ButtonComponent
            content='Đóng'
            htmlType='button'
            onClick={onClose}
            type='default'
          />
          {canEdit && (
            <ButtonComponent
              content='Lưu quyền'
              htmlType='button'
              disabled={!hasChanges || saving}
              loading={saving}
              onClick={() => void save()}
            />
          )}
        </div>
      }
    >
      <div className='mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4'>
        <div className='flex min-w-0 items-center gap-3'>
          <span
            aria-hidden
            className='flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary'
          >
            <ShieldCheckIcon size={20} />
          </span>
          <div className='min-w-0'>
            <h3 className='font-display text-base font-semibold text-foreground'>
              {role.name}
            </h3>
            <p className='text-sm text-muted-foreground'>
              {merchantName} · {role.description}
            </p>
          </div>
        </div>
        <div className='flex flex-wrap items-center gap-2'>
          <span
            aria-live='polite'
            className='rounded-md bg-muted px-2 py-1 text-xs font-semibold text-foreground tabular-nums'
          >
            {selectedCount}/{catalog.length} quyền
          </span>
          {canEdit && catalog.length > 0 && (
            <ButtonComponent
              content={allSelected ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              htmlType='button'
              size='small'
              type='default'
              disabled={saving}
              onClick={toggleAll}
            />
          )}
        </div>
      </div>
      {errorMessage && (
        <p
          role='alert'
          className='mb-4 rounded-md border border-danger-strong/30 bg-danger/5 px-3 py-2 text-sm text-danger-strong'
        >
          {errorMessage}
        </p>
      )}
      {catalog.length === 0 ? (
        <p
          role='status'
          className='py-8 text-center text-sm text-muted-foreground'
        >
          Danh mục quyền chưa có dữ liệu.
        </p>
      ) : (
        <div className='grid gap-3 md:grid-cols-2'>
          {groups.map((group) => {
            const items = catalog.filter((item) => item.group === group)
            const count = items.filter((item) =>
              selected.includes(item.code)
            ).length
            return (
              <section
                className='overflow-hidden rounded-lg border border-border'
                key={group}
                role='group'
                aria-label={group}
              >
                <div className='flex items-center justify-between gap-2 bg-muted px-3 py-2'>
                  <h4 className='text-sm font-semibold text-foreground'>
                    <CheckboxComponent
                      checked={count === items.length}
                      indeterminate={count > 0 && count < items.length}
                      disabled={!canEdit || saving}
                      onChange={(event) =>
                        toggleGroup(
                          items.map((item) => item.code),
                          event.target.checked
                        )
                      }
                    >
                      {group}
                    </CheckboxComponent>
                  </h4>
                  <span className='text-xs text-muted-foreground tabular-nums'>
                    {count}/{items.length}
                  </span>
                </div>
                <div className='grid gap-2 p-3'>
                  {items.map((item) => (
                    <CheckboxComponent
                      key={item.code}
                      checked={selected.includes(item.code)}
                      disabled={!canEdit || saving}
                      onChange={(event) => {
                        setErrorMessage(null)
                        setSelected((current) =>
                          event.target.checked
                            ? [...current, item.code]
                            : current.filter((code) => code !== item.code)
                        )
                      }}
                    >
                      <span className='text-sm text-foreground'>
                        {item.label}
                      </span>
                    </CheckboxComponent>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </DialogModal>
  )
}
