import { useState } from 'react'
import {
    useDeletePermissionMutation,
    useGetPermissionQuery,
    useLazyGetPermissionByKeyQuery,
    usePostPermissionMutation,
    usePutPermissionMutation
} from '@services/apiPermission'
import { RoleDataItem, RoleData } from '@type/roleManagementV2'
import { useMessage } from '@hooks/useMessage'
import { SearchFormData } from '../components/FormSearch'
import { ButtonComponent } from '@components/common'
import { PermissionItem } from '@type/permissionManagement'

export type ModeAction = 'add' | 'update' | 'delete' | 'lock' | 'unlock' | ''

export const useRoleManagement = () => {
    // state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [openModalAdd, setOpenModalAdd] = useState(false)
    const [modeAction, setModeAction] = useState<ModeAction>('')
    const [selectedPermission, setSelectedPermission] = useState<RoleDataItem | undefined>(undefined)
    const [isSearchMode, setIsSearchMode] = useState(false)
    const [searchData, setSearchData] = useState<RoleData | null>(null)
    const [openDialog, setOpenDialog] = useState(false)

    // hook
    const { errorMess, successMess } = useMessage()

    // api
    const paginationParams = {
        page: page,
        size: pageSize,
        sortBy: 'id',
        sortDirection: 'DESC'
    }
    const { data: getPermission, isLoading: loadGetRole, refetch } = useGetPermissionQuery(paginationParams, {
        skip: isSearchMode
    })
    const [getPermissionByKey, { isLoading: loadSearchRole }] = useLazyGetPermissionByKeyQuery()
    const [postPermission] = usePostPermissionMutation()
    const [putPermission] = usePutPermissionMutation()
    const [deletePermission] = useDeletePermissionMutation()

    const currentData = isSearchMode ? searchData : getPermission

    // logic
    const dataSource = currentData?.content.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1
    }))
    const totalElements = currentData?.totalElements

    // handlers
    const handleSearch = async (data: SearchFormData) => {
        const isEmpty = !data.roleCode && !data.keyword && !data.status
        if (isEmpty) {
            setIsSearchMode(false)
            setSearchData(null)
            setPage(1)
            return
        }
        try {
            setPage(1)
            const searchParams = {
                page: 1,
                size: pageSize,
                sortBy: 'id',
                sortDirection: 'DESC',
                ...(data.roleCode && { roleCode: data.roleCode }),
                ...(data.keyword && { keyword: data.keyword }),
                ...(data.status && { status: data.status })
            }
            const result = await getPermissionByKey(searchParams).unwrap()
            setSearchData(result)
            setIsSearchMode(true)
        } catch (error: any) {
            errorMess(error?.data?.detail || 'Lỗi tìm kiếm')
        }
    }

    const hanldePostPermission = async (data: PermissionItem | Omit<PermissionItem, 'id'>) => {
        try {
            await postPermission(data).unwrap()
            setOpenModalAdd(false)
            successMess('Thêm thành công')
            setIsSearchMode(false)
            setSearchData(null)
            refetch()
        } catch (error: any) {
            errorMess(error?.data?.detail)
        }
    }

    const handlePutPermission = async (data: PermissionItem | Omit<PermissionItem, 'id'>) => {
        try {
            await putPermission({
                permissionName: selectedPermission?.name,
                body: data
            }).unwrap()
            setOpenModalAdd(false)
            successMess('Sửa thành công')
            setIsSearchMode(false)
            setSearchData(null)
            refetch()
        } catch (error: any) {
            errorMess(error?.data?.detail)
        }
    }

    const handleDeletePermission = async () => {
        try {
            await deletePermission(selectedPermission?.name).unwrap()
            setOpenDialog(false)
            refetch()
            successMess('Xóa thành công')
        } catch (error: any) {
            errorMess(error?.data?.detail)
        }
    }

    const typeFooter: Partial<Record<ModeAction, JSX.Element>> = {
        delete: (
            <div className='flex justify-end items-center gap-2'>
                <ButtonComponent type='default' content='Cancel' onClick={() => setOpenDialog(false)} />
                <ButtonComponent type='primary' danger content='Delete' onClick={handleDeletePermission} />
            </div>
        )
    }

    const typeText: Partial<Record<ModeAction, JSX.Element>> = {
        delete: (
            <span>
                Bạn có chắc chắn muốn <span className='font-bold'>xóa quyền</span>{' '}
                <span className='font-bold'>{selectedPermission?.name}</span> không? Hành động này
                không thể hoàn tác.
            </span>
        ),
        lock: (
            <span>
                Bạn có chắc chắn muốn <span className='font-bold'>khóa quyền</span>{' '}
                <span className='font-bold'>{selectedPermission?.name}</span> không? Quyền sẽ
                không thể sử dụng cho đến khi mở lại.
            </span>
        ),
        unlock: (
            <span>
                Bạn có chắc chắn muốn <span className='font-bold'>mở khóa quyền</span>{' '}
                <span className='font-bold'>{selectedPermission?.name}</span> không? Quyền này sẽ có
                thể hoạt động trở lại.
            </span>
        )
    }

    return {
        openDialog,
        setOpenDialog,
        page,
        setPage,
        pageSize,
        setPageSize,
        modeAction,
        setModeAction,
        openModalAdd,
        setOpenModalAdd,
        selectedPermission,
        setSelectedPermission,
        getPermission,
        loadGetRole: loadGetRole || loadSearchRole,
        dataSource,
        totalElements,
        typeText,
        typeFooter,
        handleSearch,
        hanldePostPermission,
        handlePutPermission,
        handleDeletePermission
    }
}
