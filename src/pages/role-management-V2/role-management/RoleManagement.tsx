import { CardComponent, ModalComponent, Table } from '@components/common'
import FormAdd from '@pages/role-management-V2/role-management/components/FormAdd'
import FormSearch from '@pages/role-management-V2/role-management/components/FormSearch'
import { RoleManagementColumn } from '@pages/role-management-V2/role-management/RoleManagement.column'
import React, { useState } from 'react'

const RoleManagement = () => {
  const[openModalAdd,setOpenModalAdd]=useState(false)


  const column=RoleManagementColumn()
  return (
    <div className='flex flex-col gap-2'>
      <CardComponent content={<FormSearch setOpenModalAdd={setOpenModalAdd}/>}/>
      <CardComponent content={
        <>
        <Table scroll={{ x: 'max-content' }} bordered columns={column} size='small'/>
        </>
      }/>
      <ModalComponent title='Thêm quyền' onCancel={()=>setOpenModalAdd(false) } onOk={()=>{}} open={openModalAdd}  width='30%' modalText={<FormAdd/>} />
    </div>
  )
}

export default RoleManagement
