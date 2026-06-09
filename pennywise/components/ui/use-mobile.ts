import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(
    Dimensions.get("window").width < MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT);
    });

    return () => {
      // Cleanup the subscription
      subscription.remove?.(); // RN 0.65+ supports remove()
    };
  }, []);

  return isMobile;
}
