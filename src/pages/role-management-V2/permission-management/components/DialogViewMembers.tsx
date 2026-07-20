import { CardComponent, Table } from '@components/index'
import { ButtonComponent } from '@components/index'
import { useState, useEffect, memo } from 'react'
import { useLazyGetMemberOfRoleQuery } from '@services/apiRole'
import { FormDetailColumn, UserTableRow } from '../columns/FormDetail.column'

interface Props {
  roleId?: string
  onCancel: () => void
}

type MemberRow = UserTableRow & { key: string | number }

const DialogViewMembers = ({ roleId, onCancel }: Props) => {
  const [dataSource, setDataSource] = useState<MemberRow[]>([])
  const [loading, setLoading] = useState(false)
  const [getMemberOfRole] = useLazyGetMemberOfRoleQuery()

  const columns = FormDetailColumn()

  useEffect(() => {
    if (!roleId) return
    const fetchData = async () => {
      setLoading(true)
      try {
        const data = await getMemberOfRole(roleId).unwrap()
        setDataSource(
          data?.content?.map((item, index) => ({
            key: item.id ?? index,
            username: item.username,
            email: item.email,
            emailVerified: item.emailVerified
          })) ?? []
        )
      } catch {
        setDataSource([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roleId, getMemberOfRole])

  return (
    <div>
      <CardComponent
        content={
          <Table
            size='small'
            bordered
            columns={columns}
            dataSource={dataSource}
            loading={loading}
            pagination={false}
          />
        }
      />
      <div className='flex justify-end items-center gap-2 mt-4'>
        <ButtonComponent type='default' content='Đóng' onClick={onCancel} />
      </div>
    </div>
  )
}

export default memo(DialogViewMembers)
