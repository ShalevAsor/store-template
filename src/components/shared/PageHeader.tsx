import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
}

/**
 * Reusable page header component
 * Provides consistent styling and layout for page titles and descriptions.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl font-bold text-gray-900 truncate">{title}</h1>
        {description && (
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
