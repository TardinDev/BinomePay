/**
 * Error Reporting Service for BinomePay
 *
 * This service provides a centralized way to log and report errors.
 * In production, this would integrate with Sentry or similar services.
 *
 * To enable Sentry in production:
 * 1. Install: npx expo install @sentry/react-native
 * 2. Configure in app.json/app.config.js
 * 3. Set SENTRY_DSN environment variable
 * 4. Uncomment the Sentry integration code below
 */

// import * as Sentry from '@sentry/react-native'

export type ErrorSeverity = 'fatal' | 'error' | 'warning' | 'info' | 'debug'

export interface ErrorContext {
  userId?: string
  screen?: string
  action?: string
  extra?: Record<string, unknown>
}

interface ErrorReport {
  message: string
  severity: ErrorSeverity
  error?: Error
  context?: ErrorContext
  timestamp: string
}

class ErrorReportingService {
  private isInitialized = false
  private errorQueue: ErrorReport[] = []
  private userId: string | null = null

  /**
   * Initialize the error reporting service
   * Call this once when the app starts
   */
  async initialize(dsn?: string): Promise<void> {
    if (this.isInitialized) return

    try {
      // Uncomment to enable Sentry:
      // if (dsn && !__DEV__) {
      //   Sentry.init({
      //     dsn,
      //     enableAutoSessionTracking: true,
      //     sessionTrackingIntervalMillis: 30000,
      //     debug: __DEV__,
      //     tracesSampleRate: 1.0,
      //   })
      // }

      this.isInitialized = true
      if (__DEV__) console.log('Error reporting service initialized')

      // Process queued errors
      this.processQueue()
    } catch (error) {
      if (__DEV__) console.error('Failed to initialize error reporting:', error)
    }
  }

  /**
   * Set the current user for error context
   */
  setUser(userId: string | null, userData?: { name?: string; email?: string }): void {
    this.userId = userId

    // Uncomment to enable Sentry user tracking:
    // if (userId) {
    //   Sentry.setUser({ id: userId, ...userData })
    // } else {
    //   Sentry.setUser(null)
    // }
  }

  /**
   * Capture and report an error
   */
  captureError(
    error: Error | string,
    context?: ErrorContext,
    severity: ErrorSeverity = 'error'
  ): void {
    const errorObj = typeof error === 'string' ? new Error(error) : error
    const report = this.createReport(errorObj.message, severity, errorObj, context)

    if (!this.isInitialized) {
      this.errorQueue.push(report)
      return
    }

    this.sendReport(report)
  }

  /**
   * Capture a message (non-error)
   */
  captureMessage(
    message: string,
    context?: ErrorContext,
    severity: ErrorSeverity = 'info'
  ): void {
    const report = this.createReport(message, severity, undefined, context)

    if (!this.isInitialized) {
      this.errorQueue.push(report)
      return
    }

    this.sendReport(report)
  }

  /**
   * Log a breadcrumb for debugging
   */
  addBreadcrumb(
    category: string,
    message: string,
    data?: Record<string, unknown>,
    level: ErrorSeverity = 'info'
  ): void {
    if (__DEV__) {
      console.log(`[${category}] ${message}`, data)
    }

    // Uncomment to enable Sentry breadcrumbs:
    // Sentry.addBreadcrumb({
    //   category,
    //   message,
    //   data,
    //   level: this.mapSeverityToSentry(level),
    // })
  }

  /**
   * Wrap an async function with error reporting
   */
  wrapAsync<T>(
    fn: () => Promise<T>,
    context?: ErrorContext
  ): Promise<T> {
    return fn().catch((error) => {
      this.captureError(error, context)
      throw error
    })
  }

  /**
   * Create an error boundary handler
   */
  createErrorBoundaryHandler(componentName: string) {
    return (error: Error, componentStack: string) => {
      this.captureError(error, {
        screen: componentName,
        extra: { componentStack },
      }, 'fatal')
    }
  }

  // Private methods

  private createReport(
    message: string,
    severity: ErrorSeverity,
    error?: Error,
    context?: ErrorContext
  ): ErrorReport {
    return {
      message,
      severity,
      error,
      context: {
        ...context,
        userId: context?.userId || this.userId || undefined,
      },
      timestamp: new Date().toISOString(),
    }
  }

  private sendReport(report: ErrorReport): void {
    // Log in development
    if (__DEV__) {
      const logMethod = report.severity === 'error' || report.severity === 'fatal'
        ? console.error
        : report.severity === 'warning'
        ? console.warn
        : console.log

      logMethod(`[${report.severity.toUpperCase()}] ${report.message}`, {
        error: report.error,
        context: report.context,
      })
      return
    }

    // In production, send to Sentry:
    // if (report.error) {
    //   Sentry.captureException(report.error, {
    //     level: this.mapSeverityToSentry(report.severity),
    //     extra: report.context?.extra,
    //     tags: {
    //       screen: report.context?.screen,
    //       action: report.context?.action,
    //     },
    //   })
    // } else {
    //   Sentry.captureMessage(report.message, {
    //     level: this.mapSeverityToSentry(report.severity),
    //     extra: report.context?.extra,
    //     tags: {
    //       screen: report.context?.screen,
    //       action: report.context?.action,
    //     },
    //   })
    // }
  }

  private processQueue(): void {
    while (this.errorQueue.length > 0) {
      const report = this.errorQueue.shift()
      if (report) {
        this.sendReport(report)
      }
    }
  }

  // private mapSeverityToSentry(severity: ErrorSeverity): Sentry.SeverityLevel {
  //   switch (severity) {
  //     case 'fatal':
  //       return 'fatal'
  //     case 'error':
  //       return 'error'
  //     case 'warning':
  //       return 'warning'
  //     case 'info':
  //       return 'info'
  //     case 'debug':
  //       return 'debug'
  //     default:
  //       return 'error'
  //   }
  // }
}

// Export singleton instance
export const errorReporting = new ErrorReportingService()

// Convenience exports
export const captureError = errorReporting.captureError.bind(errorReporting)
export const captureMessage = errorReporting.captureMessage.bind(errorReporting)
export const addBreadcrumb = errorReporting.addBreadcrumb.bind(errorReporting)

export default errorReporting
