import React, { useMemo } from 'react'
import { Breadcrumb } from 'antd'
import { useLocation, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { House } from '@phosphor-icons/react'
import { cn } from '@utils/cn'

interface BreadcrumbComponentProps {
    className?: string
}
interface BreadcrumbItem {
    title: React.ReactNode
    key: string
}
const BreadcrumbComponent: React.FC<BreadcrumbComponentProps> = ({ className }) => {
    const { t } = useTranslation()
    const location = useLocation()
    const pathname = location.pathname

    const breadcrumbItems = useMemo(() => {
        const pathnames = pathname.split('/').filter((x) => x)

        const items: BreadcrumbItem[] = [
            {
                title: (
                    <Link to="/" className="flex items-center  text-gray-400 hover:text-blue-500! transition-colors whitespace-nowrap">
                        <span className="text-[11px] font-medium leading-none flex items-center mt-1"> Trang chủ</span>
                    </Link>
                ),
                key: 'home',
            },
        ]

        let currentPath = ''
        pathnames.forEach((segment, index) => {
            currentPath += `/${segment}`
            const isLast = index === pathnames.length - 1

            // Logic lấy label từ header-title
            let titleKey = currentPath
            let label = t(`header-title.${titleKey}`)

            // Wildcard matching (support cho các path có ID như /id)
            if (label === `header-title.${titleKey}`) {
                const wildcardPath = titleKey.replace(/\/[^/]+$/, '/*')
                const wildcardLabel = t(`header-title.${wildcardPath}`)
                if (wildcardLabel !== `header-title.${wildcardPath}`) {
                    label = wildcardLabel
                }
            }

            // Chỉ thêm vào breadcrumb nếu tìm thấy label hợp lệ trong i18n
            if (label !== `header-title.${titleKey}` && label !== `header-title.${titleKey.replace(/\/[^/]+$/, '/*')}`) {
                items.push({
                    title: isLast ? (
                        <span className="text-blue-600 font-semibold text-[11px] whitespace-nowrap">{label}</span>
                    ) : (
                        <Link to={currentPath} className="text-gray-400 hover:text-blue-500! text-[11px] transition-colors whitespace-nowrap">
                            {label}
                        </Link>
                    ),
                    key: currentPath,
                })
            }
        })

        return items
    }, [pathname, t])

    // Nếu chỉ có Trang chủ thì không hiển thị Breadcrumb
    if (breadcrumbItems.length <= 1) return null

    return (
        <Breadcrumb
            className={cn('select-none flex items-center', className)}
            separator={<span className="text-gray-300 text-[10px] mx-0.5">/</span>}
            items={breadcrumbItems}
        />
    )
}

export default BreadcrumbComponent
