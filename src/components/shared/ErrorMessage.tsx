import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  message: string;
  variant?: "error" | "warning" | "info";
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  variant = "error",
  onRetry,
  onDismiss,
  className,
}) => {
  const variants = {
    error: {
      container: "bg-red-50 border-red-200 text-red-800",
      icon: AlertCircle,
      iconColor: "text-red-500",
    },
    warning: {
      container: "bg-yellow-50 border-yellow-200 text-yellow-800",
      icon: AlertTriangle,
      iconColor: "text-yellow-500",
    },
    info: {
      container: "bg-blue-50 border-blue-200 text-blue-800",
      icon: Info,
      iconColor: "text-blue-500",
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 border rounded-lg",
        config.container,
        className
      )}
      role="alert"
      aria-live="polite"
    >
      <IconComponent
        className={cn("w-5 h-5 mt-0.5 flex-shrink-0", config.iconColor)}
        aria-hidden="true"
      />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{message}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className={cn(
              "mt-2 text-sm font-medium underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-offset-2 rounded",
              variant === "error" && "text-red-700 focus:ring-red-500",
              variant === "warning" && "text-yellow-700 focus:ring-yellow-500",
              variant === "info" && "text-blue-700 focus:ring-blue-500"
            )}
          >
            Try again
          </button>
        )}
      </div>

      {onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            "flex-shrink-0 p-1 rounded hover:bg-black/10 focus:outline-none focus:ring-2 focus:ring-offset-2",
            variant === "error" && "focus:ring-red-500",
            variant === "warning" && "focus:ring-yellow-500",
            variant === "info" && "focus:ring-blue-500"
          )}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
