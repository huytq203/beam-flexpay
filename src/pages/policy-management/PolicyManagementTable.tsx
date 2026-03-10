import ButtonDelete from '@components/button-delete/ButtonDelete'
import ButtonHistory from '@components/button-history/ButtonHistory'
import ButtonUpdate from '@components/button-update/ButtonUpdate'
import CellContent from '@components/cell-content/CellContent'
import { convertNumber, getApplicableObject } from '@utils/helperFunctions'
import { Empty, Table } from 'antd'
import dayjs from 'dayjs'
import { FC, useMemo } from 'react'

interface PolicyManagementTableProps {
	data: any
	search: any
	setSearch: (search: any) => void
	trans: any
	setMode: (mode: any) => void
	setSelectedRecord: (id: number) => void
	setOpen: (open: boolean) => void
}

const PolicyManagementTable: FC<PolicyManagementTableProps> = ({
	data,
	search,
	setSearch,
	trans,
	setMode,
	setSelectedRecord,
	setOpen
}) => {
	const columns = useMemo(() => [
		{
			align: 'center' as const,
			title: trans`policy-management.eWalletTransferMoneyManagement.order`,
			dataIndex: 'id',
			width: 50,
			render: (text: any, object: any, index: number) => (
				<div>{((data?.meta?.page as number) - 1) * 10 + index + 1}</div>
			)
		},
		{
			align: 'center' as const,
			title: trans`policy-management.payment.applicableObject`,
			dataIndex: 'applicableObject',
			width: 120,
			render: (record: any) => <CellContent data={getApplicableObject(record)} />
		},
		{
			align: 'center' as const,
			title: trans`policy-management.payment.withdrawBank`,
			dataIndex: 'depositMethods',
			width: 200,
			render: (record: any) => <div>{convertNumber(record)}</div>
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.transactionLevelFrom`} (VNĐ)`,
			dataIndex: 'transactionFrom',
			width: 100,
			render: (record: any) => <div>{convertNumber(record)}</div>
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.transactionLevelTo`} (VNĐ)`,
			dataIndex: 'transactionTo',
			width: 100,
			render: (record: any) => <div>{convertNumber(record)}</div>
		},
		{
			align: 'center' as const,
			title: trans`policy-management.payment.transactionFee`,
			children: [
				{
					align: 'center' as const,
					title: trans`policy-management.payment.onTransactor`,
					children: [
						{
							title: `${trans`policy-management.payment.flexibleFee`} (%)`,
							align: 'center' as const,
							width: 100,
							dataIndex: 'transferorFlexibleFee',
							render: (record: any) => <div>{convertNumber(record, '%')}</div>
						},
						{
							title: `${trans`policy-management.payment.fixedCharge`} (VNĐ)`,
							align: 'center' as const,
							width: 100,
							dataIndex: 'transferorFixedFee',
							render: (record: any) => <div>{convertNumber(record)}</div>
						},
						{
							title: `${trans`policy-management.payment.minFee`} (VNĐ)`,
							align: 'center' as const,
							dataIndex: 'transferorFeeMin',
							width: 100,
							render: (record: any) => <div>{convertNumber(record)}</div>
						},
						{
							title: `${trans`policy-management.payment.maxFee`} (VNĐ)`,
							align: 'center' as const,
							dataIndex: 'transferorFeeMax',
							width: 100,
							render: (record: any) => <div>{convertNumber(record)}</div>
						}
					]
				},
				{
					align: 'center' as const,
					title: trans`policy-management.payment.onReceiver`,
					children: [
						{
							title: `${trans`policy-management.payment.flexibleFee`} (%)`,
							align: 'center' as const,
							width: 100,
							dataIndex: 'receiverFlexibleFee',
							render: (record: any) => <div>{convertNumber(record, '%')}</div>
						},
						{
							title: `${trans`policy-management.payment.fixedCharge`} (VNĐ)`,
							align: 'center' as const,
							width: 100,
							dataIndex: 'receiverFixedFee',
							render: (record: any) => <div>{convertNumber(record)}</div>
						},
						{
							title: `${trans`policy-management.payment.minFee`} (VNĐ)`,
							align: 'center' as const,
							width: 100,
							dataIndex: 'receiverFeeMin',
							render: (record: any) => <div>{convertNumber(record)}</div>
						},
						{
							title: `${trans`policy-management.payment.maxFee`} (VNĐ)`,
							align: 'center' as const,
							width: 100,
							dataIndex: 'receiverFeeMax',
							render: (record: any) => <div>{convertNumber(record)}</div>
						}
					]
				}
			]
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.applicableDate`}`,
			dataIndex: 'startDate',
			width: 150,
			render: (record: any) => (
				<div>
					{record ? dayjs(record).format('HH:mm:ss DD/MM/YYYY') : '-'}
				</div>
			)
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.endDate`}`,
			dataIndex: 'endDate',
			width: 150,
			render: (record: any) => (
				<div>
					{record ? dayjs(record).format('HH:mm:ss DD/MM/YYYY') : '-'}
				</div>
			)
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.policyHistory`}`,
			render: (record: any) => (
					<ButtonHistory
						onClick={() => {
							setMode('history')
							setSelectedRecord(record.id)
							setOpen(true)
						}}
					/>
			)
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.edit`}`,
			render: (record: any) => (
					<ButtonUpdate
						module=''
						onClick={() => {
							setMode('update')
							setSelectedRecord(record.id)
							setOpen(true)
						}}
					/>
			)
		},
		{
			align: 'center' as const,
			title: `${trans`policy-management.payment.cancel`}`,
			render: (record: any) => (
					<ButtonDelete
						module=''
						onClick={() => {
							setMode('delete')
							setSelectedRecord(record.id)
							setOpen(true)
						}}
					/>
			)
		}
	], [data, trans, setMode, setSelectedRecord, setOpen])

	return (
		<Table
			bordered
			dataSource={data?.data ?? []}
			columns={columns}
			scroll={{ x: '100%' }}
			rowKey= {
				(record) => {
					return record.id
				}
			}
			locale={{
				emptyText: <Empty description={trans`labels.table-nodata`} />
			}}
			pagination={{
				current: search.page || 1,
				pageSize: search.take || 10,
				total: data?.meta?.itemCount || 0,
				onChange(page) {
					setSearch({
						...search,
						page
					})
				}
			}}
		/>
	)
}

export default PolicyManagementTable 
