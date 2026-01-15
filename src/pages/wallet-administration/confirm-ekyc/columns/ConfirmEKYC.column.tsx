import { ArrowCounterClockwiseIcon, DeleteOutlined, EyeOutlined } from "@components/icons/common";
import { ButtonComponent } from "@components/common";
import { useSVG } from "@hooks/useSVG";
import { ColumnType } from "antd/lib/table";
//
type SvgOptions = {
    size?: number
    width?: number
    height?: number
    className?: string
}

interface props {
    svg: (value: string, options?: SvgOptions) => JSX.Element
}
export const Column = ({ svg }: props): ColumnType[] => [
    {
        title: '#',
        align: 'center',
        dataIndex: 'id'
    },
    {
        title: 'Khách hàng',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <div className="">{record.tenKhachHang}</div>
                    <div className="">{record?.soDienThoai ?? record?.maSoThue}</div>
                </div>
            )
        },
    },
    {
        title: 'Loại TK',
        align: 'center',
        dataIndex: 'loaiTk'
    },
    {
        title: 'Loại giấy tờ',
        align: 'center',
        dataIndex: 'loaiGiayTo'
    },
    {
        title: 'Ngày gửi',
        align: 'center',
        dataIndex: 'ngayGui'
    },
    {
        title: 'Ngày xác thực',
        align: 'center',
        dataIndex: 'ngayXacThuc'
    },
    {
        title: 'AI Score',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    {record.aiScoreWarning == true ?
                        <div className="text-red-700">{record.aiScore}</div> :
                        <div className="text-green-700">{record.aiScore}</div>
                    }
                </div>
            )
        },
    },
    {
        title: 'Trạng thái',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    {record.trangThai == 'CHO_DUYET' ?
                        <div className="text-yellow-500">{record.trangThaiLabel}</div> :
                        record.trangThai == 'DA_XAC_THUC' ?
                            <div className="text-green-700">{record.trangThaiLabel}</div> :
                            <div className="text-red-700">{record.trangThaiLabel}</div>
                    }
                </div>
            )
        },
    },
    {
        title: 'Thao tác',
        align: 'center',
        width: 100,
        fixed: 'right',
        render(value, record, index) {
            return (
                <div className="flex justify-center items-center gap-1">
                    <ButtonComponent  size="small" className="text-green-700" icon={svg('/icons.svg#hugeicons-user-check-01',
                        {
                            width: 18,
                            height: 18
                        })} type='default' />
                    <ButtonComponent size="small" icon={<EyeOutlined />} type='default'  />
                    <ButtonComponent size="small" danger icon={<ArrowCounterClockwiseIcon />} type='default' />
                </div>
            )
        },
    },

]