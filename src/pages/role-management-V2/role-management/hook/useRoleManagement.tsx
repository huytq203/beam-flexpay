import React, { useState } from 'react'
import { useDeleteRoleMutation, useGetRoleQuery, useLazyGetRoleByKeyQuery, usePostRoleMutation, usePutRoleMutation } from '@services/apiRole'
import { RoleDataItem, RoleData } from '@type/roleManagementV2'
import { useMessage } from '@hooks/useMessage'
import { SearchFormData } from '../components/FormSearch'
import { ButtonComponent } from '@components/common'


export type ModeAction = 'add' | 'update' | 'delete' | 'lock' | 'unlock' | ''

export const useRoleManagement = () => {
    // state
    const [page, setPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [openModalAdd, setOpenModalAdd] = useState(false)
    const [modeAction, setModeAction] = useState<ModeAction>('')
    const [selectedUser, setSelectedUser] = useState<RoleDataItem | undefined>(undefined)
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
    const { data: getRole, isLoading: loadGetRole, refetch } = useGetRoleQuery(paginationParams, {
        skip: isSearchMode // Skip when in search mode
    })
    const [getRoleByKey, { isLoading: loadSearchRole }] = useLazyGetRoleByKeyQuery()
    const [postRole] = usePostRoleMutation()
    const [putRole] = usePutRoleMutation()
    const [deleteRole] = useDeleteRoleMutation()

    // Use search data when in search mode, otherwise use normal getRole data
    const currentData = isSearchMode ? searchData : getRole

    // logic
    const dataSource = currentData?.content.map((item, index) => ({
        ...item,
        no: (page - 1) * pageSize + index + 1  // Số thứ tự đúng theo trang
    }))
    const totalElements = currentData?.totalElements

    const handleSearch = async (data: SearchFormData) => {
        // Check if all search fields are empty -> clear search mode
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
            const result = await getRoleByKey(searchParams).unwrap()
            setSearchData(result)
            setIsSearchMode(true)
        } catch (error: any) {
            console.error('Search error:', error)
            errorMess(error?.data?.detail || 'Lỗi tìm kiếm')
        }
    }

    const hanldePostRole = async (data: RoleDataItem | Omit<RoleDataItem, 'id'>) => {
        try {
            const result = await postRole(data).unwrap()
            console.log(result)
            setOpenModalAdd(false)
            successMess('Thêm thành công')
            // Clear search mode and refetch
            setIsSearchMode(false)
            setSearchData(null)
            refetch()
        } catch (error: any) {
            console.error('Post role error:', error)
            errorMess(error?.data?.detail)
        }
    }

    const handlePutRole = async (data: RoleDataItem | Omit<RoleDataItem, 'id'>) => {
        try {
            await putRole({
                id: selectedUser?.id,
                body: data
            }).unwrap()
            setOpenModalAdd(false)
            successMess('Sửa thành công')
            // Clear search mode and refetch
            setIsSearchMode(false)
            setSearchData(null)
            refetch()
        } catch (error: any) {
            errorMess(error?.data?.detail)
        }
    }

    const handleDeleteRole=async()=>{
      try {
          await deleteRole(selectedUser?.id).unwrap()
          setOpenDialog(false)
          refetch()
           successMess('Xóa thành công')
      } catch (error:any) {
         errorMess(error?.data?.detail)
      }
    }

    const typeFooter: Partial<Record<ModeAction, JSX.Element>> = {
        delete: (
            <div className='flex justify-end items-center gap-2'>
                <ButtonComponent
                    type='default'
                    content='Cancel'
                    onClick={() => setOpenDialog(false)}
                />
                <ButtonComponent
                    type='primary'
                    danger
                    content='Delete'
                    onClick={handleDeleteRole}
                />
            </div>
        ),


    }

    const typeText: Partial<Record<ModeAction, JSX.Element>> = {
        delete: (
            <span>
                Bạn có chắc chắn muốn <span className='font-bold'>xóa quyền</span>{' '}
                <span className='font-bold'>{selectedUser?.name} </span>không? Hành động này
                không thể hoàn tác.
            </span>
        ),
        lock: (
            <span>
                Bạn có chắc chắn muốn <span className='font-bold'>khóa quyền</span>{' '}
                admin <span className='font-bold'>{selectedUser?.name}</span>không? Tài khoản sẽ
                không ttheer đăng nhập cho đến khi mở lại.
            </span>
        ),
        unlock: (
            <span>
                Bạn có chắc chắn muốn{' '}
                <span className='font-bold'>mở khóa quyền</span>
                <span className='font-bold'>{selectedUser?.name}</span> không? Tài khoản này sẽ có
                thể hoạt động trở lại.
            </span>
        ),
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
        selectedUser,
        setSelectedUser,


        getRole,
        loadGetRole: loadGetRole || loadSearchRole,
        dataSource,
        totalElements,
        typeText,
        typeFooter,


        handleSearch,
        hanldePostRole,
        handlePutRole,
        handleDeleteRole
    }
}


