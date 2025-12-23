import { CardComponent, ModalComponent, Table } from '@components/common'
import { useGetUserQuery } from '@services/apiUser'
import React, { useState } from 'react'
import FormSearch from './components/FormSearch'
import FormAdd from '@pages/role-management-V2/user-management/components/FormAdd'
import FormDetail from '@pages/role-management-V2/user-management/components/FormDetail'
import { RoleManagemenColume } from '@pages/role-management-V2/user-management/RoleManagement.colume'
import { UserInfor } from '@type/roleManagement'

const RoleManagement = () => {
  // state
  const [openModalAdd, setOpenModalAdd] = useState(false)
  const [openModalDetail, setOpenModalDetail] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserInfor | null>(null)

  // handler to open modal with user details
  const handleOpenDetail = (record: UserInfor) => {
    setSelectedUser(record)
    setOpenModalDetail(true)
  }
  // api
  const deFaultPagination = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDirection: 'DESC'
  }
  const { data: getUser } = useGetUserQuery(deFaultPagination)

  // logic
  const dataSource = getUser?.content.map((item, index) => ({
    ...item,
    no: index + 1,
    createdTimestamp: item.createdTimestamp
      ? new Date(item.createdTimestamp)
      : null
  }))

  const column = RoleManagemenColume({ setOpenModalDetail })
  return (
    <>
      <CardComponent content={<FormSearch setOpenModalAdd={setOpenModalAdd} />} />
      <CardComponent
        content={
          <Table
            size='small'
            columns={column}
            dataSource={dataSource}
          />
        }
      />
      <ModalComponent
        title='Thêm mới tài khoản Admin'
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => { }}
        open={openModalAdd}
        modalText={<FormAdd />}
        width='35%'
      />
      <ModalComponent
        onCancel={() => setOpenModalDetail(false)}
        onOk={() => { }}
        open={openModalDetail}
        title='Chi thiết tài khoản Admin'
        width='45%'
        modalText={<FormDetail />}
      />
    </>
  )
}

export default RoleManagement
