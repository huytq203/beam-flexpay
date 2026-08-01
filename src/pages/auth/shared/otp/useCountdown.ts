import { useCallback, useEffect, useState } from 'react'

const toDeadline = (seconds: number): number =>
  Date.now() + Math.max(0, seconds) * 1000

const getRemainingSeconds = (deadline: number): number =>
  Math.max(0, Math.ceil((deadline - Date.now()) / 1000))

export interface UseCountdownResult {
  secondsLeft: number
  restart: (seconds: number) => void
}

export function useCountdown(initialSeconds: number): UseCountdownResult {
  const [deadline, setDeadline] = useState(() => toDeadline(initialSeconds))
  const [secondsLeft, setSecondsLeft] = useState(() =>
    getRemainingSeconds(deadline)
  )

  useEffect(() => {
    const updateRemaining = (): void => {
      setSecondsLeft(getRemainingSeconds(deadline))
    }

    updateRemaining()
    const intervalId = window.setInterval(updateRemaining, 250)
    document.addEventListener('visibilitychange', updateRemaining)

    return () => {
      window.clearInterval(intervalId)
      document.removeEventListener('visibilitychange', updateRemaining)
    }
  }, [deadline])

  const restart = useCallback((seconds: number): void => {
    const nextDeadline = toDeadline(seconds)
    setDeadline(nextDeadline)
    setSecondsLeft(getRemainingSeconds(nextDeadline))
  }, [])

  return { secondsLeft, restart }
}
