import * as React from "react";
import { View, StyleSheet } from "react-native";

import { cn } from "./utils"; // keep your cn function if you want

type ProgressProps = {
  value?: number; // 0 to 100
  className?: string;
};

function Progress({ value = 0, className, ...props }: ProgressProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <View
      data-slot="progress"
      style={cn(
        styles.root,
        className
      )}
      {...props}
    >
      <View
        data-slot="progress-indicator"
        style={[
          styles.indicator,
          { width: `${clampedValue}%` },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: "rgba(59, 130, 246, 0.2)", // tailwind bg-primary/20
    height: 8, // h-2
    width: "100%",
    borderRadius: 8,
    overflow: "hidden",
  },
  indicator: {
    backgroundColor: "#3B82F6", // tailwind bg-primary
    height: "100%",
    width: "0%", // will be overridden
    //transitionDuration: "300ms", // optional smoothness
  },
});

export { Progress };
