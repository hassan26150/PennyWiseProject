import * as React from "react";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons"; // Expo icon set

type CheckboxProps = {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  style?: any;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  onChange,
  label,
  disabled = false,
  style,
}) => {
  const [isChecked, setIsChecked] = React.useState(checked);

  const toggle = () => {
    if (disabled) return;
    setIsChecked((prev) => {
      onChange?.(!prev);
      return !prev;
    });
  };

  return (
    <TouchableOpacity
      onPress={toggle}
      activeOpacity={0.8}
      style={[styles.container, style, disabled && styles.disabled]}
    >
      <View style={[styles.box, isChecked && styles.checkedBox]}>
        {isChecked && (
          <MaterialIcons name="check" size={20} color="#fff" />
        )}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  box: {
    width: 24,
    height: 24,
    borderWidth: 1,
    borderColor: "#999",
    borderRadius: 4,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  checkedBox: {
    backgroundColor: "#0d6efd", // primary color
    borderColor: "#0d6efd",
  },
  label: {
    marginLeft: 8,
    fontSize: 16,
    color: "#000",
  },
  disabled: {
    opacity: 0.5,
  },
});
