import { ButtonComponent } from "@components/index";
import { ColumnType } from "antd/lib/table";

export const Column = (): ColumnType[] => [
    {
        title: '#',
        align: 'center',
        dataIndex: 'aaaaaaaaa',
        key: '111'
    },
    {
        title: 'Mã đóng băng',
        align: 'center',
        dataIndex: 'maDongBang',
        key: 'maDongBang'
    },
    {
        title: 'Nguồn/GD gốc',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <p>{record.nguonGD.loai}</p>
                    <p>{record.nguonGD.maGD}</p>
                </div>
            )
        },
    },
    {
        title: 'Khách hàng',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <p>{record.khachHang.ten}</p>
                    <p>{record.khachHang.soDienThoai}</p>
                </div>
            )
        },
        key: '222'
    },

    {
        title: 'Tổng đóng',
        align: 'center',
        dataIndex: 'tongDong',
        key: '444'
    },
    {
        title: 'Đã giải tỏa',
        align: 'center',
        dataIndex: 'daGiaiToa',
        key: '555'
    },
    {
        title: 'Còn lại',
        align: 'center',
        dataIndex: 'conLai',
        key: '555'
    },
    {
        title: 'Trạng thái',
        align: 'center',
        dataIndex: 'trangThaiLabel',
        key: '666'
    },

    {
        title: 'Hành động',
        align: 'center',
        key: '888',
        width: 100,
        render(value, record, index) {
            return (
                <div className="">
                    <ButtonComponent
                        size="small"
                        disabled={Number(record.conLai) > 0}
                        className={`bg-blue-50 border border-blue-600 text-blue-600 ${Number(record.conLai) > 0
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:!bg-blue-100 hover:!text-blue-700'
                            }`}
                        content={'Mở băng'}
                    />
                </div>
            )
        },
    },
]