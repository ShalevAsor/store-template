"use client";

import { useState, useEffect } from "react";
import { StockConfirmationModal } from "@/components/modals/StockConfirmationModal";
import { ConfirmActionModal } from "../modals/ConfrimActionModal";
import { RefundModal } from "../modals/RefundModal";
import { StatusSelectionModal } from "../modals/StatusSelectionModal ";

/**
 * ModalProvider Component
 *
 * Manages all application modals from a single location, implementing
 * delayed mounting to prevent SSR hydration issues.
 *
 * Key aspects:
 * - Prevents hydration mismatches through mounting control
 * - Centralizes modal management
 * - Ensures modals are only rendered client-side
 */
export const ModalProvider = () => {
  /**
   * Mounting State Management
   * Controls when modals become available to prevent SSR issues
   */
  const [isMounted, setIsMounted] = useState(false);
  /**
   * Delayed Mounting Effect
   * Ensures modals are only mounted after initial client-side render
   */
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Prevent rendering during SSR or initial mount

  if (!isMounted) return null;

  /**
   * Modal Registry
   * Renders all application modals in a single location
   * Each modal handles its own visibility state
   */
  return (
    <>
      <StockConfirmationModal />
      <ConfirmActionModal />
      <RefundModal />
      <StatusSelectionModal />
    </>
  );
};
