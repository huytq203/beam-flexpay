import { ColumnType } from "antd/lib/table";

export const Column = (): ColumnType[] => [
    {
        title: '#',
        align: 'center',
    },
    {
        title: 'Thời gian',
        align: 'center',
    },
    {
        title: 'Người thực hiện',
        align: 'center',
    },
    {
        title: 'Hành động',
        align: 'center',
    },
    {
        title: 'Lý do/Ghi chú',
        align: 'center',
    },
]
