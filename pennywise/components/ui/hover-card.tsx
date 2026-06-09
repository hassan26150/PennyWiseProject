import React from "react";
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from "react-native";

type HoverCardProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function HoverCard({
  visible,
  onClose,
  children,
}: HoverCardProps) {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.card}>
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export function HoverCardTrigger({
  children,
  onPress,
}: {
  children: React.ReactNode;
  onPress: () => void;
}) {
  return <Pressable onPress={onPress}>{children}</Pressable>;
}

export function HoverCardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View>{children}</View>;
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    width: 260,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    elevation: 6,
  },
});
