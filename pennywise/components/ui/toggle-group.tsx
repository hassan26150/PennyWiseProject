import * as React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

type ToggleGroupType = "single" | "multiple";

type ToggleGroupContextType = {
  value: string | string[] | null;
  toggle: (val: string) => void;
  type: ToggleGroupType;
};

const ToggleGroupContext = React.createContext<ToggleGroupContextType | null>(
  null
);

/* ROOT */
function ToggleGroup({
  type = "single",
  defaultValue,
  children,
}: {
  type?: ToggleGroupType;
  defaultValue?: string | string[];
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState<
    string | string[] | null
  >(defaultValue ?? (type === "multiple" ? [] : null));

  const toggle = (val: string) => {
    if (type === "single") {
      setValue(val);
    } else {
      setValue((prev) => {
        const arr = Array.isArray(prev) ? prev : [];
        return arr.includes(val)
          ? arr.filter((v) => v !== val)
          : [...arr, val];
      });
    }
  };

  return (
    <ToggleGroupContext.Provider value={{ value, toggle, type }}>
      <View style={styles.group}>{children}</View>
    </ToggleGroupContext.Provider>
  );
}

/* ITEM */
function ToggleGroupItem({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(ToggleGroupContext);
  if (!context) return null;

  const { value: selectedValue, toggle, type } = context;

  const isSelected =
    type === "single"
      ? selectedValue === value
      : Array.isArray(selectedValue) &&
        selectedValue.includes(value);

  return (
    <Pressable
      onPress={() => toggle(value)}
      style={[
        styles.item,
        isSelected && styles.activeItem,
      ]}
    >
      <Text
        style={[
          styles.itemText,
          isSelected && styles.activeText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
  },
  item: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
  },
  activeItem: {
    backgroundColor: "#3b82f6",
  },
  itemText: {
    color: "#374151",
    fontWeight: "500",
  },
  activeText: {
    color: "#ffffff",
    fontWeight: "600",
  },
});

export { ToggleGroup, ToggleGroupItem };
