import * as React from "react";
import { Modal, View, Text, Pressable, StyleSheet } from "react-native";

type SheetProps = {
  visible: boolean;
  onClose?: () => void;
  side?: "top" | "right" | "bottom" | "left";
  children: React.ReactNode;
};

export function Sheet({
  visible,
  onClose,
  side = "right",
  children,
}: SheetProps) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheetContent, sideStyles[side]]}>
          {children}
          {onClose && (
            <Pressable style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

export function SheetHeader({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function SheetFooter({ children, style }: { children: React.ReactNode; style?: any }) {
  return <View style={[styles.footer, style]}>{children}</View>;
}

export function SheetTitle({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function SheetDescription({ children, style }: { children: React.ReactNode; style?: any }) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheetContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: "90%",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 5,
  },
  closeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  header: {
    marginBottom: 10,
  },
  footer: {
    marginTop: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
  },
});

// Optional side styles for left, right, top, bottom
const sideStyles: Record<string, any> = {
  right: { alignSelf: "flex-end", width: "75%", height: "100%" },
  left: { alignSelf: "flex-start", width: "75%", height: "100%" },
  bottom: { width: "100%", borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  top: { width: "100%", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
};