import React from "react";
import { Text, StyleSheet, TextProps } from "react-native";

type LabelProps = TextProps & {
  disabled?: boolean;
};

export function Label({ disabled, style, ...props }: LabelProps) {
  return (
    <Text
      style={[
        styles.label,
        disabled && styles.disabled,
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111",
    marginBottom: 6,
  },
  disabled: {
    opacity: 0.5,
  },
});