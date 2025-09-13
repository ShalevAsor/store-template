export interface ConfirmActionData {
  onConfirm: () => Promise<void>; // Simplified - no context needed
  onCancel?: () => void; // Simplified - no context needed
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}
