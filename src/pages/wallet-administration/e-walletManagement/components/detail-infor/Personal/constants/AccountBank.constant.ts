import { mapEnumToSelectOptions } from '@utils/helper-functions/form'

export enum BankEnum {
    VCB='VCB',
    VPB='VPB',
}
export const BankLabel: Record<BankEnum, string> = {
    [BankEnum.VCB]: 'Vietcombank',
    [BankEnum.VPB]: 'VPBank',
}as const

export enum LinkTypeEnum {
    ACCOUNT='ACCOUNT',
    CARD='CARD',
}
export const LinkTypeLabel: Record<LinkTypeEnum, string> = {
    [LinkTypeEnum.ACCOUNT]: 'Tài khoản',
    [LinkTypeEnum.CARD]: 'Thẻ',
}as const

export const LINK_TYPE_CONFIG: Record<LinkTypeEnum, { label: string; className: string }> = {
    [LinkTypeEnum.ACCOUNT]: {
        label: LinkTypeLabel[LinkTypeEnum.ACCOUNT],
        className: 'info-status',
    },
    [LinkTypeEnum.CARD]: {
        label: LinkTypeLabel[LinkTypeEnum.CARD],
        className: 'normal-status',
    },
}

/**
 * OpenAPI của user-wallet khai báo LinkedBankResponse.status là string tự do, không có enum
 * nên tập giá trị dưới đây chốt theo nghiệp vụ, không suy ra được từ spec.
 */
export enum BankLinkStatusEnum {
    ACTIVE='ACTIVE',
    UNLINKED='UNLINKED',
}

export const BANK_LINK_STATUS_CONFIG: Record<BankLinkStatusEnum, { label: string; className: string }> = {
 
    [BankLinkStatusEnum.ACTIVE]: {
        label: 'Đang hoạt động',
        className: 'success-status',
    },
    [BankLinkStatusEnum.UNLINKED]: {
        label: 'Đã hủy liên kết',
        className: 'normal-status',
    },

}

export const ACTIVE_BANK_LINK_STATUSES: readonly string[] = [
    BankLinkStatusEnum.ACTIVE,
]

export const isActiveBankLinkStatus = (status?: string | null): boolean =>
    !!status && ACTIVE_BANK_LINK_STATUSES.includes(status)

/*
 * Option cho bộ lọc — dựng từ chính bảng nhãn ở trên để form tìm kiếm và cột
 * bảng không bao giờ lệch nhau.
 */
export const BANK_OPTIONS = mapEnumToSelectOptions(BankLabel)

export const LINK_TYPE_OPTIONS = mapEnumToSelectOptions(LinkTypeLabel)

export const BANK_LINK_STATUS_OPTIONS = Object.entries(BANK_LINK_STATUS_CONFIG).map(
    ([value, config]) => ({ value, label: config.label })
)
