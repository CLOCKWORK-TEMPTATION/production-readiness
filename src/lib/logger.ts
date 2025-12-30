type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL'

interface LogEntry {
  level: LogLevel
  message: string
  details?: any
  stack?: string
  url?: string
  userAgent?: string
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isTest = typeof process !== 'undefined' && process.env.NODE_ENV === 'test'

  private async sendToServer(entry: LogEntry): Promise<void> {
    // Skip in test environment or production
    if (this.isTest || !this.isDevelopment) return

    try {
      await fetch('/api/log', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      })
    } catch {
      // Silent fail - logging to server is optional
    }
  }

  private log(level: LogLevel, message: string, ...args: any[]): void {
    const entry: LogEntry = {
      level,
      message,
      details: args.length > 0 ? args : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }

    // استخراج stack trace للأخطاء
    if (level === 'ERROR' || level === 'FATAL') {
      try {
        throw new Error()
      } catch (e: any) {
        entry.stack = e.stack
      }
    }

    // طباعة في console المتصفح
    const consoleMethod = level === 'DEBUG' ? 'debug' :
                         level === 'INFO' ? 'info' :
                         level === 'WARN' ? 'warn' :
                         'error'

    console[consoleMethod](`[${level}]`, message, ...args)

    // إرسال للخادم لحفظه في ملف
    this.sendToServer(entry)
  }

  debug(message: string, ...args: any[]): void {
    this.log('DEBUG', message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.log('INFO', message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.log('WARN', message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.log('ERROR', message, ...args)
  }

  fatal(message: string, ...args: any[]): void {
    this.log('FATAL', message, ...args)
  }
}

const logger = new Logger()

export default logger
