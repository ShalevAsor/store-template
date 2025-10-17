import { useReducer } from "react";

export type CheckoutStep = "form" | "payment" | "processing" | "error";

export interface CheckoutState {
  step: CheckoutStep;
  orderId: string | null;
  paymentMethod: string | null;
  needsRecovery: boolean;
  isLoading: boolean;
  error: string | null;
  canRetry: boolean;
}

export type CheckoutAction =
  | { type: "START_ORDER_CREATION" }
  | { type: "ORDER_CREATED"; orderId: string; paymentMethod: string }
  | { type: "START_PAYMENT" }
  | { type: "PAYMENT_PROCESSING" }
  | { type: "PAYMENT_COMPLETED" }
  | { type: "START_RECOVERY" }
  | { type: "STOP_RECOVERY" }
  | { type: "SET_ERROR"; error: string; canRetry?: boolean }
  | { type: "RESET_ERROR" }
  | { type: "RESET_CHECKOUT" };

const initialState: CheckoutState = {
  step: "form",
  orderId: null,
  paymentMethod: null,
  needsRecovery: false,
  isLoading: false,
  error: null,
  canRetry: false,
};

function checkoutReducer(
  state: CheckoutState,
  action: CheckoutAction
): CheckoutState {
  switch (action.type) {
    case "START_ORDER_CREATION":
      return {
        ...state,
        isLoading: true,
        error: null,
        canRetry: false,
      };
    case "ORDER_CREATED":
      return {
        ...state,
        step: "payment",
        paymentMethod: action.paymentMethod,
        orderId: action.orderId,
        isLoading: false,
        error: null,
      };
    case "START_PAYMENT":
      return {
        ...state,
        step: "payment",
        isLoading: false,
        error: null,
      };
    case "PAYMENT_PROCESSING":
      return {
        ...state,
        step: "processing",
        isLoading: true,
        error: null,
      };
    case "PAYMENT_COMPLETED":
      return {
        ...state,
        step: "form",
        isLoading: false,
        error: null,
      };
    case "START_RECOVERY":
      return {
        ...state,
        needsRecovery: true,
      };
    case "STOP_RECOVERY":
      return { ...state, needsRecovery: false };
    case "SET_ERROR":
      return {
        ...state,
        step: "error",
        isLoading: false,
        error: action.error,
        canRetry: action.canRetry ?? true,
      };
    case "RESET_ERROR":
      return {
        ...state,
        step: state.orderId ? "payment" : "form",
        isLoading: false,
        error: null,
        canRetry: false,
      };
    case "RESET_CHECKOUT":
      return initialState;
    default:
      return state;
  }
}

export function useCheckoutState() {
  const [state, dispatch] = useReducer(checkoutReducer, initialState);
  // Action creators for cleaner usage
  const actions = {
    startOrderCreation: () => dispatch({ type: "START_ORDER_CREATION" }),
    orderCreated: (orderId: string, paymentMethod: string) =>
      dispatch({ type: "ORDER_CREATED", orderId, paymentMethod }),
    startPayment: () => dispatch({ type: "START_PAYMENT" }),
    paymentProcessing: () => dispatch({ type: "PAYMENT_PROCESSING" }),
    paymentCompleted: () => dispatch({ type: "PAYMENT_COMPLETED" }),
    startRecovery: () => dispatch({ type: "START_RECOVERY" }),
    stopRecovery: () => dispatch({ type: "STOP_RECOVERY" }),
    setError: (error: string, canRetry = true) =>
      dispatch({ type: "SET_ERROR", error, canRetry }),
    resetError: () => dispatch({ type: "RESET_ERROR" }),
    resetCheckout: () => dispatch({ type: "RESET_CHECKOUT" }),
  };

  return {
    state,
    actions,
    // Computed properties for easier conditions
    isForm: state.step === "form",
    isPayment: state.step === "payment",
    isProcessing: state.step === "processing",
    isError: state.step === "error",
    hasOrder: Boolean(state.orderId),
  };
}
