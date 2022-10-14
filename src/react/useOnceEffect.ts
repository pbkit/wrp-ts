import { useEffect, useRef } from "react";

/**
 * Guaranteed to be called only once in a component's lifecycle.
 * It called only once, even in strict mode.
 */
const useOnceEffect: typeof useEffect = (effect) => {
  const effectHasFiredRef = useRef<true>();
  useEffect(() => {
    if (effectHasFiredRef.current) return;
    else effectHasFiredRef.current = true;
    return effect();
  }, []);
};

export default useOnceEffect;
