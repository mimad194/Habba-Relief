import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-200" dir="ltr">
          <div className="bg-red-950/30 border border-red-500/50 p-6 rounded-2xl max-w-2xl w-full space-y-4">
            <h1 className="text-xl font-bold text-red-400">🔥 Application Crashed</h1>
            <p className="text-sm">A runtime error occurred. If you just added the `.env` file, please restart your development server (`npm run dev`).</p>
            <pre className="bg-black/50 p-4 rounded-xl text-xs text-red-200 overflow-auto whitespace-pre-wrap font-mono">
              {this.state.error?.message}
              {'\n\n'}
              {this.state.error?.stack}
            </pre>
            <button 
              onClick={() => window.location.reload()}
              className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
            >
              Reload Page
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
