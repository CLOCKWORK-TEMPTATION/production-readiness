import { ProductionReport } from '@/types/report'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { StatusBadge } from './StatusBadge'
import { GithubLogo, CalendarBlank, Trash } from '@phosphor-icons/react'
import { motion } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'

interface ReportHistoryProps {
  reports: ProductionReport[]
  onSelectReport: (report: ProductionReport) => void
  onDeleteReport: (reportId: string) => void
  selectedReportId?: string
}

export function ReportHistory({ reports, onSelectReport, onDeleteReport, selectedReportId }: ReportHistoryProps) {
  if (reports.length === 0) {
    return null
  }

  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="p-4 shadow-md">
        <h3 className="text-lg font-semibold mb-3 text-primary">التقارير السابقة</h3>
        <ScrollArea className="h-[400px] pr-2">
          <div className="space-y-2">
            {reports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`p-3 cursor-pointer transition-all hover:shadow-md ${
                    selectedReportId === report.id ? 'border-primary border-2 bg-primary/5' : 'border'
                  }`}
                  onClick={() => onSelectReport(report)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <GithubLogo size={14} className="text-muted-foreground flex-shrink-0" />
                        <code className="text-xs font-mono bg-secondary px-1.5 py-0.5 rounded truncate">
                          {report.repository.owner}/{report.repository.repo}
                        </code>
                      </div>
                      <StatusBadge status={report.overallStatus} size="sm" />
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <CalendarBlank size={12} />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 w-8 p-0"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDeleteReport(report.id)
                      }}
                    >
                      <Trash size={16} />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </Card>
    </motion.div>
  )
}
