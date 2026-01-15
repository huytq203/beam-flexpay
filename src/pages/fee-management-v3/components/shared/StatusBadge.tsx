// ============================================
// StatusBadge - Reusable Status Display Component
// ============================================

import React, { memo } from 'react'
import { getEnumLabel } from '../../utils'
import { statusType } from '@type/feePolicies'
import type { FeeStatus } from '../../types'

// ============================================
// Types
// ============================================
interface StatusBadgeProps {
  status: string
  className?: string
}

// ============================================
// Status Configuration
// ============================================
const STATUS_STYLES: Record<FeeStatus, string> = {
  ACTIVE: 'bg-green-50 border border-green-800 text-green-800',
  INIT: 'bg-blue-50 border border-blue-400 text-blue-800',
  INACTIVE: 'bg-red-50 border border-red-800 text-red-800'
}

const getStatusStyle = (status: string): string => {
  return STATUS_STYLES[status as FeeStatus] || STATUS_STYLES.INACTIVE
}

// ============================================
// Component
// ============================================
/**
 * StatusBadge - Displays a colored badge based on status
 *
 * @remarks
 * Uses React.memo to prevent unnecessary re-renders when status hasn't changed.
 * The styling is derived from a configuration object for easy maintenance.
 *
 * @example
 * <StatusBadge status="ACTIVE" />
 * <StatusBadge status="INIT" className="ml-2" />
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = '' }) => {
  const baseClass = 'px-2 rounded-md whitespace-nowrap text-xs font-medium'
  const statusStyle = getStatusStyle(status)

  return (
    <span className={`${baseClass} ${statusStyle} ${className}`}>
      {getEnumLabel(status, statusType)}
    </span>
  )
}

// ============================================
// Memoized Export
// ============================================
/**
 * Memoized StatusBadge to prevent re-renders when props haven't changed.
 * This is beneficial since StatusBadge is often rendered in table rows.
 */
export default memo(StatusBadge)
