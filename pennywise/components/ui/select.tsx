import * as React from "react";
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from "react-native";

type Option = {
  label: string;
  value: string | number;
};

type SelectProps = {
  value?: string | number;
  onValueChange?: (value: string | number) => void;
  options: Option[];
  placeholder?: string;
};

export function Select({ value, onValueChange, options, placeholder }: SelectProps) {
  const [open, setOpen] = React.useState(false);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <View>
      <TouchableOpacity
        style={styles.trigger}
        onPress={() => setOpen(true)}
      >
        <Text>{selectedOption?.label || placeholder || "Select..."}</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={styles.modalOverlay} onPress={() => setOpen(false)} />
        <View style={styles.modalContent}>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  onValueChange?.(item.value);
                  setOpen(false);
                }}
              >
                <Text style={value === item.value ? styles.selectedText : undefined}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    position: "absolute",
    top: "30%",
    left: "10%",
    right: "10%",
    backgroundColor: "#fff",
    borderRadius: 8,
    maxHeight: "40%",
    paddingVertical: 10,
  },
  item: {
    paddingVertical: 10,
    paddingHorizontal: 15,
  },
  selectedText: {
    fontWeight: "bold",
  },
});
