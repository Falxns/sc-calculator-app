import { Component, type ErrorInfo, type ReactNode } from 'react';
import { useLocale } from '../../context/LocaleContext';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

const ErrorFallback = ({ onRetry }: { onRetry: () => void }) => {
  const { t } = useLocale();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-900 text-white">
      <div className="glass-container flex-col gap-4 p-6 max-w-md text-center">
        <h2 className="text-xl font-bold">{t('error.title')}</h2>
        <p className="text-sm text-white/80">{t('error.body')}</p>
        <button type="button" className="btn w-auto" onClick={onRetry}>
          {t('error.tryAgain')}
        </button>
      </div>
    </div>
  );
};

class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <ErrorFallback onRetry={() => this.setState({ hasError: false })} />
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
