import {
  ButtonComponent,
  CardComponent,
  DialogModal,
  ModalComponent,
  Table
} from '@components/common'
import { useGetRoleQuery } from '@services/apiRoleManagement'
import { DataRole, DataRoleItem } from '@type/roleManagement'
import React, { useState } from 'react'
import { FormAdd } from './components/FormAdd'
import FormSearch from './components/FormSearch'
import { PermissionManagementColumn } from './PermissionManagement.column'
import FormDetail from '@pages/role-management-V2/permission-management/components/FormDetail'

export type ModeAction =
  | 'edit'
  | 'add'
  | 'view'
  | 'delete'
  | 'lock'
  | 'unlock'
  | ''

export const PermissionManagement = () => {
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

  // logic
  const dataSource: DataRoleItem[] =
    getRole?.content.map((item, idx) => ({
      ...item,
      no: idx + 1
    })) ?? []
  console.log(getRole)
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
  return (
    <div className='flex flex-col gap-2'>
      <CardComponent
        content={<FormSearch setOpenModalAdd={setOpenModalAdd} />}
      />
      <CardComponent
        content={
          <>
            <Table
              scroll={{ x: 'max-content' }}
              bordered
              size='small'
              columns={column}
              dataSource={dataSource}
            />
          </>
        }
      />
      <ModalComponent
        title='Thêm quyền'
        onCancel={() => setOpenModalAdd(false)}
        onOk={() => {}}
        open={openModalAdd}
        width='75%'
        modalText={<FormAdd />}
        footer={modeAction == 'view' ? null : undefined}
      />
      <ModalComponent
        onCancel={() => setOpenModalDetail(false)}
        onOk={() => {}}
        open={openModalDetail}
        width='60%'
        title='Danh sách tài khoản Admin'
        modalText={<FormDetail />}
      />
      <DialogModal
        onCancel={() => setModalDialog(false)}
        onOk={() => {}}
        open={modalDialog}
        content={modeAction && typeText[modeAction]}
        footer={modeAction && typeFooter[modeAction]}
      />
    </div>
  )
}
