import { CardComponent } from '@components/common'
import { FormInput, FormCheckbox } from '@components/form'
import React, { useMemo, useCallback } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { Checkbox } from 'antd'

// Permission types
type PermissionAction = 'approve' | 'view' | 'add' | 'edit' | 'delete'

interface PermissionItem {
    key: string
    name: string
    parentKey?: string
}

interface PermissionGroup {
    key: string
    title: string
    items: PermissionItem[]
}

const permissionGroups: PermissionGroup[] = [
    {
        key: 'admin_permissions',
        title: 'Quản lý tài khoản Admin và phân quyền',
        items: [
            { key: 'admin_account', name: 'Quản lý tài khoản admin và phân quyền' },
            { key: 'group_permission', name: 'Quản lý nhóm quyền' },
        ],
    },
    {
        key: 'personal_wallet',
        title: 'Quản lý Tài khoản ví cá nhân',
        items: [
            { key: 'personal_wallet_group', name: 'Quản lý Nhóm tài khoản ví cá nhân' },
            { key: 'personal_wallet_account', name: 'Quản lý Tài khoản ví cá nhân' },
            { key: 'personal_wallet_transaction', name: 'Quản lý Giao dịch ví cá nhân' },
        ],
    },
    {
        key: 'merchant_wallet',
        title: 'Quản lý Đơn vị thẻ',
        items: [
            { key: 'merchant_group', name: 'Quản lý Nhóm đơn vị thẻ' },
            { key: 'merchant_account', name: 'Quản lý Tài khoản đơn vị thẻ' },
            { key: 'merchant_transaction', name: 'Quản lý Giao dịch đơn vị thẻ' },
        ],
    },
]

const actions: { key: PermissionAction; label: string }[] = [
    { key: 'approve', label: 'Duyệt' },
    { key: 'view', label: 'Xem' },
    { key: 'add', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'delete', label: 'Xóa' },
]

const generateFieldName = (itemKey: string, action: PermissionAction) =>
    `permissions.${itemKey}.${action}` as const

export const FormAdd = () => {
    const { control, setValue, getValues } = useForm({
        defaultValues: {
            name: '',
            permissions: {} as Record<string, Record<PermissionAction, boolean>>,
        },
    })

    const permissions = useWatch({ control, name: 'permissions' })

    const handleSelectAllGroup = useCallback(
        (group: PermissionGroup, selectAll: boolean) => {
            group.items.forEach((item) => {
                actions.forEach((action) => {
                    setValue(`permissions.${item.key}.${action.key}` as any, selectAll)
                })
            })
        },
        [setValue]
    )

    const isGroupAllSelected = useCallback(
        (group: PermissionGroup) => {
            if (!permissions) return false
            return group.items.every((item) =>
                actions.every((action) => permissions[item.key]?.[action.key])
            )
        },
        [permissions]
    )

    const isGroupPartialSelected = useCallback(
        (group: PermissionGroup) => {
            if (!permissions) return false
            const hasAny = group.items.some((item) =>
                actions.some((action) => permissions[item.key]?.[action.key])
            )
            return hasAny && !isGroupAllSelected(group)
        },
        [permissions, isGroupAllSelected]
    )

    // Check if any action other than 'view' is selected for an item
    const hasOtherActionsSelected = useCallback(
        (itemKey: string) => {
            if (!permissions) return false
            const otherActions: PermissionAction[] = ['approve', 'add', 'edit', 'delete']
            return otherActions.some((action) => permissions[itemKey]?.[action])
        },
        [permissions]
    )

    // Handle permission change - auto enable 'view' when selecting other actions
    const handlePermissionChange = useCallback(
        (itemKey: string, actionKey: PermissionAction, checked: boolean) => {
            setValue(`permissions.${itemKey}.${actionKey}` as any, checked)

            // If selecting any action other than 'view', auto-enable 'view'
            if (actionKey !== 'view' && checked) {
                setValue(`permissions.${itemKey}.view` as any, true)
            }
        },
        [setValue]
    )

    return (
        <div>
            <CardComponent
                content={
                    <form>
                        <div className="flex flex-col gap-4">
                            <FormInput
                                label={
                                    <span>
                                        Tên nhóm quyền: <span className="text-red-700">*</span>
                                    </span>
                                }
                                name="name"
                                control={control}
                                placeholder="Nhập tên nhóm quyền..."
                                className="flex flex-col gap-1"
                            />

                            {/* Permission Table */}
                            <div className="border rounded-lg overflow-hidden">
                                {/* Table Header */}
                                <div
                                    className="grid bg-gray-50 font-semibold text-sm border-b"
                                    style={{ gridTemplateColumns: '5fr repeat(5, 1fr)' }}
                                >
                                    <div className="p-3 border-r">Chức năng</div>
                                    {actions.map((action) => (
                                        <div key={action.key} className="p-3 text-center border-r last:border-r-0">
                                            {action.label}
                                        </div>
                                    ))}
                                </div>

                                {/* Permission Groups */}
                                {permissionGroups.map((group) => (
                                    <div key={group.key}>
                                        {/* Group Header */}
                                        <div
                                            className="grid bg-gray-100  font-medium"
                                            style={{ gridTemplateColumns: '1fr' }}
                                        >
                                            <div className="p-3 flex items-center gap-2 border-r">
                                                <Checkbox
                                                    checked={isGroupAllSelected(group)}
                                                    indeterminate={isGroupPartialSelected(group)}
                                                    onChange={(e) => handleSelectAllGroup(group, e.target.checked)}
                                                />
                                                <span>{group.title}</span>
                                            </div>
                                            <div className="col-span-5"></div>
                                        </div>

                                        {/* Group Items */}
                                        {group.items.map((item) => (
                                            <div
                                                key={item.key}
                                                className="grid border-b last:border-b-0 hover:bg-gray-50"
                                                style={{ gridTemplateColumns: '5fr repeat(5, 1fr)' }}
                                            >
                                                <div className="p-3 pl-8 border-r">{item.name}</div>
                                                {actions.map((action) => {
                                                    const isViewAction = action.key === 'view'
                                                    const isViewDisabled = isViewAction && hasOtherActionsSelected(item.key)
                                                    const isChecked = permissions?.[item.key]?.[action.key] ?? false

                                                    return (
                                                        <div key={action.key} className="p-3 flex justify-center items-center border-r last:border-r-0">
                                                            <Checkbox
                                                                checked={isChecked}
                                                                disabled={isViewDisabled}
                                                                onChange={(e) => handlePermissionChange(item.key, action.key, e.target.checked)}
                                                            />
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                }
            />
        </div>
    )
}
