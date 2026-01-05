import React from 'react'
import { TableRows } from '@pages/wallet-administration/e-walletManagement/types/Column.type'
import { ColumnType } from 'antd/lib/table'
import { MoreOutlined } from '@components/icons/common'
import {DropDownComponent} from '@components/common'
import { MenuProps } from 'antd/lib'
import { ButtonComponent } from '@components/common'
const status = (record: any) => {
    return (
        <div className="inline-flex gap-1">
            {record.accountStatus === 'LOCKED' && (
                <span className="inline-flex px-2 text-xs rounded-md bg-red-100 text-red-700 border border-red-700">
                    LOCKED
                </span>
            )}

            {!record.kycStatus && (
                <span className="inline-flex px-2 text-xs rounded-md bg-yellow-50 text-yellow-800 border border-yellow-800">
                    Chưa KYC
                </span>
            )}

            {record.kycStatus && (
                <span className="inline-flex px-2 text-xs rounded-md bg-green-50 text-green-800 border border-green-800">
                    Đã KYC
                </span>
            )}

            {record.ungLuong && (
                <span className="inline-flex px-2 text-xs rounded-md bg-blue-50 text-blue-800 border border-blue-800">
                    Ứng lương: {record?.ungLuong ? 'bật' : 'tắt'}
                </span>
            )}


            {!record?.ungLuong ? (
                <span className="inline-flex px-2 text-xs rounded-md bg-gray-50 text-gray-800 border border-gray-800">
                    Ứng lương: {record?.ungLuong ? 'bật' : 'tắt'}
                </span>
            ) : null}
        </div>
    )
}


export const Column = (): ColumnType<TableRows>[] => [
    {
        title: 'Khách hàng / Mã TK',
        align: 'center',
        render: (_: any, record: any) => (
            <div>
                <div className="font-medium">{record.ten}</div>
                <div className="text-gray-500 text-sm">{record.maTk}</div>
            </div>
        ),
    },
    {
        title: 'Thông tin liên hệ',

        align: 'center',
        render: (_: any, record: any) => (
            <div>
                <div className="text-gray-500">{record.email}</div>
                <div className="text-gray-500 ">{record.phone}</div>
            </div>
        ),
    },
    {
        title: 'Số dư ví',
        dataIndex: 'soDuVi',
        align: 'center'
    },
    {
        title: 'Giới tính / CCCD',

        align: 'center',
        render: (_: any, record: any) => (
            <div>
                <div className="text-gray-500">{record.gioiTinh}</div>
                <div className="text-gray-500 ">{record.cccd}</div>
            </div>
        ),
    },
    {
        title: 'Trạng thái',
        align: 'center',
        render: (value, record, index) => (
            <div className="">
                {status(record)}
            </div>
        )
    },
    {
        title: 'Thời gian',
        dataIndex: 'createdAt',
        align: 'center'
    },
    {
        title: 'Thao tác',
        align: 'center',
        render(value, record, index) {
            const items: MenuProps['items'] = [
                {
                    key: '1',
                    label: 'Xem chi tiết',
                },
                {
                    key: '2',
                    label: 'Khóa tài khoản',
                },
                {
                    key: '3',
                    label: 'Đóng băng số dư',
                },
                {
                    key: '4',
                    label: 'Đóng băng số dư',
                },
                {
                    key: '5',
                    label: 'Hủy ví',
                    danger: true,
                },
            ];
            return (
                <DropDownComponent items={items} content={<ButtonComponent type='text' size='small' content={<MoreOutlined />} />} />

            )
        },
    },
]

