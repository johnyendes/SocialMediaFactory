'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCw, Bug, Send } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
  errorId: string
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      errorId: this.generateErrorId()
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorId: ErrorBoundary.generateErrorId()
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    })

    // Log error to monitoring service
    this.logError(error, errorInfo)

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }
  }

  public static generateErrorId(): string {
    return `err-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  private generateErrorId(): string {
    return ErrorBoundary.generateErrorId()
  }

  private logError = (error: Error, errorInfo: ErrorInfo) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Simulate sending to error monitoring
      const errorData = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // Store in localStorage for demo purposes
      const existingErrors = JSON.parse(localStorage.getItem('error-logs') || '[]')
      existingErrors.push(errorData)
      localStorage.setItem('error-logs', JSON.stringify(existingErrors.slice(-10))) // Keep last 10 errors
    }
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: this.generateErrorId()
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private sendErrorReport = () => {
    const { error, errorInfo, errorId } = this.state
    
    if (!error || !errorInfo) return

    const reportData = {
      errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }

    // Simulate sending error report
    console.log('Error report sent:', reportData)
    
    // In production, this would send to your error tracking service
    // fetch('/api/error-report', { method: 'POST', body: JSON.stringify(reportData) })
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                <p className="mb-2">
                  We encountered an unexpected error. Our team has been notified and is working to fix this issue.
                </p>
                {process.env.NODE_ENV === 'development' && this.state.error && (
                  <details className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <summary className="cursor-pointer font-medium mb-2">
                      Error Details (Development Only)
                    </summary>
                    <div className="space-y-2 text-xs">
                      <div>
                        <strong>Error ID:</strong> {this.state.errorId}
                      </div>
                      <div>
                        <strong>Message:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack Trace:</strong>
                          <pre className="mt-1 whitespace-pre-wrap bg-red-50 p-2 rounded">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleReload}>
                  Reload Page
                </Button>
                {process.env.NODE_ENV === 'production' && (
                  <Button variant="outline" onClick={this.sendErrorReport} className="flex items-center gap-2">
                    <Send className="h-4 w-4" />
                    Send Report
                  </Button>
                )}
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="text-xs text-gray-500 border-t pt-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Bug className="h-3 w-3" />
                    <span>Development Mode - Full error details shown above</span>
                  </div>
                  <p>
                    Error ID: {this.state.errorId}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for functional components
export const useErrorHandler = () => {
  return (error: Error, errorInfo?: ErrorInfo) => {
    console.error('Error caught by error handler:', error, errorInfo)
    
    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo?.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }

      // Store in localStorage for demo
      const existingErrors = JSON.parse(localStorage.getItem('error-logs') || '[]')
      existingErrors.push({ ...errorData, id: ErrorBoundary.generateErrorId() })
      localStorage.setItem('error-logs', JSON.stringify(existingErrors.slice(-10)))
    }
  }
}