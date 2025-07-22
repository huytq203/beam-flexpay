import { GroupAccountInterface, ResponseGroupData } from '@type/accountGroup'
import { Select, SelectProps, Spin } from 'antd'
import { useEffect, useState, useCallback } from 'react'
import { useDebounce } from 'ahooks'
import { SearchValueType } from '../e-wallet-money-transfer/e-wallet-transfer-money-modal/SetupEWalletTransferMoneyContent'

/**
 * Props for CustomAccountGroupSelect
 */
export interface CustomAccountGroupSelectProps extends SelectProps {
	/**
	 * Function to trigger fetching account groups. Should return a promise resolving to { isSuccess, isLoading, data }
	 */
	triggerFunction: (params: any) => Promise<any>
	/**
	 * Setter for updating the search value state
	 */
	setSearchValue: React.Dispatch<React.SetStateAction<SearchValueType>>
	/**
	 * Current search input values
	 */
	searchInput: SearchValueType
	/**
	 * List of account groups and pagination meta
	 */
	listAccountGroup: ResponseGroupData | undefined
	/**
	 * Optional callback to clear search field
	 */
	onClearSearch?: (field: string) => void
	/**
	 * Disable the select
	 */
	disabled?: boolean
	/**
	 * Make the select readonly (applies a class)
	 */
	readonly?: boolean
}

/**
 * Custom hook to encapsulate account group select logic: fetching, debouncing, infinite scroll.
 */
function useAccountGroupSelect({
	triggerFunction,
	setSearchValue,
	searchInput,
	listAccountGroup
}: Pick<CustomAccountGroupSelectProps, 'triggerFunction' | 'setSearchValue' | 'searchInput' | 'listAccountGroup'>) {
	const [dataAccountGroup, setDataAccountGroup] = useState<GroupAccountInterface[]>([])
	const [accountGroupSearchValue, setAccountGroupSearchValue] = useState<string>('')
	const [search, setSearch] = useState<{ page: number; take: number }>({ page: 1, take: 10 })
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const debouncedSearchTerm = useDebounce(accountGroupSearchValue, { wait: 300 })

	const fetchData = useCallback(
		async (value: string, page = 1) => {
			setLoading(true)
			setError(null)
			try {
				const params = value ? { name: value, page, take: search.take } : { page, take: search.take }
				const data = await triggerFunction(params)
				if (data?.isSuccess && !data?.isLoading) {
					if (page === 1) {
						setDataAccountGroup(data?.data?.data as GroupAccountInterface[])
					} else {
						setDataAccountGroup(prev => [
							...prev,
							...(data?.data?.data as GroupAccountInterface[])
						])
					}
				} else {
					setError('Failed to fetch account groups')
				}
			} catch (err) {
				setError('Error fetching account groups')
			} finally {
				setLoading(false)
			}
		},
		[triggerFunction, search.take]
	)

	// Initial fetch if searchInput.accountGroupSearch exists
	useEffect(() => {
		if (searchInput.accountGroupSearch) {
			fetchData(searchInput.accountGroupSearch, 1)
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	// Fetch on debounced search term
	useEffect(() => {
		if (debouncedSearchTerm) {
			fetchData(debouncedSearchTerm, 1)
			setSearch(s => ({ ...s, page: 1 }))
		} else {
			setDataAccountGroup([])
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [debouncedSearchTerm])

	const onSearch = (newValue: string) => {
		setAccountGroupSearchValue(newValue)
		setSearchValue({ ...searchInput, accountGroupSearch: newValue })
	}

	const onScroll = async (e: any) => {
		const target = e.target
		if (
			target.scrollTop + target.offsetHeight === target.scrollHeight &&
			listAccountGroup?.meta.hasNextPage
		) {
			const nextPage = search.page + 1
			setSearch(s => ({ ...s, page: nextPage }))
			await fetchData(accountGroupSearchValue, nextPage)
		}
	}

	return {
		dataAccountGroup,
		loading,
		error,
		onSearch,
		onScroll
	}
}

/**
 * Select dropdown for account groups with async search and infinite scroll.
 */
export function CustomAccountGroupSelect(props: CustomAccountGroupSelectProps) {
	const {
		triggerFunction,
		setSearchValue,
		searchInput,
		listAccountGroup,
		disabled = false,
		mode = undefined,
		onClearSearch,
		readonly,
		...rest
	} = props

	const {
		dataAccountGroup,
		loading,
		error,
		onSearch,
		onScroll
	} = useAccountGroupSelect({ triggerFunction, setSearchValue, searchInput, listAccountGroup })

	return (
		<Select
			allowClear
			disabled={disabled}
			mode={mode}
			showSearch
			suffixIcon={loading ? <Spin size='small' /> : null}
			filterOption={false}
			style={{ minWidth: 220 }}
			labelInValue
			maxTagCount={2}
			onPopupScroll={onScroll}
			onSearch={onSearch}
			onClear={() => onClearSearch && onClearSearch('applicableObjectId')}
			className={readonly ? 'readonly-class' : ''}
			{...rest}
		>
			{dataAccountGroup?.map((el) => (
				<Select.Option value={el.id} key={el.id}>
					{el.name}
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
