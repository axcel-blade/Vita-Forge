import React from "react";
import "./ErrorBoundary.css";

/**
 * Enhanced Error Boundary Component
 * Catches JavaScript errors and displays friendly error messages
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorMessage: error.message || "An unexpected error occurred" };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <section className="mx-auto max-w-3xl px-4 py-16 text-center relative">
          <div className="animate-bounce mb-6">
            <span role="img" aria-label="error">😵</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Something went wrong</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-xl mx-auto">
            We encountered an unexpected error. Don't worry, we're here to help!
          </p>
          
          {this.state.errorMessage && (
            <details className="mt-6 text-left bg-red-50 p-4 rounded-lg border border-red-200 animate-slide-up">
              <summary className="cursor-pointer font-semibold text-red-800 hover:text-red-900">
                Technical Details
              </summary>
              <pre className="mt-2 overflow-auto bg-white p-3 rounded border border-red-100 text-xs text-red-700 whitespace-pre-wrap">
                {this.state.errorMessage}
              </pre>
            </details>
          )}

          <div className="mt-8 flex flex-wrap justify-center gap-4 animate-fade-in">
            <button
              onClick={this.handleRefresh}
              className="btn btn-primary px-6 py-3 rounded-lg hover:bg-blue-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 shadow-lg glow-primary"
            >
              🔄 Refresh Page
            </button>

            <a
              href="/"
              onClick={this.handleGoHome}
              className="btn btn-secondary px-6 py-3 rounded-lg hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500 transition-all"
            >
              🏠 Go Home
            </a>

            <button
              onClick={() => window.open("https://github.com", "_blank")}
              className="btn btn-outline px-6 py-3 rounded-lg hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 transition-all"
            >
              🐙 Report Issue
            </button>
          </div>
        </section>
      );
    }

    return this.props.children;
  }
}
