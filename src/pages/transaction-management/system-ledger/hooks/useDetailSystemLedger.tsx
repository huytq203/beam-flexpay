import { useParams } from "react-router-dom"
import { useGetLedgerEntryByIdQuery } from "../services/apiSystemLedger"

const useDetailSystemLedger = () => {
  const { id } = useParams<{ id: string }>()
  
  const { data: ledgerEntry, isLoading, error } = useGetLedgerEntryByIdQuery(id || '', {
    skip: !id
  })

  return {
    id,
    ledgerEntry,
    isLoading,
    error
  }
}

export default useDetailSystemLedger
