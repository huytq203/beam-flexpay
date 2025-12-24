import { CardComponent, ModalComponent, Table } from '@components/common'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRole, DataRoleItem } from '@type/roleManagement'
import React, { useState } from 'react'
import { FormAdd } from './components/FormAdd'
import FormSearch from './components/FormSearch'
import { RoleManagementColumn } from './RoleManagement.column'

export const RoleManagement = () => {
    const[openModalAdd,setOpenModalAdd]=useState(false)


    const deFaultPagination = {
        page: 1,
        size: 10,
        sortBy: 'id',
        sortDirection: 'DESC'
    }
    const { data: getRole } = useGetRoleQuery(deFaultPagination)


    // logic
    const dataSource: DataRoleItem[] = getRole?.content.map((item, idx) => ({
        ...item,
        no: idx + 1,
    })) ?? []
    console.log(getRole)
    const column = RoleManagementColumn()
    return (
        <div className='flex flex-col gap-2'>
            <CardComponent content={<FormSearch />} />
            <CardComponent content={
                <>
                    <Table bordered size='small' columns={column} dataSource={dataSource} />
                </>
            } />
            <ModalComponent title='Thêm quyền' onCancel={()=>setOpenModalAdd(false)} onOk={()=>{}} open={openModalAdd} width="35%" modalText={<FormAdd/>} />
        </div>
    )
}
