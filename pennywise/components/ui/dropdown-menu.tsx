import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import { Check, Circle, ChevronRight } from "lucide-react-native";

type ItemType =
  | "default"
  | "destructive"
  | "checkbox"
  | "radio"
  | "separator"
  | "label";

type MenuItem = {
  id: string;
  label?: string;
  type?: ItemType;
  onPress?: () => void;
  group?: string; // for radio groups
};

type Props = {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
};

export function DropdownMenu({ visible, onClose, items }: Props) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [radioValues, setRadioValues] = useState<Record<string, string>>({});

  const handlePress = (item: MenuItem) => {
    if (item.type === "checkbox") {
      setChecked((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
      return;
    }

    if (item.type === "radio" && item.group) {
      setRadioValues((prev) => ({
        ...prev,
        [item.group!]: item.id,
      }));
      return;
    }

    item.onPress?.();
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.menu}>
          {items.map((item) => {
            if (item.type === "separator") {
              return <View key={item.id} style={styles.separator} />;
            }

            if (item.type === "label") {
              return (
                <Text key={item.id} style={styles.label}>
                  {item.label}
                </Text>
              );
            }

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.item,
                  item.type === "destructive" && styles.destructiveItem,
                ]}
                onPress={() => handlePress(item)}
              >
                {item.type === "checkbox" && (
                  <Check
                    size={16}
                    style={{ opacity: checked[item.id] ? 1 : 0 }}
                  />
                )}

                {item.type === "radio" && item.group && (
                  <Circle
                    size={14}
                    fill={
                      radioValues[item.group] === item.id
                        ? "black"
                        : "transparent"
                    }
                  />
                )}

                <Text
                  style={[
                    styles.text,
                    item.type === "destructive" && { color: "red" },
                  ]}
                >
                  {item.label}
                </Text>

                {item.type === "default" && (
                  <ChevronRight size={16} style={{ marginLeft: "auto" }} />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </Pressable>
    </Modal>
  );
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  menu: {
    width: 220,
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 6,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  text: {
    fontSize: 14,
  },
  destructiveItem: {
    backgroundColor: "#fee",
  },
  separator: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  label: {
    fontSize: 12,
    color: "#888",
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
});
