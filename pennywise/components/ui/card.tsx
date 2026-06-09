import * as React from "react";
import { View, Text, StyleSheet, ViewProps } from "react-native";

interface CardProps extends ViewProps {}
interface CardHeaderProps extends ViewProps {}
interface CardContentProps extends ViewProps {}
interface CardFooterProps extends ViewProps {}
interface CardActionProps extends ViewProps {}
interface CardTitleProps extends ViewProps {
  children: React.ReactNode;
}
interface CardDescriptionProps extends ViewProps {
  children: React.ReactNode;
}

// Card container
export function Card({ style, ...props }: CardProps) {
  return <View style={[styles.card, style]} {...props} />;
}

// Card header
export function CardHeader({ style, ...props }: CardHeaderProps) {
  return <View style={[styles.cardHeader, style]} {...props} />;
}

// Card title
export function CardTitle({ style, children, ...props }: CardTitleProps) {
  return (
    <Text style={[styles.cardTitle, style]} {...props}>
      {children}
    </Text>
  );
}

// Card description
export function CardDescription({
  style,
  children,
  ...props
}: CardDescriptionProps) {
  return (
    <Text style={[styles.cardDescription, style]} {...props}>
      {children}
    </Text>
  );
}

// Card action
export function CardAction({ style, ...props }: CardActionProps) {
  return <View style={[styles.cardAction, style]} {...props} />;
}

// Card content
export function CardContent({ style, ...props }: CardContentProps) {
  return <View style={[styles.cardContent, style]} {...props} />;
}

// Card footer
export function CardFooter({ style, ...props }: CardFooterProps) {
  return <View style={[styles.cardFooter, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff", // replace with your card color
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb", // light gray border
    flexDirection: "column",
    gap: 24, // 6 * 4 for gap-6
    overflow: "hidden",
  },
  cardHeader: {
    paddingHorizontal: 24, // px-6
    paddingTop: 24, // pt-6
    gap: 6, // gap-1.5
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    lineHeight: 22,
  },
  cardDescription: {
    color: "#6b7280", // text-muted-foreground
    fontSize: 14,
    lineHeight: 20,
  },
  cardAction: {
    alignSelf: "flex-end",
    justifyContent: "center",
  },
  cardContent: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  cardFooter: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
});
