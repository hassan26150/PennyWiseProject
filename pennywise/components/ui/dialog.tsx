import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { X } from "lucide-react-native";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
};

export function Dialog({ visible, onClose, children }: DialogProps) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.centered}>
          <Pressable style={styles.content} onPress={() => {}}>
            {children}

            <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
              <X size={20} />
            </TouchableOpacity>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

export function DialogHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function DialogFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

export function DialogTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function DialogDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Text style={styles.description}>{children}</Text>;
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  centered: {
    width: "100%",
  },
  content: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    position: "relative",
  },
  header: {
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 6,
  },
  closeBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
});