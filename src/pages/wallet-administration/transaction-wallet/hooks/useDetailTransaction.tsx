import { useParams } from 'react-router-dom'
import { useGetTransactionDetail360Query } from '../../../../app/services/apiJournal'

const useDetailTransaction = () => {
    const { id } = useParams()
    const {
        data: detail,
        isLoading,
        isFetching,
        isError,
        refetch
    } = useGetTransactionDetail360Query(id ?? '', { skip: !id })

    return {
        id,
        detail,
        getTransactionById: detail?.transaction,
        profit: detail?.profit,
        moneyFlow: detail?.moneyFlow ?? [],
        customer: detail?.customer,
        isLoading,
        isFetching,
        isError,
        refetch
    }
}

export default useDetailTransaction
