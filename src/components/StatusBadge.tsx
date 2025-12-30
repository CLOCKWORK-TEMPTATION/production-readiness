import { Badge } from '@/components/ui/badge'
import { ReadinessStatus } from '@/types/report'
import { CheckCircle, Warning, XCircle, Question } from '@phosphor-icons/react'

interface StatusBadgeProps {
  status: ReadinessStatus
  size?: 'sm' | 'md' | 'lg'
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const configs = {
    ready: {
      label: 'جاهز',
      className: 'bg-success text-success-foreground',
      icon: CheckCircle
    },
    conditional: {
      label: 'جاهز بشروط',
      className: 'bg-warning text-warning-foreground',
      icon: Warning
    },
    'not-ready': {
      label: 'غير جاهز',
      className: 'bg-destructive text-destructive-foreground',
      icon: XCircle
    },
    unknown: {
      label: 'غير معروف',
      className: 'bg-muted text-muted-foreground',
      icon: Question
    }
  }

  const config = configs[status] || configs.unknown
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5'
  }

  return (
    <Badge className={`${config.className} ${sizeClasses[size]} gap-1.5 font-semibold`}>
      <Icon size={size === 'sm' ? 14 : size === 'md' ? 16 : 18} weight="fill" />
      {config.label}
    </Badge>
  )
}
