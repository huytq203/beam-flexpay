import { CheckOutlined, CloseOutlined, DollarOutlined, EyeFilled } from '@components/icons/common'
import { ButtonComponent, CopyableText } from '@components/index'
import { ColumnType } from 'antd/lib/table'
import React from 'react'

const Column = (): ColumnType[] => [
    {
        title: '#',
        align: 'center',
        dataIndex: 'id',
    },
    {
        title: 'Mã GD/Loại',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <p className='flex flex-col items-center'>
                        <CopyableText
                            value={record.maGD}
                        />
                    </p>
                    <p> {record.loaiGD}</p>
                </div>
            )
        },
    },
    {
        title: 'Người yêu cầu',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <p> {record.nguoiYeuCau.ten}</p>
                    <p> {record.nguoiYeuCau.soDienThoai}</p>
                </div>
            )
        },
    },
    {
        title: 'Số tiền rút',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <p> {record.soTienRut}</p>
                </div>
            )
        },
    },
    {
        title: 'Thông tin thụ hưởng',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="">
                    <p>{record.thongTinThuHuong.tenNganHang + " - " + record.thongTinThuHuong.soTaiKhoan}</p>
                    <p>{record.thongTinThuHuong.tenThuHuong}</p>
                </div>
            )
        },
    },
    {
        title: 'Thông tin NH chi tiền',
        align: 'center',
        dataIndex: 'no',
        render(value, record, index) {
            return (
                <div className="">
                    <p>{record.thongTinNHChiTien.tenNganHang ?? <span className='italic text-gray-500'>---Chưa chọn---</span>}</p>
                    <p>{record.thongTinNHChiTien.soTaiKhoan ?? <span className='italic text-gray-500'>---Chưa chọn---</span>}</p>
                </div>
            )
        },
    },
    {
        title: 'Ngày tạo/Thành công',
        align: 'center',
        render(value, record, index) {
            return (
                <div className="text-start">
                    <p>Ngày tạo: {record.ngayTao ?? '--'}</p>
                    <p>Ngày TC:{record.ngayThanhCong ?? '--'}</p>
                </div>
            )
        },
    },
    {
        title: 'Trạng thái',
        align: 'center',
        dataIndex: 'no',
        render(value, record, index) {
            return (
                <div className={record.trangThai == 'CHO_DUYET' ? 'text-yellow-500' : record.trangThai == 'THANH_CONG' ? 'text-green-700' : record.trangThai == 'THAT_BAI' ? 'text-red-600' : ''}>
                    <p>{record.trangThaiLabel}</p>
                </div>
            )
        },
    },
    {
        title: 'Thao tác',
        align: 'center',
        width:100,
        render(value, record, index) {
            return (
                <div className="flex justify-start items-center gap-1">
                    <ButtonComponent size='small' className='bg-blue-50 !border border-blue-600 text-blue-600 hover:!bg-blue-100 hover:!text-blue-600 ' icon={<EyeFilled/>} />
                    <ButtonComponent size='small' className='bg-green-50 !border border-green-600 text-green-600 hover:!bg-green-100 hover:!text-green-600 ' icon={<CheckOutlined/>} />
                    <ButtonComponent size='small' className='bg-teal-50 !border border-teal-600 text-teal-700 hover:!bg-teal-100 hover:!text-teal-700 ' icon={<DollarOutlined/>} />
                    <ButtonComponent size='small'  type='default' danger icon={<CloseOutlined/>} />
                </div>
            )
        },
    },
]

export default Column