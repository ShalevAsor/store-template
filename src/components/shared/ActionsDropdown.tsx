// components/shared/ActionsDropdown.tsx
"use client";

import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { LucideIcon } from "lucide-react";

// Action configuration interface
export interface ActionConfig {
  type: "link" | "button" | "separator";
  label?: string;
  icon?: LucideIcon;
  href?: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  target?: string;
}

interface ActionsDropdownProps {
  actions: ActionConfig[];
  label?: string;
  className?: string;
}

export const ActionsDropdown: React.FC<ActionsDropdownProps> = ({
  actions,
  label = "Actions",
  className,
}) => {
  const renderAction = (action: ActionConfig, index: number) => {
    // Handle separator
    if (action.type === "separator") {
      return <DropdownMenuSeparator key={`separator-${index}`} />;
    }

    const IconComponent = action.icon;

    // Handle link action
    if (action.type === "link" && action.href) {
      return (
        <DropdownMenuItem key={`link-${index}`} asChild>
          <Link
            href={action.href}
            target={action.target}
            className={action.className}
          >
            {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
            {action.label}
          </Link>
        </DropdownMenuItem>
      );
    }

    // Handle button action
    if (action.type === "button" && action.onClick) {
      return (
        <DropdownMenuItem
          key={`button-${index}`}
          onClick={action.onClick}
          disabled={action.disabled}
          className={action.className}
        >
          {IconComponent && <IconComponent className="mr-2 h-4 w-4" />}
          {action.label}
        </DropdownMenuItem>
      );
    }

    return null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className={`h-8 w-8 p-0 ${className || ""}`}>
          <span className="sr-only">Open {label}</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{label}</DropdownMenuLabel>
        {actions.map((action, index) => renderAction(action, index))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
