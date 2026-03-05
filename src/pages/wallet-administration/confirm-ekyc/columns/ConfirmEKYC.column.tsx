import { ArrowCounterClockwiseIcon, EyeOutlined } from "@components/icons";
import { ButtonComponent } from "@components/index";
import { Tag, Tooltip } from "antd";
import { ColumnType } from "antd/lib/table";
import dayjs from "dayjs";
import { genderMap, props, statusMap } from "../types/ConfirmEKYC.type";


const formatDateTime = (value?: string | null) =>
    value ? dayjs(value).format('DD/MM/YYYY HH:mm') : '—';

export const Column = ({ svg }: props): ColumnType[] => [
    {
        title: '#',
        align: 'center',
        width: 60,
        render: (_v, _r, index) => index + 1,
    },
    {
        title: 'Khách hàng',
        render(_, record) {
            return (
                <div>
                    <div className="font-semibold">{record.fullName}</div>
                    <div className="text-[12px] text-gray-500">{record.username}</div>
                </div>
            );
        },
    },

    {
        title: 'Số CCCD/CMND',
        align: 'center',
        dataIndex: 'idNumber',
    },
    {
        title: 'Ngày sinh',
        align: 'center',
        render(_, record) {
            return record.dateOfBirth ? dayjs(record.dateOfBirth).format('DD/MM/YYYY') : '—';
        },
    },
    {
        title: 'Loại giấy tờ',
        align: 'center',
        dataIndex: 'cardType',
    },
    {
        title: 'Ngày cấp',
        align: 'center',
        dataIndex: 'issueDate',
        render(value, record, index) {
            return value ? dayjs(value).format('DD/MM/YYYY') : '—'
        },
    },
    {
        title: 'Ngày hết hạn',
        align: 'center',
        dataIndex: 'expiryDate',
        render(value, record, index) {
            return value ? dayjs(value).format('DD/MM/YYYY') : '—'
        },
    },
    {
        title: 'Nơi cấp',
        width: 220,
        align: 'left',
        dataIndex: 'issuePlace',
    },

    {
        title: 'Giới tính',
        align: 'center',
        render(_, record) {
            return genderMap[record.gender] ?? record.gender ?? '—';
        },
    },
    {
        title: 'Nơi thường trú',
        ellipsis: { showTitle: false },
        render(_, record) {
            return (
                <Tooltip title={record.permanentAddress}>
                    {record.permanentAddress ?? '—'}
                </Tooltip>
            );
        },
    },
    {
        title: 'Face Score',
        align: 'center',
        render(_, record) {
            const score = record.faceMatchScore;
            if (score == null) return '—';
            const color = score >= 80 ? '#52c41a' : score >= 60 ? '#faad14' : '#ff4d4f';
            return <span style={{ color, fontWeight: 600 }}>{score}%</span>;
        },
    },
    {
        title: 'Ngày xác thực',
        align: 'center',
        render(_, record) {
            return formatDateTime(record.verifiedAt);
        },
    },
    {
        title: 'Trạng thái',
        align: 'center',
        render(_, record) {
            const status = statusMap[record.status] ?? { color: 'default', label: record.status };
            return <Tag color={status.color}>{status.label}</Tag>;
        },
    },
    {
        title: 'Thao tác',
        align: 'center',
        width: 100,
        fixed: 'right',
        render(_, record) {
            return (
                <div className="flex justify-center items-center gap-1">
                    <ButtonComponent
                        size="small"
                        className="text-green-700"
                        icon={svg('/icons.svg#hugeicons-user-check-01', { width: 18, height: 18 })}
                        type="default"
                    />
                    <ButtonComponent size="small" icon={<EyeOutlined />} type="default" />
                    <ButtonComponent size="small" danger icon={<ArrowCounterClockwiseIcon />} type="default" />
                </div>
            );
        },
    },
];