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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useModalStore } from "@/store/modalStore";
import { DollarSign, Loader2 } from "lucide-react";
import { useState } from "react";
import { formatPrice } from "@/utils/currencyUtils";

export const RefundModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");
  const [refundType, setRefundType] = useState<"full" | "partial">("full");

  const isModalOpen = isOpen && type === "refund";
  const { refund: modalData } = data;

  if (!modalData) return null;

  const {
    orderNumber,
    orderId,
    totalAmount,
    alreadyRefunded,
    onConfirm,
    onCancel,
  } = modalData;

  const refundableAmount = totalAmount - alreadyRefunded;
  const refundAmountInCents =
    refundType === "full"
      ? refundableAmount
      : Math.round(parseFloat(refundAmount || "0") * 100);

  const handleRefundTypeChange = (type: "full" | "partial") => {
    setRefundType(type);
    if (type === "full") {
      setRefundAmount("");
    }
  };

  const handleConfirm = async () => {
    if (refundType === "partial") {
      const amount = parseFloat(refundAmount);
      if (isNaN(amount) || amount <= 0) {
        return; // Invalid amount
      }
      if (refundAmountInCents > refundableAmount) {
        return; // Exceeds refundable amount
      }
    }

    setIsLoading(true);
    try {
      const amountToRefund =
        refundType === "full" ? undefined : refundAmountInCents;
      await onConfirm(amountToRefund, refundReason.trim() || undefined);
      onClose();
      // Reset form
      setRefundAmount("");
      setRefundReason("");
      setRefundType("full");
    } catch (error) {
      console.error("RefundModal error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onClose();
    // Reset form
    setRefundAmount("");
    setRefundReason("");
    setRefundType("full");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleCancel();
    }
  };

  const isValidAmount =
    refundType === "full" ||
    (refundAmount &&
      !isNaN(parseFloat(refundAmount)) &&
      parseFloat(refundAmount) > 0 &&
      refundAmountInCents <= refundableAmount);

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex gap-2 items-center">
            <DollarSign className="w-4 h-4 text-green-600" />
            <DialogTitle>Process Refund</DialogTitle>
          </div>
          <DialogDescription>
            Process refund for order {orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span>Order Total:</span>
              <span className="font-medium">{formatPrice(totalAmount)}</span>
            </div>
            {alreadyRefunded > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Already Refunded:</span>
                <span className="font-medium">
                  -{formatPrice(alreadyRefunded)}
                </span>
              </div>
            )}
            <div className="flex justify-between text-sm font-medium border-t pt-2">
              <span>Refundable Amount:</span>
              <span>{formatPrice(refundableAmount)}</span>
            </div>
          </div>

          {/* Refund Type Selection */}
          <div className="space-y-3">
            <Label>Refund Type</Label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleRefundTypeChange("full")}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  refundType === "full"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              >
                <div className="font-medium">Full Refund</div>
                <div className="text-sm text-gray-600">
                  Refund the full refundable amount (
                  {formatPrice(refundableAmount)})
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleRefundTypeChange("partial")}
                className={`w-full p-3 text-left border rounded-lg transition-colors ${
                  refundType === "partial"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                disabled={isLoading}
              >
                <div className="font-medium">Partial Refund</div>
                <div className="text-sm text-gray-600">
                  Specify a custom refund amount
                </div>
              </button>
            </div>
          </div>

          {/* Partial Refund Amount Input */}
          {refundType === "partial" && (
            <div className="space-y-2">
              <Label htmlFor="refund-amount">Refund Amount ($)</Label>
              <Input
                id="refund-amount"
                type="number"
                step="0.01"
                min="0.01"
                max={refundableAmount / 100}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                placeholder={`Max: $${(refundableAmount / 100).toFixed(2)}`}
                disabled={isLoading}
              />
              {refundAmount && refundAmountInCents > refundableAmount && (
                <p className="text-sm text-red-600">
                  Amount exceeds refundable amount
                </p>
              )}
            </div>
          )}

          {/* Refund Reason */}
          <div className="space-y-2">
            <Label htmlFor="refund-reason">Reason (Optional)</Label>
            <Textarea
              id="refund-reason"
              value={refundReason}
              onChange={(e) => setRefundReason(e.target.value)}
              placeholder="Enter reason for refund..."
              disabled={isLoading}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValidAmount || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              `Process ${refundType === "full" ? "Full" : "Partial"} Refund`
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
