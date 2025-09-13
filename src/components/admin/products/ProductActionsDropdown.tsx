"use client";

import {
  ActionsDropdown,
  ActionConfig,
} from "@/components/shared/ActionsDropdown";
import { Edit, Trash2, Eye } from "lucide-react";

interface ProductActionsDropdownProps {
  productId: string;
  productSlug: string;
  onDelete: () => void;
  isDeleting?: boolean;
}

export const ProductActionsDropdown: React.FC<ProductActionsDropdownProps> = ({
  productId,
  productSlug,
  onDelete,
  isDeleting = false,
}) => {
  // Configure actions for products
  const actions: ActionConfig[] = [
    {
      type: "link",
      label: "View Product",
      icon: Eye,
      href: `/products/${productSlug}`,
      target: "_blank",
    },
    {
      type: "separator",
    },
    {
      type: "link",
      label: "Edit",
      icon: Edit,
      href: `/admin/products/${productId}/edit`,
    },
    {
      type: "button",
      label: isDeleting ? "Deleting..." : "Delete",
      icon: Trash2,
      onClick: onDelete,
      disabled: isDeleting,
      className: "text-red-600 focus:text-red-600",
    },
  ];

  return <ActionsDropdown actions={actions} label="Actions" />;
};
