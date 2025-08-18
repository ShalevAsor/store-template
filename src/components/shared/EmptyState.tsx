import { ShoppingCart, Package, Search, FileX } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  variant?: "cart" | "products" | "search" | "generic";
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  variant = "generic",
  title,
  description,
  actionLabel,
  onAction,
  className,
}) => {
  const variants = {
    cart: {
      icon: ShoppingCart,
      defaultTitle: "Your cart is empty",
      defaultDescription: "Add some products to get started",
      defaultActionLabel: "Continue Shopping",
    },
    products: {
      icon: Package,
      defaultTitle: "No products found",
      defaultDescription:
        "We couldn't find any products matching your criteria",
      defaultActionLabel: "Browse All Products",
    },
    search: {
      icon: Search,
      defaultTitle: "No results found",
      defaultDescription:
        "Try adjusting your search terms or browse our categories",
      defaultActionLabel: "Clear Search",
    },
    generic: {
      icon: FileX,
      defaultTitle: "Nothing here yet",
      defaultDescription: "Check back later for updates",
      defaultActionLabel: "Go Back",
    },
  };

  const config = variants[variant];
  const IconComponent = config.icon;

  const displayTitle = title || config.defaultTitle;
  const displayDescription = description || config.defaultDescription;
  const displayActionLabel = actionLabel || config.defaultActionLabel;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center py-12 px-4",
        className
      )}
    >
      <div className="mb-4 p-3 bg-gray-100 rounded-full">
        <IconComponent className="w-8 h-8 text-gray-400" aria-hidden="true" />
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {displayTitle}
      </h3>

      <p className="text-gray-500 text-sm mb-6 max-w-sm">
        {displayDescription}
      </p>

      {onAction && (
        <button
          onClick={onAction}
          className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {displayActionLabel}
        </button>
      )}
    </div>
  );
};
