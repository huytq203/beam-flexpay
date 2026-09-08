import { useGetEKYCSearchQuery } from '@services/apiEKYC'
import { useExportCsv } from '@hooks/useExportCsv'
import usePagination from '@hooks/usePagination'
import { useExportVerifiedKycProfilesMutation } from '@services/apiExportCsv'
import { useState } from 'react'

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

    const dataSource = dataEKYC?.content.map((item, index) => ({
        no: (page - 1) * pageSize + index + 1,
        ...item,
        key: item.id
    }))

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

export default useConfirmEKYC
