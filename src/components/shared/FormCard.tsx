// components/shared/FormCard.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";

interface FormCardProps {
  /** Card title displayed in the header */
  title: string;
  /** Card content */
  children: ReactNode;
  /** Optional header content (buttons, icons, etc.) */
  headerContent?: ReactNode;
  /** Custom className for the card */
  className?: string;
  /** Custom className for the content area */
  contentClassName?: string;
}

/**
 * Reusable card component for forms
 * Provides consistent styling and structure across form sections
 */
export const FormCard: React.FC<FormCardProps> = ({
  title,
  children,
  headerContent,
  className,
  contentClassName = "space-y-6",
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        {headerContent ? (
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            {headerContent}
          </div>
        ) : (
          <CardTitle>{title}</CardTitle>
        )}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
};
