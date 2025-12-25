import { ButtonComponent, CardComponent } from '@components/common'
import { FormInput } from '@components/form'
import React, { useMemo, useCallback, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Checkbox } from 'antd'
import {
    PermissionItem,
    ParsedPermission,
    groupPermissionsByType,
    getFullPermission,
    getTypeLabel,
    getActionLabel,
    ACTION_ORDER
} from '../utils/permissionUtils'

interface FormData {
    name: string
    description: string
}

interface Props {
    permissions: PermissionItem[]
    onSubmit?: (data: { name: string; description: string; permissionIds: string[] }) => Promise<void>
    onCancel?: () => void
    initialData?: {
        name: string
        description: string
        permissionIds: string[]
    }
    modeAction?: 'add' | 'update' | ''
}

export const FormAdd = ({ permissions = [], onSubmit, onCancel, initialData, modeAction = 'add' }: Props) => {
    const { control, handleSubmit, reset } = useForm<FormData>({
        defaultValues: {
            name: initialData?.name || '',
            description: initialData?.description || ''
        }
    })

    // State to track selected permission IDs
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialData?.permissionIds || []))

    // Reset form when initialData changes
    useEffect(() => {
        if (initialData) {
            reset({
                name: initialData.name,
                description: initialData.description
            })
            setSelectedIds(new Set(initialData.permissionIds))
        }
    }, [initialData, reset])

    // Ensure permissions is an array
    const safePermissions = Array.isArray(permissions) ? permissions : []

    // Group permissions by type
    const groupedPermissions = useMemo(() => {
        if (!safePermissions.length) return {}
        return groupPermissionsByType(safePermissions)
    }, [safePermissions])

    // Get all unique types
    const types = useMemo(() => {
        return Object.keys(groupedPermissions)
    }, [groupedPermissions])

    // Debug logging
    console.log('FormAdd - safePermissions:', safePermissions)
    console.log('FormAdd - groupedPermissions:', groupedPermissions)
    console.log('FormAdd - types:', types)

    // Get all unique actions across all types (excluding FULL, but include FULL if it's the only action for any type)
    const allActions = useMemo(() => {
        const actionsSet = new Set<string>()
        let hasOnlyFullTypes = false
        
        Object.values(groupedPermissions).forEach(typePerms => {
            const nonFullPerms = typePerms.filter(p => p.action !== 'FULL')
            if (nonFullPerms.length === 0 && typePerms.some(p => p.action === 'FULL')) {
                // This type only has FULL
                hasOnlyFullTypes = true
            }
            nonFullPerms.forEach(p => actionsSet.add(p.action))
        })
        
        // Sort by ACTION_ORDER
        const orderedActions = ACTION_ORDER.filter(action => actionsSet.has(action))
        
        // If there are types with only FULL, add FULL as a column
        if (hasOnlyFullTypes) {
            orderedActions.push('FULL')
        }
        
        return orderedActions
    }, [groupedPermissions])

    // Toggle single permission
    const togglePermission = useCallback((permissionId: string) => {
        setSelectedIds(prev => {
            const newSet = new Set(prev)
            if (newSet.has(permissionId)) {
                newSet.delete(permissionId)
            } else {
                newSet.add(permissionId)
            }
            return newSet
        })
    }, [])

    // Check if a permission is selected
    const isSelected = useCallback((permissionId: string) => {
        return selectedIds.has(permissionId)
    }, [selectedIds])

    // Get permission by type and action
    const getPermission = useCallback((type: string, action: string): ParsedPermission | undefined => {
        return groupedPermissions[type]?.find(p => p.action === action)
    }, [groupedPermissions])

    // Check if all actions for a type are selected
    const isTypeAllSelected = useCallback((type: string) => {
        const typePerms = groupedPermissions[type]
        if (!typePerms) return false

        const individualPerms = typePerms.filter(p => p.action !== 'FULL')
        
        // If type only has FULL, check if FULL is selected
        if (individualPerms.length === 0) {
            const fullPerm = typePerms.find(p => p.action === 'FULL')
            return fullPerm ? selectedIds.has(fullPerm.id) : false
        }
        
        return individualPerms.every(p => selectedIds.has(p.id))
    }, [groupedPermissions, selectedIds])

    // Check if type is partially selected
    const isTypePartialSelected = useCallback((type: string) => {
        const typePerms = groupedPermissions[type]
        if (!typePerms) return false

        const individualPerms = typePerms.filter(p => p.action !== 'FULL')
        
        // If type only has FULL, it can't be partially selected
        if (individualPerms.length === 0) return false
        
        const selectedCount = individualPerms.filter(p => selectedIds.has(p.id)).length
        return selectedCount > 0 && selectedCount < individualPerms.length
    }, [groupedPermissions, selectedIds])

    // Toggle all permissions for a type
    const toggleTypeAll = useCallback((type: string, selectAll: boolean) => {
        const typePerms = groupedPermissions[type]
        if (!typePerms) return

        setSelectedIds(prev => {
            const newSet = new Set(prev)
            const individualPerms = typePerms.filter(p => p.action !== 'FULL')
            
            if (individualPerms.length === 0) {
                // Type only has FULL, toggle the FULL permission
                const fullPerm = typePerms.find(p => p.action === 'FULL')
                if (fullPerm) {
                    if (selectAll) {
                        newSet.add(fullPerm.id)
                    } else {
                        newSet.delete(fullPerm.id)
                    }
                }
            } else {
                // Type has individual permissions
                individualPerms.forEach(p => {
                    if (selectAll) {
                        newSet.add(p.id)
                    } else {
                        newSet.delete(p.id)
                    }
                })
            }
            return newSet
        })
    }, [groupedPermissions])

    // Get final permission IDs for submission
    // If all actions for a type are selected, submit FULL permission instead
    const getFinalPermissionIds = useCallback((): string[] => {
        const finalIds: string[] = []

        types.forEach(type => {
            const typePerms = groupedPermissions[type]
            const fullPerm = getFullPermission(typePerms)
            const individualPerms = typePerms.filter(p => p.action !== 'FULL')

            if (individualPerms.length === 0) {
                // Type only has FULL, check if FULL is selected
                if (fullPerm && selectedIds.has(fullPerm.id)) {
                    finalIds.push(fullPerm.id)
                }
            } else {
                // Check if all individual permissions for this type are selected
                const allSelected = individualPerms.every(p => selectedIds.has(p.id))

                if (allSelected && fullPerm) {
                    // If all selected and FULL exists, only submit FULL
                    finalIds.push(fullPerm.id)
                } else {
                    // Otherwise submit individually selected permissions
                    individualPerms.forEach(p => {
                        if (selectedIds.has(p.id)) {
                            finalIds.push(p.id)
                        }
                    })
                }
            }
        })

        return finalIds
    }, [types, groupedPermissions, selectedIds])

    // Handle form submission
    const handleFormSubmit = async (data: FormData) => {
        if (onSubmit) {
            const permissionIds = getFinalPermissionIds()
            console.log('Submitting permissions:', permissionIds)
            await onSubmit({
                name: data.name,
                description: data.description,
                permissionIds
            })
        }
    }

    return (
        <div>
            <CardComponent
                content={
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
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
                            {types.length === 0 ? (
                                <div className="border rounded-lg p-8 text-center text-gray-500">
                                    {safePermissions.length === 0 
                                        ? 'Đang tải danh sách quyền...' 
                                        : 'Không tìm thấy quyền nào'}
                                </div>
                            ) : (
                            <div className="border rounded-lg overflow-hidden">
                                {/* Table Header */}
                                <div
                                    className="grid bg-gray-50 font-semibold text-sm border-b"
                                    style={{ gridTemplateColumns: `3fr repeat(${allActions.length || 1}, 1fr)` }}
                                >
                                    <div className="p-3 border-r">Chức năng</div>
                                    {allActions.map((action) => (
                                        <div key={action} className="p-3 text-center border-r last:border-r-0">
                                            {getActionLabel(action)}
                                        </div>
                                    ))}
                                </div>

                                {/* Permission Groups */}
                                {types.map((type) => (
                                    <div key={type}>
                                        {/* Group Header with Select All */}
                                        <div
                                            className="grid  font-medium border-b"
                                            style={{ gridTemplateColumns: `3fr repeat(${allActions.length}, 1fr)` }}
                                        >
                                            <div className="p-3 flex items-center gap-2 border-r">
                                                <span>{getTypeLabel(type)}</span>
                                            </div>
                                            {/* Action checkboxes in header row */}
                                            {allActions.map((action) => {
                                                const permission = getPermission(type, action)
                                                if (!permission) {
                                                    return (
                                                        <div key={action} className="p-3 flex justify-center items-center border-r last:border-r-0">
                                                            <span className="text-gray-300">-</span>
                                                        </div>
                                                    )
                                                }
                                                return (
                                                    <div key={action} className="p-3 flex justify-center items-center border-r last:border-r-0">
                                                        <Checkbox
                                                            checked={isSelected(permission.id)}
                                                            onChange={() => togglePermission(permission.id)}
                                                        />
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                            )}

                            {/* Form Actions */}
                            <div className="flex justify-end gap-2 mt-4">
                                <ButtonComponent type="default" content="Hủy" onClick={onCancel} />
                                <ButtonComponent
                                    type="primary"
                                    content={modeAction === 'update' ? 'Cập nhật' : 'Thêm mới'}
                                    htmlType="submit"
                                />
                            </div>
                        </div>
                    </form>
                }
            />
        </div>
    )
}

export default FormAdd
