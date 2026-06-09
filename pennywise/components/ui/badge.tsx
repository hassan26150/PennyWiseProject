import * as React from "react";
import { Text, View, StyleSheet, ViewStyle, TextStyle } from "react-native";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  label: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

const BadgeColors: Record<BadgeVariant, { background: string; color: string; border?: string }> = {
  default: { background: "#0ea5e9", color: "white" },
  secondary: { background: "#64748b", color: "white" },
  destructive: { background: "#ef4444", color: "white" },
  outline: { background: "transparent", color: "#000", border: "#000" },
};

export const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  label,
  style,
  textStyle,
}) => {
  const colors = BadgeColors[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.background, borderColor: colors.border || "transparent", borderWidth: colors.border ? 1 : 0 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: colors.color }, textStyle]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 24,
  },
  text: {
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
});