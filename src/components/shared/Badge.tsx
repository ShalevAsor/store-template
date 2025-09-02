import { Badge as ShadcnBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "secondary" | "destructive" | "outline";
  size?: "sm" | "md" | "lg";
  className?: string;
  type?: "category" | "digital" | "stock" | "sale" | "status";
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = "default",
  size = "sm",
  className,
  type,
}) => {
  // Type-specific styling
  const getTypeStyles = () => {
    switch (type) {
      case "category":
        return "bg-gray-100 text-gray-700 hover:bg-gray-200";
      case "digital":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200";
      case "stock":
        return "bg-green-100 text-green-800 hover:bg-green-200";
      case "sale":
        return "bg-red-100 text-red-800 hover:bg-red-200";
      case "status":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
      default:
        return "";
    }
  };

  // Size-specific styling
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return "text-xs px-2 py-1";
      case "md":
        return "text-sm px-3 py-1";
      case "lg":
        return "text-base px-4 py-2";
      default:
        return "text-xs px-2 py-1";
    }
  };

  return (
    <ShadcnBadge
      variant={type ? "outline" : variant}
      className={cn(getSizeStyles(), type && getTypeStyles(), className)}
    >
      {children}
    </ShadcnBadge>
  );
};
