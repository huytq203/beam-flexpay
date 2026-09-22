import { useTerminalRecords } from '../../terminal/hooks/useTerminals'

export function useSubMerchantTerminalCounts(subMerchantId: string) {
  const terminals = useTerminalRecords().filter((row) => row.subMerchantId === subMerchantId)
  return {
    total: terminals.length,
    active: terminals.filter((row) => row.status === 'ACTIVE').length
  }
}
