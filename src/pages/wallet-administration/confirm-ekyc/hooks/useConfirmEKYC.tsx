import { useGetEKYCSearchQuery } from '@services/apiEKYC'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportVerifiedKycProfilesMutation } from '@services/apiExportCsv'
import { useState } from 'react'
import type { EKYCGroup, EKYCListItem } from '@type/apiResponseEKYC'

export type EKYCFilterType = {
    keyword?: string
    status?: string
    createdFrom?: string
    createdTo?: string
}

const useConfirmEKYC = () => {
    const { page, pageSize, setPage, setPageSize, sort, sortBy } = usePagination()
    const [filter, setFilter] = useState<EKYCFilterType>({})

    const payload = {
        page: page,
        size: pageSize,
        sortBy: sort,
        sortDirection: sortBy,
        ...filter
    };

    const { data: dataEKYC, isLoading, isFetching, refetch } =
        useGetEKYCSearchQuery(payload)

    const [triggerExport, { reset: resetExport }] =
        useExportVerifiedKycProfilesMutation()
    const { exportFile, isExporting } = useExportCsv({
        trigger: triggerExport,
        reset: resetExport,
        filenamePrefix: 'danh-sach-ho-so-ekyc'
    })

    const dataSource = dataEKYC?.content.map((group, index) =>
        mapEKYCGroupToListItem(group, (page - 1) * pageSize + index + 1)
    )

    const handleSearch = (values: EKYCFilterType) => {
        setFilter(values)
        setPage(1)
    }

    const handleReset = () => {
        setFilter({})
        setPage(1)
    }

    const handleExport = () => {
        void exportFile(filter)
    }

    return {
        dataSource,
        isLoading,
        isFetching,
        refetch,
        page,
        pageSize,
        setPage,
        setPageSize,
        total: dataEKYC?.totalElements,
        handleSearch,
        handleReset,
        handleExport,
        isExporting
    }
}

export const mapEKYCGroupToListItem = (group: EKYCGroup, no: number): EKYCListItem => {
    const latestAttempt = group.attempts[0]

    return {
        ...latestAttempt,
        userId: group.userId,
        username: group.username,
        status: latestAttempt?.status ?? group.latestStatus,
        createdAt: latestAttempt?.createdAt ?? group.latestAt,
        groupKey: group.groupKey,
        attemptCount: group.attemptCount,
        latestStatus: group.latestStatus,
        latestAt: group.latestAt,
        email: group.email,
        occupation: group.occupation,
        position: group.position,
        attempts: group.attempts,
        no,
        key: group.groupKey
    }
}

export default useConfirmEKYC
