import { CardComponent, Table } from '@components/common'
import { useGetUserQuery } from '@services/apiUser'
import React from 'react'
import FormSearch from './FormSearch'
import { column } from './RoleManagement.colume'

const RoleManagement = () => {

  const deFaultPagination = {
    page: 1,
    size: 10,
    sortBy: 'id',
    sortDirection: "DESC"
  }
  const { data: getUser } = useGetUserQuery(deFaultPagination)
  const dataSource = getUser?.content.map((item, index) => ({
    ...item,
    no: index + 1,
    createdTimestamp: item.createdTimestamp ? new Date(item.createdTimestamp) : null,
  }))
  return (
    <>
      <CardComponent content={<FormSearch />} />
      <CardComponent content={
        <Table
          size='small'
          columns={column}
          dataSource={dataSource}
        />} />
    </>
  )
}

export default RoleManagement