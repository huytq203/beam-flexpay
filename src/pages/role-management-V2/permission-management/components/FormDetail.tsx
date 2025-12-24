import { CardComponent, Table } from '@components/common'
import { FormDetailColumn } from '@pages/role-management-V2/permission-management/components/FormDetail.column'
import React from 'react'

const FormDetail = () => {
    const column=FormDetailColumn()
  return (
    <div>
      <CardComponent
        content={
          <>
            <Table size='small' bordered columns={column}/>
          </>
        }
      />
    </div>
  )
}

export default FormDetail
