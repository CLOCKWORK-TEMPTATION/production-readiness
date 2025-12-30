import React, { useState, useEffect, useCallback } from 'react'
import logger from './lib/logger'
import { ProductionReport } from '@/types/report'
import { AnalysisForm } from '@/components/AnalysisForm'
import { ReportView } from '@/components/ReportView'
import { ReportHistory } from '@/components/ReportHistory'
import { parseGitHubUrl } from '@/lib/github'
import { generateProductionReport } from '@/lib/analyzer'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { toast } from 'sonner'
import { FileText, Warning, Plus } from '@phosphor-icons/react'
import { motion } from 'framer-motion'

function useKV<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })

  const setStoredValue = useCallback((valueOrFn: T | ((prev: T) => T)) => {
    const newValue = typeof valueOrFn === 'function' ? (valueOrFn as (prev: T) => T)(value) : valueOrFn
    setValue(newValue)
    try {
      localStorage.setItem(key, JSON.stringify(newValue))
    } catch {
      // Ignore localStorage errors
    }
  }, [key, value])

  return [value, setStoredValue]
}

function App() {
  const [reports, setReports] = useKV<ProductionReport[]>('production-reports', [])
  const [currentReport, setCurrentReport] = useState<ProductionReport | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAnalyze = async (url: string) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const parsed = parseGitHubUrl(url)
      if (!parsed) {
        throw new Error('رابط غير صحيح')
      }

      const report = await generateProductionReport(parsed.owner, parsed.repo, url)
      
      setCurrentReport(report)
      setReports((currentReports) => [report, ...(currentReports || [])])
      
      toast.success('تم إنشاء التقرير بنجاح')
    } catch (err) {
      logger.error('Analysis error:', err)
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء التحليل'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleSelectReport = (report: ProductionReport) => {
    setCurrentReport(report)
    setError(null)
  }

  const handleDeleteReport = (reportId: string) => {
    setReports((currentReports) => (currentReports || []).filter(r => r.id !== reportId))
    
    if (currentReport?.id === reportId) {
      setCurrentReport(null)
    }
    
    toast.success('تم حذف التقرير')
  }

  const handleNewAnalysis = () => {
    setCurrentReport(null)
    setError(null)
  }

  const handleExport = () => {
    if (!currentReport) return

    // Add guards for undefined arrays
    const domains = currentReport.domains || []
    const criticalIssues = currentReport.criticalIssues || []
    const recommendations = currentReport.recommendations || []

    const reportText = `
# تقرير جاهزية الإنتاج

## معلومات المستودع
- الرابط: ${currentReport.repository.url}
- المالك: ${currentReport.repository.owner}
- الاسم: ${currentReport.repository.repo}
- تاريخ التحليل: ${new Date(currentReport.createdAt).toLocaleString('ar-SA')}

## الحالة العامة
${currentReport.overallStatus === 'ready' ? '✅ جاهز' : currentReport.overallStatus === 'conditional' ? '⚠️ جاهز بشروط' : '❌ غير جاهز'}

## نظرة عامة
${currentReport.summary}

## تقييم المجالات

${domains.length > 0 ? domains.map((domain, i) => `
### ${i + 1}. ${domain.title}
**الحالة:** ${domain.status === 'ready' ? '✅ جاهز' : domain.status === 'conditional' ? '⚠️ جاهز بشروط' : domain.status === 'not-ready' ? '❌ غير جاهز' : '❓ غير معروف'}

**الوصف:** ${domain.description}

**الملاحظات:**
${(domain.findings || []).map(f => `- ${f}`).join('\n')}

**التوصيات:**
${(domain.recommendations || []).map(r => `- ${r}`).join('\n')}
`).join('\n') : 'لا توجد بيانات تقييم المجالات'}

## المشاكل الحرجة
${criticalIssues.length > 0 ? criticalIssues.map(i => `- ${i}`).join('\n') : 'لا توجد مشاكل حرجة'}

## التوصيات العامة
${recommendations.length > 0 ? recommendations.map(r => `- ${r}`).join('\n') : 'لا توجد توصيات'}

## الخلاصة
${currentReport.conclusion}

---
تم إنشاء هذا التقرير بواسطة محلل جاهزية الإنتاج
`

    const blob = new Blob([reportText], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `production-readiness-${currentReport.repository.repo}-${Date.now()}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    toast.success('تم تصدير التقرير')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-background flex flex-col">
      <motion.header
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center py-12 px-4"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <FileText size={40} className="text-primary" weight="duotone" />
          <h1 className="text-4xl md:text-5xl font-bold text-primary">
            محلل جاهزية الإنتاج
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          أداة ذكية لتقييم جاهزية تطبيقات TypeScript وPython للنشر في بيئة إنتاجية
        </p>
      </motion.header>

      <main className="container mx-auto px-4 py-8 max-w-7xl flex-grow">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {!currentReport && (
              <AnalysisForm onSubmit={handleAnalyze} isLoading={isAnalyzing} />
            )}

            {error && (
              <Alert variant="destructive">
                <Warning size={18} className="ml-2" />
                <AlertTitle>خطأ</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {currentReport && (
              <div className="space-y-4">
                <Button
                  onClick={handleNewAnalysis}
                  variant="outline"
                  className="gap-2"
                >
                  <Plus size={18} />
                  تحليل جديد
                </Button>
                <ReportView report={currentReport} onExport={handleExport} />
              </div>
            )}
          </div>

          <aside className="lg:col-span-1">
            <ReportHistory
              reports={reports || []}
              onSelectReport={handleSelectReport}
              onDeleteReport={handleDeleteReport}
              selectedReportId={currentReport?.id}
            />
          </aside>
        </div>
      </main>
      
      <footer className="py-6 text-center text-sm text-muted-foreground border-t bg-background/50 backdrop-blur-sm">
        <p>© {new Date().getFullYear()} محلل جاهزية الإنتاج - تم التطوير لتعزيز كفاءة النشر التقني</p>
      </footer>
    </div>
  )
}

export default App
