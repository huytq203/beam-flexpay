import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'

const OTP_LENGTH = 6

export interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  onComplete: (value: string) => void
  isDisabled?: boolean
  isInvalid?: boolean
  isSuccessful?: boolean
  errorNonce?: number
  describedBy?: string
  autoFocus?: boolean
}

const sanitizeOtp = (value: string): string =>
  value.replace(/\D/g, '').slice(0, OTP_LENGTH)

export function OtpInput({
  value,
  onChange,
  onComplete,
  isDisabled = false,
  isInvalid = false,
  isSuccessful = false,
  errorNonce = 0,
  describedBy,
  autoFocus = false
}: OtpInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const completedValuesRef = useRef(new Set<string>())
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!visualRef.current) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches

    if (errorNonce > 0 && !reduceMotion) {
      gsap.fromTo(
        visualRef.current,
        { x: -6 },
        { x: 0, duration: 0.2, ease: 'elastic.out(1, 0.35)' }
      )
    }
  }, [errorNonce])

  useEffect(() => {
    if (errorNonce > 0 && !isDisabled) {
      inputRef.current?.focus()
    }
  }, [errorNonce, isDisabled])

  useEffect(() => {
    if (!isSuccessful || !visualRef.current) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) return

    const boxes = visualRef.current.querySelectorAll('[data-otp-box]')
    gsap.fromTo(
      boxes,
      { borderColor: '#d1d5db' },
      { borderColor: '#2dd4bf', duration: 0.12, stagger: 0.05 }
    )
  }, [isSuccessful])

  useEffect(() => {
    if (!visualRef.current) return
    const reduceMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches
    if (reduceMotion) return

    const boxes = visualRef.current.querySelectorAll('[data-otp-box]')
    gsap.fromTo(
      boxes,
      { y: 8, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.22, stagger: 0.04, ease: 'power2.out' }
    )
  }, [])

  const commitValue = (nextValue: string): void => {
    const sanitizedValue = sanitizeOtp(nextValue)
    onChange(sanitizedValue)

    if (
      sanitizedValue.length === OTP_LENGTH &&
      !completedValuesRef.current.has(sanitizedValue)
    ) {
      completedValuesRef.current.add(sanitizedValue)
      onComplete(sanitizedValue)
    }
  }

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>): void => {
    event.preventDefault()
    commitValue(event.clipboardData.getData('text'))
  }

  return (
    <div className='mx-auto w-full max-w-[352px] scroll-mt-24'>
      <div className='mb-2'>
        <label
          htmlFor='admin-otp'
          className='block text-[13px] font-semibold text-gray-900'
        >
          Mã xác thực
        </label>
      </div>
      <div
        className='relative outline-hidden focus-within:rounded-xl focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-teal-200'
        onClick={() => inputRef.current?.focus()}
      >
        <input
          ref={inputRef}
          id='admin-otp'
          value={value}
          type='text'
          inputMode='numeric'
          autoComplete='one-time-code'
          pattern='\d*'
          maxLength={OTP_LENGTH}
          disabled={isDisabled}
          autoFocus={autoFocus}
          aria-invalid={isInvalid}
          aria-describedby={describedBy}
          className='absolute inset-0 z-10 size-full cursor-text border-0 bg-transparent text-transparent caret-transparent outline-hidden disabled:cursor-not-allowed'
          onChange={(event) => commitValue(event.target.value)}
          onPaste={handlePaste}
          onFocus={() => {
            setIsFocused(true)
            inputRef.current?.scrollIntoView?.({ block: 'nearest' })
          }}
          onBlur={() => setIsFocused(false)}
        />
        <div
          ref={visualRef}
          aria-hidden='true'
          className='mx-auto flex w-full gap-1.5 sm:gap-2'
        >
          {Array.from({ length: OTP_LENGTH }, (_, index) => {
            const digit = value[index] ?? ''
            const isActive = isFocused && index === value.length
            const stateClass = isInvalid
              ? 'border-red-400 bg-red-50 text-red-900'
              : isSuccessful
                ? 'border-teal-400 bg-teal-50 text-teal-950'
                : digit
                  ? 'border-gray-300 bg-white text-gray-900'
                  : isActive
                    ? 'border-teal-400 bg-white shadow-[0_0_0_3px_rgba(43,217,208,0.14)]'
                    : 'border-gray-200 bg-gray-50/80 text-gray-900'

            return (
              <span
                key={index}
                data-otp-box
                className={`flex h-14 min-w-0 flex-1 items-center justify-center rounded-[10px] border text-[22px] font-semibold tabular-nums transition-colors ${stateClass}`}
              >
                {digit}
                {isActive && !digit && (
                  <span className='h-6 w-px bg-teal-600 motion-safe:animate-pulse' />
                )}
              </span>
            )
          })}
        </div>
      </div>
    </div>
  )
}
