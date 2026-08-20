import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { Icon } from '@/components/common/Icon'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class RouteErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught Route Error:', error, errorInfo)
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null })
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6">
          <div className="max-w-md w-full text-center space-y-6 rounded-sm border border-border/80 bg-card p-8 shadow-2xl backdrop-blur-xl">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-sm bg-destructive/10 text-destructive border border-destructive/20 shadow-inner">
              <Icon name="navigation" size="lg" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black font-heading tracking-tight text-foreground">
                Route Execution Interrupted
              </h2>
              <p className="text-xs text-muted-foreground leading-relaxed">
                An unexpected error occurred while loading this page layout. Please return to safety or reload the platform.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Button
                variant="default"
                size="sm"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto rounded-sm h-10 px-6 font-semibold gap-2 shadow-sm"
              >
                <Icon name="sparkles" size="xs" />
                <span>Reload Page</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={this.handleReset}
                className="w-full sm:w-auto rounded-sm h-10 px-6 font-semibold gap-2 border-border/80"
              >
                <Icon name="navigation" size="xs" />
                <span>Back to Home</span>
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default RouteErrorBoundary
