import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

interface ImagePlaceholderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  text?: string;
  showIcon?: boolean;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  className,
  size = "md",
  text = "No image available",
  showIcon = true,
}) => {
  // Size-specific styling
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          container: "w-16 h-16",
          icon: "w-6 h-6",
          text: "text-xs",
        };
      case "md":
        return {
          container: "w-24 h-24",
          icon: "w-8 h-8",
          text: "text-sm",
        };
      case "lg":
        return {
          container: "w-32 h-32",
          icon: "w-12 h-12",
          text: "text-base",
        };
      case "xl":
        return {
          container: "w-48 h-48",
          icon: "w-16 h-16",
          text: "text-lg",
        };
      default:
        return {
          container: "w-24 h-24",
          icon: "w-8 h-8",
          text: "text-sm",
        };
    }
  };

  const styles = getSizeStyles();

  return (
    <div
      className={cn(
        "bg-gray-100 flex flex-col items-center justify-center text-gray-400 rounded-lg",
        className
      )}
    >
      {showIcon && (
        <div
          className={cn(
            "bg-gray-200 rounded-lg flex items-center justify-center mb-2",
            styles.container
          )}
        >
          <ImageIcon className={cn("text-gray-400", styles.icon)} />
        </div>
      )}
      {text && <p className={cn("text-center px-2", styles.text)}>{text}</p>}
    </div>
  );
};
