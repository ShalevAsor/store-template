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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useModalStore } from "@/store/modalStore";
import { Settings, Loader2 } from "lucide-react";
import { useState } from "react";
import { OrderStatus, PaymentStatus } from "@prisma/client";

export const StatusSelectionModal = () => {
  const { isOpen, onClose, type, data } = useModalStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const isModalOpen = isOpen && type === "statusSelection";
  const { statusSelection: modalData } = data;

  if (!modalData) return null;

  const { title, currentStatus, availableStatuses, onConfirm, onCancel } =
    modalData;

  const handleConfirm = async () => {
    if (!selectedStatus) {
      return; // Don't allow empty selection
    }
    if (selectedStatus === currentStatus) {
      onClose();
      return;
    }

    setIsLoading(true);
    try {
  
      await onConfirm(selectedStatus as OrderStatus | PaymentStatus);
      onClose();
      setSelectedStatus(""); // reset for next time
    } catch (error) {
      console.error("StatusSelectionModal error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    onCancel?.();
    onClose();
    setSelectedStatus("");
  };

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) {
      handleCancel();
    }
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex gap-2 items-center">
            <Settings className="w-4 h-4 text-blue-600" />
            <DialogTitle>{title}</DialogTitle>
          </div>
          <DialogDescription>
            Current status: <span className="font-medium">{currentStatus}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status-select">Select new status:</Label>
            <Select
              value={selectedStatus}
              onValueChange={setSelectedStatus}
              disabled={isLoading}
            >
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Choose a status..." />
              </SelectTrigger>
              <SelectContent>
                {availableStatuses.map((status) => (
                  <SelectItem
                    key={status.value as string}
                    value={status.value as string}
                    disabled={status.value === currentStatus}
                  >
                    <div className="flex flex-col">
                      <span>{status.label}</span>
                      {status.description && (
                        <span className="text-xs text-gray-500">
                          {status.description}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={
              !selectedStatus || selectedStatus === currentStatus || isLoading
            }
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Status"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
