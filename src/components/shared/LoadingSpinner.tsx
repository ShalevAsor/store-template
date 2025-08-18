import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  text?: string;
}
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
  text,
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };
  const SpinnerIcon = (
    <Loader2
      className={cn("animate-spin", sizeClasses[size], className)}
      aria-hidden="true"
    />
  );
  if (text) {
    return (
      <div className="flex items-center justify-center gap-2" role="status">
        {SpinnerIcon}
        <span className="text-sm text-gray-600">{text}</span>
        <span className="sr-only">Loading...</span>
      </div>
    );
  }
  return (
    <div role="status">
      {SpinnerIcon}
      <span className="sr-only">Loading...</span>
    </div>
  );
};
