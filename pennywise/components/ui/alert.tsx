import React from "react";
import { View, Text, StyleSheet, ViewProps, TextProps } from "react-native";

type AlertVariant = "default" | "destructive";

interface AlertProps extends ViewProps {
  variant?: AlertVariant;
  children: React.ReactNode;
}

interface AlertTitleProps extends TextProps {
  children: React.ReactNode;
}

interface AlertDescriptionProps extends TextProps {
  children: React.ReactNode;
}

/* ---------------- ALERT COMPONENT ---------------- */

const Alert = ({ variant = "default", style, children, ...props }: AlertProps) => {
  return (
    <View
      accessibilityRole="alert"
      style={[styles.alertBase, variant === "destructive" && styles.destructive, style]}
      {...props}
    >
      {children}
    </View>
  );
};

const AlertTitle = ({ style, children, ...props }: AlertTitleProps) => {
  return (
    <Text style={[styles.alertTitle, style]} {...props}>
      {children}
    </Text>
  );
};

const AlertDescription = ({ style, children, ...props }: AlertDescriptionProps) => {
  return (
    <Text style={[styles.alertDescription, style]} {...props}>
      {children}
    </Text>
  );
};

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  alertBase: {
    width: "100%",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f0f0f0", // default bg
  },
  destructive: {
    backgroundColor: "#fee2e2", // light red
    color: "#b91c1c", // text red
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: "#555",
  },
});

export { Alert, AlertTitle, AlertDescription };