import { Component, type ReactNode, type ErrorInfo } from 'react'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onReset?: () => void
}

export interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Unhandled React Error Boundary Exception:', error, errorInfo)
    toast.error('An unexpected rendering error occurred.')
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    }
  }

  private handleReload = (): void => {
    window.location.reload()
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="p-8 md:p-12 rounded-sm border border-destructive/30 bg-destructive/5 backdrop-blur-md text-center flex flex-col items-center justify-center space-y-4 my-6 max-w-xl mx-auto shadow-sm">
          <div className="w-14 h-14 rounded-sm bg-destructive/10 text-destructive flex items-center justify-center shadow-inner border border-destructive/20">
            <Icon name="error" size="xl" />
          </div>

          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base font-bold text-foreground tracking-tight">
              Something went wrong
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              We encountered an unexpected application error. You can attempt to retry rendering or reload the page.
            </p>
          </div>

          {import.meta.env.DEV && this.state.error && (
            <div className="w-full text-left p-3 rounded-sm bg-background/80 border border-border/70 text-[11px] font-mono text-destructive overflow-x-auto max-h-32">
              {this.state.error.message}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={this.handleReset}
              className="rounded-sm text-xs font-semibold h-9 px-4"
            >
              <Icon name="refresh" size="xs" className="mr-1.5" />
              Try Again
            </Button>

            <Button
              variant="default"
              size="sm"
              onClick={this.handleReload}
              className="rounded-sm bg-primary text-primary-foreground text-xs font-semibold h-9 px-4 shadow-sm"
            >
              Reload Page
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
