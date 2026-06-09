import * as React from "react";
import { Pressable, Text, StyleSheet } from "react-native";

type ToggleProps = {
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: "default" | "outline";
  size?: "default" | "sm" | "lg";
  children: React.ReactNode;
};

function Toggle({
  defaultPressed = false,
  onPressedChange,
  variant = "default",
  size = "default",
  children,
}: ToggleProps) {
  const [pressed, setPressed] = React.useState(defaultPressed);

  const handlePress = () => {
    const newValue = !pressed;
    setPressed(newValue);
    onPressedChange?.(newValue);
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.base,
        sizeStyles[size],
        variantStyles[variant],
        pressed && styles.active,
      ]}
    >
      <Text style={[styles.text, pressed && styles.activeText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },

  /* ACTIVE STATE */
  active: {
    backgroundColor: "#3b82f6",
  },

  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#374151",
  },

  activeText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

/* SIZE VARIANTS */
const sizeStyles = StyleSheet.create({
  default: {
    height: 36,
    paddingHorizontal: 12,
  },
  sm: {
    height: 32,
    paddingHorizontal: 8,
  },
  lg: {
    height: 40,
    paddingHorizontal: 16,
  },
});

/* VARIANT STYLES */
const variantStyles = StyleSheet.create({
  default: {
    backgroundColor: "transparent",
  },
  outline: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "transparent",
  },
});

export { Toggle };
