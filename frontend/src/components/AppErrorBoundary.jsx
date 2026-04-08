import { Component } from 'react';

class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error?.message || 'Unexpected application error',
    };
  }

  componentDidCatch(error) {
    console.error('AppErrorBoundary caught an error:', error);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center px-6">
          <section className="w-full max-w-lg glass p-8 text-center">
            <span className="text-4xl">⚠️</span>
            <h1 className="mt-4 text-2xl font-bold text-red-300">Something went wrong</h1>
            <p className="mt-3 text-sm text-neutral-400">
              The app hit an unexpected error while rendering or processing data.
            </p>
            <div className="mt-4 rounded-xl bg-neutral-900/80 border border-neutral-800 px-4 py-3">
              <p className="text-xs text-neutral-500 font-mono break-all">{this.state.errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={this.handleReload}
              className="btn-primary mt-6"
            >
              Reload app
            </button>
          </section>
        </main>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
