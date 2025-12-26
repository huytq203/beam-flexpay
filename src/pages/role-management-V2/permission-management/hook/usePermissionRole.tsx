import { ButtonComponent } from '@components/common'
import { useGetPermissionQuery } from '@services/apiPermission'
import { useLazyGetMemberOfRoleQuery } from '@services/apiRole'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRoleItem } from '@type/roleManagement'
import React, { useState } from 'react'
import { PermissionManagementColumn } from '../PermissionManagement.column'
import { ResponseUserInfor, UserInfor } from '@type/userManagement'
import { useDeletePermissionAssignMutation, useLazyGetPermissionAvailableQuery, useLazyGetPermissionQuery, usePostPermissionAvailableMutation } from '@services/apiPermissionAsign'
import { PermissionItem } from '@type/permissionManagement'
import { useMessage } from '@hooks/useMessage'
export type ModeAction =
    | 'edit'
    | 'add'
    | 'view'
    | 'delete'
    | 'lock'
    | 'unlock'
    | 'permission'
    | ''
export const usePermissionRole = () => {

    // state
    const [openModalAdd, setOpenModalAdd] = useState(false)
    const [openModalDetail, setOpenModalDetail] = useState(false)
    const [openModalPermission, setOpenModalPermission] = useState(false)
    const [modeAction, setModeAction] = useState<ModeAction>('')
    const [modalDialog, setModalDialog] = useState(false)
    const [selectMember, setSelectMember] = useState<UserInfor[] | undefined>(undefined)
    const [selectRole, setSelectRole] = useState<PermissionItem[] | undefined>(undefined)
    const [isLoadingDetail, setIsLoadingDetail] = useState(false)
    const [idRole, setIdRole] = useState<string | undefined>(undefined)
    // hook
    const { errorMess, successMess } = useMessage()
    // api
    const deFaultPagination = {
        page: 1,
        size: 10,
        sortBy: 'id',
        sortDirection: 'DESC'
    }
    const { data: getRole } = useGetRoleQuery(deFaultPagination)
    const { data: getPermission } = useGetPermissionQuery({})
    const [getMemberOfRole, { isLoading: loadingGetMember }] = useLazyGetMemberOfRoleQuery()
    const [getPermissionAvailable] = useLazyGetPermissionAvailableQuery()
    const [getPermissionAssigned] = useLazyGetPermissionQuery()
    const [postPermission] = usePostPermissionAvailableMutation()
    const [deletePermissionAssign] = useDeletePermissionAssignMutation()
    // logic
    const handleDeletePermissionAssign = async (permissionNames: string[]) => {
        try {
            await deletePermissionAssign({
                roleId: idRole,
                body: { permissionNames }
            }).unwrap()
            successMess('Xóa quyền thành công')
        } catch (error: any) {
            errorMess(error?.data?.detail)
        }
    }
    const handleGetPermissionAssigned = async (roleId: string) => {
        setIsLoadingDetail(true)
        try {
            const data = await getPermissionAssigned(123).unwrap()
            setSelectRole(data.data.content ?? [])
            console.log(data)
            setIdRole(roleId)
            console.log('roleId:', roleId, 'data:', data)
        } catch     (error) {

        } finally {
            setIsLoadingDetail(false)
        }
    }

    const hanldePostPermission = async (permissionNames: string[]) => {
        try {
            await postPermission({
                roleId: idRole,
                body: { permissionNames }
            })
            setOpenModalPermission(false)
            successMess("Gán quyền thành công")
        } catch (error: any) {
            errorMess(error?.data?.detail)
        }
    }

    const handleGetPermissionAvailable = async (roleId: string) => {
        setIsLoadingDetail(true)
        try {
            const data = await getPermissionAvailable(roleId).unwrap()
            setSelectRole(data.data ?? [])
            setIdRole(roleId)
        } catch (error) {

        } finally {
            setIsLoadingDetail(false)
        }

    }
    const dataPermission: PermissionItem[] = selectRole?.map((item, index) => ({
        ...item
    })) ?? []


    const handleGetMemberOfRole = async (roleId: string) => {
        setIsLoadingDetail(true)
        try {
            const dataMember = await getMemberOfRole(roleId).unwrap()
            setSelectMember(dataMember?.content)
        } catch (error) {

        } finally {
            setIsLoadingDetail(false)
        }
    }


    const dataSource: DataRoleItem[] =
        getRole?.content.map((item, idx) => ({
            ...item,
            no: idx + 1
        })) ?? []

    const column = PermissionManagementColumn({
        setOpenModalDetail,
        setOpenModalAdd,
        setModeAction,
        setModalDialog,
        handleGetMemberOfRole,
        handleGetPermissionAvailable,
        setOpenModalPermission,
        handleGetPermissionAssigned


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
        selectMember,
        openModalPermission,
        setOpenModalPermission,

        dataSource,
        column,
        typeFooter,
        typeText,
        getPermission,
        loadingGetMember,
        isLoadingDetail,
        selectRole,
        dataPermission,

        handleGetMemberOfRole,
        handleGetPermissionAvailable,
        hanldePostPermission,
        handleDeletePermissionAssign
    }
}
