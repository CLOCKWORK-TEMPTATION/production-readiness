import { Plugin } from 'vite'
import fs from 'fs'
import path from 'path'

interface LogEntry {
  timestamp: string
  level: string
  message: string
  details?: any
  stack?: string
  url?: string
  userAgent?: string
}

export function loggerPlugin(): Plugin {
  let logsDir: string

  return {
    name: 'vite-logger-plugin',
    
    configResolved(config) {
      // إنشاء مجلد logs في جذر المشروع
      logsDir = path.resolve(config.root, 'logs')
      
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true })
      }
    },

    configureServer(server) {
      // إضافة endpoint لاستقبال logs من المتصفح
      server.middlewares.use('/api/log', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method Not Allowed')
          return
        }

        let body = ''
        req.on('data', chunk => {
          body += chunk.toString()
        })

        req.on('end', () => {
          try {
            const logEntry: LogEntry = JSON.parse(body)
            
            // إنشاء اسم ملف حسب التاريخ والمستوى
            const date = new Date().toISOString().split('T')[0]
            const logFileName = `${date}-${logEntry.level.toLowerCase()}.log`
            const logFilePath = path.join(logsDir, logFileName)

            // تنسيق السجل
            const timestamp = new Date().toISOString()
            const logLine = JSON.stringify({
              ...logEntry,
              timestamp
            }, null, 2)

            // حفظ السجل في الملف
            fs.appendFileSync(logFilePath, logLine + '\n---\n', 'utf-8')

            // طباعة في console الخادم
            console.log(`[${logEntry.level}] ${logEntry.message}`)
            if (logEntry.stack) {
              console.log(logEntry.stack)
            }

            res.statusCode = 200
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          } catch (error) {
            console.error('Error processing log:', error)
            res.statusCode = 500
            res.end(JSON.stringify({ error: 'Failed to process log' }))
          }
        })
      })
    }
  }
}
