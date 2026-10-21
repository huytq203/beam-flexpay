import type { ReactNode } from 'react'

export interface AuthColumnProps {
  children: ReactNode
}

/** Khung chung của mọi trạng thái: header thương hiệu cho mobile + footer. */
export function AuthColumn({ children }: AuthColumnProps) {
  return (
    <div className="w-full max-w-[420px]">
      <div className="mb-6 flex items-center gap-3 md:hidden">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-linear-to-br from-teal-100 to-teal-200">
          <img src="/images/BEAM.png" alt="" className="h-7 w-7 object-contain" />
        </div>
        <span className="text-base font-bold tracking-tight text-teal-700">
          Flexpay Ewallet CMS
        </span>
      </div>

      {children}

      <p className="mt-6 text-center text-[11px] text-gray-500">
        © {new Date().getFullYear()} Flexpay E-wallet · Powered by BEAM
      </p>
    </div>
  )
}

export interface StateDiscProps {
  children: ReactNode
}

/** Đĩa bo góc đựng icon — dấu hiệu nhận diện chung của các trạng thái. */
export function StateDisc({ children }: StateDiscProps) {
  return (
    <div
      aria-hidden
      className="reset-disc mx-auto mb-4 flex h-[52px] w-[52px] items-center justify-center rounded-2xl border border-teal-100/60 bg-linear-to-br from-teal-50 to-teal-100 text-[21px] text-teal-700"
    >
      {children}
    </div>
  )
}
