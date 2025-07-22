import { AccountPayload, CustomerTable, accountStatus } from '@type/customer'
import { useDebounce } from 'ahooks'
import { Select, SelectProps, Spin } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { SearchValueType } from '../e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'

/**
 * Props for CustomPrivateAccountSelect
 */
export interface CustomPrivateAccountSelectProps extends SelectProps {
	/** Function to trigger fetching accounts */
	triggerFunction: (params: any) => Promise<any>
	/** Setter for updating the search value state */
	setSearchValue: React.Dispatch<React.SetStateAction<SearchValueType>>
	/** Current search input values */
	searchInput: SearchValueType
	/** List of accounts and pagination meta */
	listAccount: AccountPayload | undefined
	/** Optional callback to clear search field */
	onClearSearch?: (field: string) => void
	/** Make the select readonly (applies a class) */
	readonly?: boolean
}

/**
 * Custom hook to encapsulate private account select logic: fetching, debouncing, infinite scroll.
 */
function usePrivateAccountSelect({
	triggerFunction,
	setSearchValue,
	searchInput,
	listAccount
}: Pick<CustomPrivateAccountSelectProps, 'triggerFunction' | 'setSearchValue' | 'searchInput' | 'listAccount'>) {
	const [data, setData] = useState<CustomerTable[]>([])
	const [accountSearchValue, setAccountSearchValue] = useState<string>('')
	const [search, setSearch] = useState<{ page: number; take: number; status: accountStatus[] }>({
		page: 1,
		take: 10,
		status: [accountStatus.VERIFIED, accountStatus.LINKED]
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const debouncedSearchTerm = useDebounce(accountSearchValue, { wait: 300 })

	const fetchData = useCallback(
		async (value: string, page = 1) => {
			setLoading(true)
			setError(null)
			try {
				const params = value
					? { phoneNumber: value, page, take: search.take, status: search.status }
					: { page, take: search.take, status: search.status }
				const data = await triggerFunction(params)
				if (data?.isSuccess && !data?.isLoading) {
					if (page === 1) {
						setData(data?.data?.data as CustomerTable[])
					} else {
						setData(prev => [
							...prev,
							...(data?.data?.data as CustomerTable[])
						])
					}
				} else {
					setError('Failed to fetch accounts')
				}
			} catch {
				setError('Error fetching accounts')
			} finally {
				setLoading(false)
			}
		},
		[triggerFunction, search.take, search.status]
	)

	// Initial fetch if searchInput.privateAccountSearch exists
	useEffect(() => {
		if (searchInput.privateAccountSearch) {
			fetchData(searchInput.privateAccountSearch, 1)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Fetch on debounced search term
	useEffect(() => {
		if (debouncedSearchTerm) {
			fetchData(debouncedSearchTerm, 1)
			setSearch(s => ({ ...s, page: 1 }))
		} else {
			setData([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchTerm])

	const onSearch = (newValue: string) => {
		setAccountSearchValue(newValue)
		setSearchValue({ ...searchInput, privateAccountSearch: newValue })
	}

	const onScroll = async (e: any) => {
		const target = e.target
		if (
			target.scrollTop + target.offsetHeight === target.scrollHeight &&
			listAccount?.meta.hasNextPage
		) {
			const nextPage = search.page + 1
			setSearch(s => ({ ...s, page: nextPage }))
			await fetchData(accountSearchValue, nextPage)
		}
	}

	return {
		data,
		loading,
		error,
		onSearch,
		onScroll
	}
}

/**
 * Select dropdown for private accounts with async search and infinite scroll.
 */
export function CustomPrivateAccountSelect(props: CustomPrivateAccountSelectProps) {
	const {
		triggerFunction,
		setSearchValue,
		searchInput,
		listAccount,
		mode = undefined,
		onClearSearch,
		readonly,
		...rest
	} = props

	const {
		data,
		loading,
		error,
		onSearch,
		onScroll
	} = usePrivateAccountSelect({ triggerFunction, setSearchValue, searchInput, listAccount })

	return (
		<Select
			allowClear
			mode={mode}
			showSearch
			onPopupScroll={onScroll}
			onSearch={onSearch}
			suffixIcon={loading ? <Spin size='small' /> : null}
			filterOption={false}
			style={{ minWidth: 220 }}
			labelInValue
			onClear={() => onClearSearch && onClearSearch('applicableObjectId')}
			className={readonly ? 'readonly-class' : ''}
			{...rest}
		>
			{data.map((el) => (
				<Select.Option value={el.id} key={el.id}>
					{el.accountNumber}
				</Select.Option>
			))}
			{error && (
				<Select.Option disabled key='error'>
					{error}
				</Select.Option>
			)}
		</Select>
	)
}
