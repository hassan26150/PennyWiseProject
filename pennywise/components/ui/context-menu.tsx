import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
} from "react-native";

type MenuItem = {
  id: string;
  label: string;
  onPress: () => void;
  type?: "default" | "destructive" | "checkbox" | "radio";
  checked?: boolean;
};

type ContextMenuProps = {
  visible: boolean;
  onClose: () => void;
  items: MenuItem[];
};

export const ContextMenu: React.FC<ContextMenuProps> = ({
  visible,
  onClose,
  items,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const handlePress = (item: MenuItem) => {
    if (item.type === "checkbox") {
      setCheckedItems((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));
    } else if (item.type === "radio") {
      const newState: Record<string, boolean> = {};
      items.forEach((i) => {
        if (i.type === "radio") newState[i.id] = false;
      });
      newState[item.id] = true;
      setCheckedItems(newState);
    } else {
      item.onPress();
      onClose();
    }
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.item,
                  item.type === "destructive" && styles.destructiveItem,
                ]}
                onPress={() => handlePress(item)}
              >
                {item.type === "checkbox" && (
                  <Text style={styles.checkbox}>
                    {checkedItems[item.id] ? "✅" : "⬜️"}
                  </Text>
                )}
                {item.type === "radio" && (
                  <Text style={styles.checkbox}>
                    {checkedItems[item.id] ? "🔘" : "⚪️"}
                  </Text>
                )}
                <Text
                  style={[
                    styles.itemLabel,
                    item.type === "destructive" && { color: "red" },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  itemLabel: {
    fontSize: 14,
  },
  destructiveItem: {
    backgroundColor: "#fee",
  },
  checkbox: {
    marginRight: 8,
  },
});
