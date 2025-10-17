"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useModalStore } from "@/store/modalStore";
import { formatPrice } from "@/utils/currencyUtils";
import { AlertTriangle, Minus, X } from "lucide-react";

export const StockConfirmationModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();

  const isModalOpen = isOpen && type === "stockConfirmation";

  const { stockConfirmation: stockData } = data;

  if (!stockData) return null;

  const {
    stockAdjustments,
    originalTotal,
    adjustedTotal,
    onConfirm,
    onCancel,
  } = stockData;

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };
  const handleCancel = () => {
    onCancel();
    onClose();
  };
  const savings = originalTotal - adjustedTotal;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <DialogTitle>Stock Update Required</DialogTitle>
          </div>
          <DialogDescription>
            {
              "Some items in your cart have limited availability. We've updated your order below."
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stock Adjustments List */}
          <div className="space-y-3">
            {stockAdjustments.map((adjustment) => (
              <div
                key={adjustment.productId}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-shrink-0">
                  {adjustment.action === "removed" ? (
                    <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                      <X className="w-4 h-4 text-red-600" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center">
                      <Minus className="w-4 h-4 text-amber-600" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 truncate">
                    {adjustment.productName}
                  </h4>
                  {adjustment.action === "removed" ? (
                    <p className="text-sm text-red-600">
                      Removed (out of stock)
                    </p>
                  ) : (
                    <p className="text-sm text-amber-600">
                      Reduced from {adjustment.requestedQuantity} to{" "}
                      {adjustment.availableQuantity}
                    </p>
                  )}
                </div>

                <Badge
                  variant={
                    adjustment.action === "removed"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {adjustment.action === "removed" ? "Removed" : "Reduced"}
                </Badge>
              </div>
            ))}
          </div>

          {/* Price Summary */}
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Original total:</span>
              <span className="line-through">{formatPrice(originalTotal)}</span>
            </div>
            <div className="flex justify-between text-lg font-semibold">
              <span>New total:</span>
              <span className="text-green-600">
                {formatPrice(adjustedTotal)}
              </span>
            </div>
            {savings > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>You save:</span>
                <span>{formatPrice(savings)}</span>
              </div>
            )}
          </div>

          {/* Information Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-700">
              {
                "You'll only be charged for the available items. Would you like to proceed with this updated order?"
              }
            </p>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={handleCancel} className="flex-1">
            Cancel Order
          </Button>
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            Confirm & Pay {formatPrice(adjustedTotal)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
