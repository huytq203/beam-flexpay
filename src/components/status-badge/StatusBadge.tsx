import { StatusKey } from '@pages/wallet-administration/e-walletManagement/types/WalletAccount.type'

const STATUS_CONFIG: Record<StatusKey, { label: string; className: string }> = {
    [StatusKey.ACTIVE]: {
        label: 'Hoạt động',
        className: 'success-status',
    },
    [StatusKey.INACTIVE]: {
        label: 'Ngừng hoạt động',
        className: 'danger-status',
    },
    [StatusKey.LOCKED]: {
        label: 'Khóa',
        className: 'danger-status',
    },
    [StatusKey.FROZEN]: {
        label: 'Đóng băng',
        className: 'info-status',
    },
}

interface StatusBadgeProps {
    status: StatusKey
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const config = STATUS_CONFIG[status]

    if (!config) return <span>{status}</span>

    return (
        <span className={`inline-flex px-2 text-[12px] rounded-md ${config.className}`}>
            {config.label}
        </span>
    )
}
