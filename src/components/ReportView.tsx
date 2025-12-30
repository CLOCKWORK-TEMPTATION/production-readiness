import { ProductionReport } from '@/types/report'
import { Card } from '@/components/ui/card'
import { StatusBadge } from './StatusBadge'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { DownloadSimple, GithubLogo, CalendarBlank } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

interface ReportViewProps {
  report: ProductionReport
  onExport?: () => void
}

export function ReportView({ report, onExport }: ReportViewProps) {
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate)
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Helper to safely extract text from string or object format
  const getTextContent = (item: any): string => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') {
      return item.description || item.text || JSON.stringify(item)
    }
    return String(item || '')
  }

  // Helper to ensure we always have an array
  const ensureArray = (item: any): any[] => {
    if (!item) return []
    if (Array.isArray(item)) return item
    if (typeof item === 'string') return [item]
    // If it's an object with numbered keys (like array-like object), try to convert
    if (typeof item === 'object') return [item]
    return []
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <Card className="p-6 shadow-lg border-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold mb-2 text-primary">
                تقرير جاهزية الإنتاج
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 flex-wrap">
                <GithubLogo size={18} />
                <code className="font-mono text-xs bg-secondary px-2 py-1 rounded">
                  {report.repository.owner}/{report.repository.repo}
                </code>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarBlank size={16} />
                <span>{formatDate(report.createdAt)}</span>
              </div>
            </div>
            <div className="flex flex-col gap-3 items-end">
              <StatusBadge status={report.overallStatus} size="lg" />
              {onExport && (
                <Button
                  onClick={onExport}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  <DownloadSimple size={16} />
                  تصدير التقرير
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-3 text-primary">نظرة عامة</h2>
        <p className="text-base leading-relaxed">{report.summary}</p>
      </Card>

      {ensureArray(report.criticalIssues).length > 0 && (
        <Card className="p-6 shadow-md border-destructive/50 bg-destructive/5">
          <h2 className="text-xl font-semibold mb-3 text-destructive">المشاكل الحرجة</h2>
          <ul className="space-y-2">
            {ensureArray(report.criticalIssues).map((issue, index) => (
              <li key={index} className="flex gap-2 items-start">
                <span className="text-destructive mt-1">•</span>
                <span className="flex-1">{getTextContent(issue)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-primary">تقييم المجالات</h2>
        <Accordion type="multiple" defaultValue={ensureArray(report.domains).map((_, i) => `domain-${i}`)} className="space-y-2">
          {ensureArray(report.domains).map((domain, index) => (
            <AccordionItem key={index} value={`domain-${index}`} className="border rounded-lg px-4">
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-center gap-3 flex-1 text-right">
                  <StatusBadge status={domain.status} size="sm" />
                  <span className="font-semibold text-base">{domain.title}</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4 pt-2">
                <div className="space-y-4 pr-4">
                  <p className="text-muted-foreground leading-relaxed">{domain.description}</p>

                  {ensureArray(domain.findings).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">الملاحظات:</h4>
                      <ul className="space-y-1.5">
                        {ensureArray(domain.findings).map((finding, i) => (
                          <li key={i} className="flex gap-2 items-start text-sm">
                            <span className="text-primary mt-1">•</span>
                            <span className="flex-1">{getTextContent(finding)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {ensureArray(domain.recommendations).length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 text-sm">التوصيات:</h4>
                      <ul className="space-y-1.5">
                        {ensureArray(domain.recommendations).map((rec, i) => (
                          <li key={i} className="flex gap-2 items-start text-sm">
                            <span className="text-accent mt-1">•</span>
                            <span className="flex-1">{getTextContent(rec)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {ensureArray(report.recommendations).length > 0 && (
        <Card className="p-6 shadow-md border-accent/30 bg-accent/5">
          <h2 className="text-xl font-semibold mb-3 text-primary">التوصيات العامة</h2>
          <ul className="space-y-2">
            {ensureArray(report.recommendations).map((rec, index) => (
              <li key={index} className="flex gap-2 items-start">
                <span className="text-accent mt-1">•</span>
                <span className="flex-1">{getTextContent(rec)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="p-6 shadow-md bg-secondary/50">
        <h2 className="text-xl font-semibold mb-3 text-primary">الخلاصة</h2>
        <p className="text-base leading-relaxed mb-4">{report.conclusion}</p>
        <Separator className="my-4" />
        <div className="flex items-center gap-2">
          <span className="font-semibold">الحالة النهائية:</span>
          <StatusBadge status={report.overallStatus} size="md" />
        </div>
      </Card>
    </motion.div>
  )
}
