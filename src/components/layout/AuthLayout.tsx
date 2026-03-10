import { useAppSelector } from '@hooks/hook'
import { useEffect, useRef } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import gsap from 'gsap'

import './style.scss'

function AuthLayout() {
  const { accessToken } = useAppSelector((state) => state.auth)
  const navigate = useNavigate()
  const location = useLocation()

  const brandRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (accessToken) {
      navigate('/')
    }
  }, [accessToken, navigate])

  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/auth/login')
    }
  }, [location])

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Brand panel: mascot fade in from bottom
      gsap.fromTo('.auth-mascot',
        { opacity: 0, y: 60 },
        { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' }
      )

      // Brand info slides in from left
      gsap.fromTo('.auth-brand-info',
        { opacity: 0, x: -40 },
        { opacity: 1, x: 0, duration: 0.8, delay: 0.3, ease: 'power2.out' }
      )

      // Form panel fades in
      if (formRef.current) {
        gsap.fromTo(formRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.7, delay: 0.2, ease: 'power2.out' }
        )
      }
    })
    return () => ctx.revert()
  }, [])

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-white">
      {/* Brand panel — ẩn trên mobile */}
      <div
        ref={brandRef}
        className="relative hidden md:flex flex-[3] overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #b2fef8 0%, #d2f8f4 40%, #a8f5ef 100%)' }}
      >
        {/* Mascot — hiện full, không có overlay che */}
        <div className="auth-mascot absolute inset-0 bg-center bg-no-repeat bg-contain pointer-events-none" />

        {/* Brand info: nằm ở góc trái dưới */}
        <div className="auth-brand-info absolute bottom-8 left-8 z-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-white/80 backdrop-blur-sm flex items-center justify-center">
              <img src="/images/BEAM.png" alt="Beam" className="w-[40px] h-[40px] object-contain" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold text-teal-900 leading-tight">Beam Ewallet</h2>
              <p className="text-[10px] text-teal-700/80">CMS Management System</p>
            </div>
          </div>
          <p className="text-[12px] text-teal-800/70 max-w-[280px] leading-relaxed">
            Hệ thống quản trị ví điện tử chuyên nghiệp, an toàn và hiệu quả.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div
        ref={formRef}
        className="flex-1 min-w-[320px] md:min-w-[420px] flex items-center justify-center overflow-y-auto px-4 py-6 md:px-8 bg-white"
      >
        <Outlet />
      </div>
    </div>
  )
}

export default AuthLayout
