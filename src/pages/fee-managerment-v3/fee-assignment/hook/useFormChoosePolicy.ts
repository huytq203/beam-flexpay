import { useGetFeePoliciesQuery, useLazySearchFeePoliciesQuery } from "@services/apiFeePoliciesServices"
import useDebounce from "@hooks/useDebounce"
import { useEffect, useMemo, useState } from "react"
import { useForm } from "react-hook-form"

export const useFormChoosePolicy = (defaultSelectedId?: string, serviceType?: string) => {
    // state
    const [searchValue, setSearchValue] = useState<string | null>(null)
    const [selectedId, setSelectedId] = useState<string>(defaultSelectedId || '')
    const [pageListPolicy, setPageListPolicy] = useState(1)
    const [pageSizeListPolicy, setPageSizeListPolicy] = useState(10)
    // api data

    const queryParams = useMemo(() => ({
        page: pageListPolicy,
        size: pageSizeListPolicy,
        sortBy: 'createdAt',
        sortDirection: 'DESC'
    }), [pageListPolicy, pageSizeListPolicy])
    const { data: dataPolicy } = useGetFeePoliciesQuery(queryParams)

    const debouncedSearchValue = useDebounce(searchValue, 500)
    const [triggerSearch, { data: searchResult, isFetching: isSearching }] = useLazySearchFeePoliciesQuery()

    // handle
    const isSearchActive = !!debouncedSearchValue || !!serviceType;

    const list = (isSearchActive ? searchResult?.content : dataPolicy?.content) || []
    const total = (isSearchActive ? searchResult?.totalElements : dataPolicy?.totalElements) || 0

    useEffect(() => {
        if (isSearchActive) {
            triggerSearch({
                keyword: debouncedSearchValue || '',
                serviceType: serviceType || '',
                page: pageListPolicy,
                size: pageSizeListPolicy,
                sortBy: 'createdAt',
                sortDirection: 'DESC'
            })
        }
    }, [debouncedSearchValue, serviceType, pageListPolicy, pageSizeListPolicy])

    useEffect(() => {
        if (defaultSelectedId) {
            setSelectedId(defaultSelectedId)
        }
    }, [defaultSelectedId])

    const dataSource = list.map((item, index) => ({
        key: item.id,
        no: (pageListPolicy - 1) * pageSizeListPolicy + index + 1,
        name: item.name,
        serviceType: item.serviceType,
        status: item.status,
        feeDomain: item.feeDomain,
        currency: item.currency,
        validFrom: item.validFrom,
        validTo: item.validTo
    }))

    const {
        control: controlSearch,
        handleSubmit: handleSunmitSearch,
        reset: resetSearch
    } = useForm({
        defaultValues: {
            keyword: ''
        },
        shouldUnregister: true
    })

    return {
        controlSearch,
        handleSunmitSearch,
        resetSearch,
        dataSource,
        isSearching,
        total,
        pageListPolicy,
        setPageListPolicy,
        pageSizeListPolicy,
        setPageSizeListPolicy,
        selectedId,
        setSelectedId,
        searchValue,
        setSearchValue
    }
}
