import * as React from "react";
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator } from "react-native";

type ButtonVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
type ButtonSize = "default" | "sm" | "lg" | "icon";

interface ButtonProps {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

/* -------------------- Button Component -------------------- */

export function Button({
  children,
  variant = "default",
  size = "default",
  onPress,
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const variantStyle = buttonVariantStyles[variant] || {};
  const sizeStyle = buttonSizeStyles[size] || {};

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.base, variantStyle, sizeStyle, disabled && styles.disabled, style]}
      activeOpacity={0.8}
    >
      {loading ? <ActivityIndicator color="#fff" /> : <Text style={[styles.text, variantTextStyles[variant]]}>{children}</Text>}
    </TouchableOpacity>
  );
}

/* -------------------- Styles -------------------- */

const styles = StyleSheet.create({
  base: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  disabled: {
    opacity: 0.5,
  },
});

/* -------------------- Variant Styles -------------------- */

const buttonVariantStyles: Record<ButtonVariant, object> = {
  default: { backgroundColor: "#3b82f6" },
  destructive: { backgroundColor: "#ef4444" },
  outline: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#d1d5db" },
  secondary: { backgroundColor: "#e5e7eb" },
  ghost: { backgroundColor: "transparent" },
  link: { backgroundColor: "transparent" },
};

const variantTextStyles: Record<ButtonVariant, object> = {
  default: { color: "#fff" },
  destructive: { color: "#fff" },
  outline: { color: "#111827" },
  secondary: { color: "#111827" },
  ghost: { color: "#111827" },
  link: { color: "#3b82f6", textDecorationLine: "underline" },
};

/* -------------------- Size Styles -------------------- */

const buttonSizeStyles: Record<ButtonSize, object> = {
  default: { height: 36, paddingHorizontal: 16 },
  sm: { height: 32, paddingHorizontal: 12 },
  lg: { height: 40, paddingHorizontal: 20 },
  icon: { width: 36, height: 36, paddingHorizontal: 0, paddingVertical: 0 },
};
