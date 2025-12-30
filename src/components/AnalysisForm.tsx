import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { MagnifyingGlass, GithubLogo, Warning } from '@phosphor-icons/react'
import { isValidGitHubUrl } from '@/lib/github'
import { motion } from 'framer-motion'

interface AnalysisFormProps {
  onSubmit: (url: string) => void
  isLoading: boolean
}

export function AnalysisForm({ onSubmit, isLoading }: AnalysisFormProps) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!url.trim()) {
      setError('الرجاء إدخال رابط المستودع')
      return
    }

    if (!isValidGitHubUrl(url)) {
      setError('رابط GitHub غير صحيح. الرجاء إدخال رابط صحيح مثل: https://github.com/owner/repo')
      return
    }

    onSubmit(url.trim())
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="p-6 shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="repo-url" className="text-base font-semibold">
              رابط مستودع GitHub
            </Label>
            <div className="relative">
              <GithubLogo 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" 
                size={20} 
              />
              <Input
                id="repo-url"
                type="text"
                placeholder="https://github.com/owner/repository"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value)
                  setError('')
                }}
                className="pr-10 font-mono text-sm"
                disabled={isLoading}
                dir="ltr"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              أدخل رابط المستودع العام لتطبيق TypeScript أو Python
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <Warning size={18} className="ml-2" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            className="w-full gap-2 text-base py-6"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <MagnifyingGlass size={20} />
                </motion.div>
                جاري التحليل...
              </>
            ) : (
              <>
                <MagnifyingGlass size={20} />
                تحليل المستودع
              </>
            )}
          </Button>
        </form>
      </Card>
    </motion.div>
  )
}
