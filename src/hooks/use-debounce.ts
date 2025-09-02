import { useState, useEffect } from "react";

/**
 * Custom hook that debounces a value
 *
 * @param value- The value to debounce
 * @delay - the delay in milliseconds
 * @returns the debounced value
 */

export function useDebounce<T>(value: T, delay: number): T {
  // State to store the debounced value
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]);

  return debouncedValue;
}
