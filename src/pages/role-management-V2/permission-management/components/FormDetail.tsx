import { CardComponent, Table } from '@components/common'
import { FormDetailColumn } from '@pages/role-management-V2/permission-management/configs/FormDetail.column'
import { UserInfor } from '@type/userManagement'

interface Props {
  selectMember: UserInfor[] | undefined
}

const FormDetail = ({ selectMember }: Props) => {
  const column = FormDetailColumn()
  const dataSource = selectMember?.map((item, index) => ({
    key: item.id ?? index,
    username: item.username,
    email: item.email,
    emailVerified: item.emailVerified
  }))

  return (
    <div>
      <CardComponent
        content={
          <Table
            size='small'
            bordered
            columns={column}
            dataSource={dataSource}
            pagination={false}
          />
        }
      />
    </div>
  )
}

export default FormDetail
