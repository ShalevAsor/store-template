import { useCartStore } from "@/store/cartStore";
import { useEffect, useState } from "react";

export const useHydration = () => {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Only access persist API on client side
    if (typeof window !== "undefined" && useCartStore.persist) {
      const unsubFinishHydration = useCartStore.persist.onFinishHydration(() =>
        setHydrated(true)
      );
      setHydrated(useCartStore.persist.hasHydrated());

      return unsubFinishHydration;
    }
  }, []);

  return hydrated;
};
