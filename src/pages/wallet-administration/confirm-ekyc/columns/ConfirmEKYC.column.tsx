import { ArrowCounterClockwiseIcon, EyeOutlined } from "@components/icons";
import { ButtonComponent, TooltipComponent } from "@components/index";
import { ColumnType } from "antd/lib/table";
import dayjs from "dayjs";
import type { EKYCListItem } from "@type/apiResponseEKYC";
import { genderMap, profileStatusMap, props, statusMap } from "../types/ConfirmEKYC.type";

const formatDateTime = (value?: string | null) =>
    value ? dayjs.utc(value).format('DD/MM/YYYY HH:mm:ss') : '--';

const STATUS_CLASS: Record<string, string> = {
    VERIFIED: 'text-green-700 bg-green-50 border border-green-400 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    COMPLETED: 'text-green-700 bg-green-50 border border-green-400 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    PENDING: 'text-yellow-600 bg-yellow-50 border border-yellow-400 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    IN_PROGRESS: 'text-blue-700 bg-blue-50 border border-blue-400 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    FAILED: 'text-red-600 bg-red-50 border border-red-400 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    EXPIRED: 'text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    ABANDONED: 'text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    REJECTED: 'text-red-600 bg-red-50 border border-red-400 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
    INVALIDATED: 'text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block',
}

interface ColumnProps extends props {
    onViewDetail: (record: EKYCListItem) => void
}

export const getColumn = ({ svg, onViewDetail }: ColumnProps): ColumnType<EKYCListItem>[] => [
    {
        title: '#',
        align: 'center',
        width: 50,
        dataIndex: 'no',
    },
    {
        title: 'Khách hàng',
        render(_, record) {
            return (
                <div>
                    <p className="font-semibold">{record.fullName}</p>
                    <p className="text-[12px] text-gray-500">{record.username ?? '—'}</p>
                </div>
            );
        },
    },
    {
        title: 'Số CCCD/CMND',
        align: 'center',
        dataIndex: 'idNumber',
        render(value) {
            return <span className="font-medium">{value ?? '—'}</span>;
        },
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
        render(value) {
            return (
                <span className="text-[12px] px-2 py-0.5  text-gray-700 font-medium">
                    {value ?? '—'}
                </span>
            );
        },
    },
    {
        title: 'Ngày cấp / Hết hạn',
        align: 'center',
        render(_, record) {
            return (
                <div className="text-[12px]">
                    <p>Cấp: {record.issueDate ? dayjs(record.issueDate).format('DD/MM/YYYY') : '—'}</p>
                    <p className="text-gray-500">HH: {record.expiryDate ? dayjs(record.expiryDate).format('DD/MM/YYYY') : '—'}</p>
                </div>
            );
        },
    },
    {
        title: 'Nơi cấp',
        width: 200,
        align: 'left',
        dataIndex: 'issuePlace',
        ellipsis: true,
        render(value) {
            if (!value) return '—';
            const shortValue = value
                .replace(/CỤC TRƯỞNG CỤC CẢNH SÁT QUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi, 'Cục CS QLHC về TTXH')
                .replace(/CỤC TRƯỞNG CỤC CẢNH SÁT\nQUẢN LÝ HÀNH CHÍNH VỀ TRẬT TỰ XÃ HỘI/gi, 'Cục CS QLHC về TTXH');

            return (
                <TooltipComponent title={value}>
                    <span className="font-medium">{shortValue}</span>
                </TooltipComponent>
            );
        }
    },
    {
        title: 'Giới tính',
        align: 'center',
        width: 80,
        render(_, record) {
            return record.gender ? genderMap[record.gender] ?? record.gender : '—';
        },
    },
    {
        title: 'Nơi thường trú',
        ellipsis: true,
        width: 200,
        render(_, record) {
            return (
                <TooltipComponent title={record.permanentAddress}>
                    <span>{record.permanentAddress ?? '—'}</span>
                </TooltipComponent>
            );
        },
    },
    {
        title: 'Face Score',
        align: 'center',
        width: 90,
        render(_, record) {
            const score = record.faceMatchScore;
            if (score == null) return '—';
            const cls = score >= 80
                ? 'text-green-600 '
                : score >= 60
                    ? 'text-yellow-600'
                    : 'text-red-600';
            return (
                <span className={`${cls}  px-2 py-0.5 rounded-sm text-[12px] font-bold inline-block`}>
                    {score}%
                </span>
            );
        },
    },
    {
        title: 'Ngày hoàn tất',
        align: 'center',
        render(_, record) {
            return <span className="text-[12px]">{formatDateTime(record.completedAt ?? record.verifiedAt)}</span>;
        },
    },
    {
        title: 'Ngày tạo',
        align: 'center',
        render(_, record) {
            return <span className="text-[12px]">{formatDateTime(record.createdAt)}</span>;
        },
    },
    {
        title: 'Xác thực',
        align: 'center',
        render(_, record) {
            const profile = record.profileStatus ? profileStatusMap[record.profileStatus] : undefined;
            if (!profile) {
                return (
                    <span className="text-gray-500 bg-gray-100 border border-gray-300 px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block">
                        Chưa xác thực
                    </span>
                );
            }
            return (
                <span className={`${profile.className} px-2 py-0.5 rounded-sm text-[12px] font-medium inline-block`}>
                    {profile.label}
                </span>
            );
        },
    },
    {
        title: 'Trạng thái phiên',
        align: 'center',
        render(_, record) {
            const status = statusMap[record.status];
            const statusValue = record.status;
            return (
                <span className={STATUS_CLASS[statusValue] ?? 'text-gray-500'}>
                    {status?.label ?? statusValue?.replaceAll('_', ' ') ?? '—'}
                </span>
            );
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
                    <TooltipComponent title="Duyệt">
                        <ButtonComponent
                            hidden
                            size="small"
                            className="text-green-700"
                            icon={svg('/icons.svg#hugeicons-user-check-01', { width: 18, height: 18 })}
                            type="default"
                        />
                    </TooltipComponent>
                    <TooltipComponent title="Xem chi tiết">
                        <ButtonComponent
                            aria-label="Xem chi tiết hồ sơ eKYC"
                            size="small"
                            icon={<EyeOutlined />}
                            type="default"
                            onClick={() => onViewDetail(record)}
                            className="bg-blue-50 border! border-blue-600 text-blue-600 hover:bg-blue-100! hover:text-blue-600!"
                        />
                    </TooltipComponent>
                    <TooltipComponent title="Hủy xác thực">
                        <ButtonComponent
                            hidden
                            size="small"
                            danger
                            icon={<ArrowCounterClockwiseIcon />}
                            type="default" />
                    </TooltipComponent>
                </div>
            );
        },
    },
];
