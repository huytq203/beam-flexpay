import { LinkedBank } from '@type/responseAccountWallet'
import { ColumnType } from 'antd/es/table'
import React from 'react'
import { BankEnum, BankLabel, LinkTypeEnum, LinkTypeLabel } from '../constants/AccountBank.constant'
import { TypographyText } from '@components/index'

export const getColumn =():ColumnType<LinkedBank>[]=> [
    {
        title: '#',
        dataIndex: 'no',
        align: 'center'
    },
    {
        title: 'Ngân hàng',
        dataIndex:'bankCode',
        align: 'center',
        render:(value)=>{
            return <TypographyText>{BankLabel[value as BankEnum]}</TypographyText>
        }
    },
    {
        title: 'Số tài khoản',
        dataIndex:'maskedAccount',
        align: 'center',
    },
    {
        title: 'Tên tài khoản',
        dataIndex:'accountName',
        align: 'center',
    },
    {
        title: 'Loại liên kết',
        dataIndex:'linkType',
        align: 'center',
        render:(value)=>{
            return <TypographyText>{LinkTypeLabel[value as LinkTypeEnum]}</TypographyText>
        }
    },
    // {
    //     title: 'Thao tác',
    //     dataIndex:'',
    //     align: 'center',
    // },
]

