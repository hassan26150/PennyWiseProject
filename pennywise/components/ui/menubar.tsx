import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

type MenubarProps = {
  label: string;
  children: React.ReactNode;
};

export function Menubar({ label, children }: MenubarProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View>
      <Pressable
        style={styles.trigger}
        onPress={() => setVisible(true)}
      >
        <Text style={styles.triggerText}>{label}</Text>
      </Pressable>

      <Modal
        transparent
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setVisible(false)}
        >
          <View style={styles.menu}>
            {children}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

/* -------------------- */
/* Menu Item Component  */
/* -------------------- */

type MenubarItemProps = {
  onPress?: () => void;
  destructive?: boolean;
  children: React.ReactNode;
};

export function MenubarItem({
  onPress,
  destructive,
  children,
}: MenubarItemProps) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.item,
        pressed && styles.itemPressed,
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.itemText,
          destructive && styles.destructiveText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

/* -------------------- */
/* Separator            */
/* -------------------- */

export function MenubarSeparator() {
  return <View style={styles.separator} />;
}

/* -------------------- */
/* Styles               */
/* -------------------- */

const styles = StyleSheet.create({
  trigger: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  triggerText: {
    fontSize: 14,
    fontWeight: "600",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    width: 200,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 8,
    elevation: 5,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  itemPressed: {
    backgroundColor: "#f1f5f9",
  },
  itemText: {
    fontSize: 14,
  },
  destructiveText: {
    color: "red",
  },
  separator: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 6,
  },
});
