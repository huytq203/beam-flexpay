import { useNavigate } from 'react-router-dom'
import { PATHS } from '@constants/pathConstant'

export function useForbiddenRecovery() {
  const navigate = useNavigate()

  const returnToSafePage = (): void => {
    void navigate(PATHS.HOME, { replace: true })
  }

  return {
    returnToSafePage
  }
}
