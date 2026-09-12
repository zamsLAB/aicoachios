import React, { Component, ErrorInfo, ReactNode } from "react";
import { RefreshCw, AlertTriangle } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught crash prevented by ErrorBoundary:", error, errorInfo);
  }

  public componentDidMount() {
    // Catch any global unhandled async errors or promise rejections on mobile webviews
    window.addEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  public componentWillUnmount() {
    window.removeEventListener("unhandledrejection", this.handleUnhandledRejection);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.warn("Global async rejection caught non-fatally:", event.reason);
    // Prevent default browser crash dialogs
    if (event.preventDefault) {
      event.preventDefault();
    }
  };

  private handleReset = () => {
    try {
      localStorage.removeItem("coaching_diary_logs_corrupted");
    } catch (e) {}
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center select-none font-sans">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center mb-4 text-rose-400">
            <AlertTriangle size={32} />
          </div>
          <h1 className="text-xl font-bold text-slate-100 mb-2">화면을 불러오는 중 일시적인 오류가 발생했습니다</h1>
          <p className="text-sm text-slate-400 max-w-sm mb-6 leading-relaxed">
            데이터를 안전하게 보존 중입니다. 아래 버튼을 눌러 앱을 다시 시작해 주세요.
          </p>
          <button
            onClick={this.handleReset}
            className="flex items-center space-x-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-violet-600/30 transition-all cursor-pointer"
          >
            <RefreshCw size={16} />
            <span>앱 새로고침</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
