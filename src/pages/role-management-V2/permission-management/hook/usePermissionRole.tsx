import { ButtonComponent } from '@components/common'
import { useGetPermissionQuery } from '@services/apiPermission'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRoleItem } from '@type/roleManagement'
import React, { useState } from 'react'
import { PermissionManagementColumn } from '../PermissionManagement.column'
export type ModeAction =
    | 'edit'
    | 'add'
    | 'view'
    | 'delete'
    | 'lock'
    | 'unlock'
    | ''
export const usePermissionRole = () => {

    // state
    const [openModalAdd, setOpenModalAdd] = useState(false)
    const [openModalDetail, setOpenModalDetail] = useState(false)
    const [modeAction, setModeAction] = useState<ModeAction>('')
    const [modalDialog, setModalDialog] = useState(false)

    // api
    const deFaultPagination = {
        page: 1,
        size: 10,
        sortBy: 'id',
        sortDirection: 'DESC'
    }
    const { data: getRole } = useGetRoleQuery(deFaultPagination)
    const { data: getPermission } = useGetPermissionQuery({})
    // logic
    const dataSource: DataRoleItem[] =
        getRole?.content.map((item, idx) => ({
            ...item,
            no: idx + 1
        })) ?? []
    console.log(getPermission)
    const column = PermissionManagementColumn({
        setOpenModalDetail,
        setOpenModalAdd,
        setModeAction,
        setModalDialog
    })
    const typeFooter: Partial<Record<ModeAction, JSX.Element>> = {
        delete: (
            <div className='flex justify-end items-center gap-2'>
                <ButtonComponent
                    type='default'
                    content='Cancel'
                />
                <ButtonComponent
                    type='primary'
                    danger
                    content='Delete'
                />
            </div>
        )
    }
    const typeText: Partial<Record<ModeAction, JSX.Element>> = {
        delete: (
            <span>
                Bạn có chắc chắn muốn khóa nhóm quyền{' '}
                <span className='font-bold'>AAA</span> không? Hành động này không thể
                hoàn tác.
            </span>
        ),
        lock: (
            <span>
                Bạn có chắc chắn muốn khóa nhóm quyền{' '}
                <span className='font-bold'>AAA</span> không?
            </span>
        ),
        unlock: (
            <span>
                Bạn có chắc chắn muốn mở khóa <span className='font-bold'>AAA</span>{' '}
                không?
            </span>
        )
    }

    return {
        openModalAdd,
        setOpenModalAdd,
        openModalDetail,
        setOpenModalDetail,
        modeAction,
        setModeAction,
        modalDialog,
        setModalDialog,

        dataSource,
        column,
        typeFooter,
        typeText,
        getPermission,
    }
}
