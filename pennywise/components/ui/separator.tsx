import * as React from "react";
import { View, StyleSheet, ViewProps } from "react-native";

type SeparatorProps = ViewProps & {
  orientation?: "horizontal" | "vertical";
  decorative?: boolean; // just for API compatibility, optional
};

export function Separator({
  orientation = "horizontal",
  decorative = true,
  style,
  ...props
}: SeparatorProps) {
  return (
    <View
      style={[
        styles.separator,
        orientation === "horizontal" ? styles.horizontal : styles.vertical,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  separator: {
    backgroundColor: "#ccc", // same as bg-border
  },
  horizontal: {
    height: 1,
    width: "100%",
  },
  vertical: {
    width: 1,
    height: "100%",
  },
});
