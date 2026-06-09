import * as React from "react";
import { View, Pressable, StyleSheet } from "react-native";

type RadioGroupProps = {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
};

type RadioGroupItemProps = {
  value: string;
  children?: React.ReactNode;
  isSelected?: boolean;
  onPress?: () => void;
};

export function RadioGroup({ value, onValueChange, children }: RadioGroupProps) {
  return (
    <View style={styles.group}>
      {React.Children.map(children, (child) => {
        if (!React.isValidElement<RadioGroupItemProps>(child)) return child;
        const childProps = child.props as RadioGroupItemProps;

        return React.cloneElement(child, {
          isSelected: childProps.value === value,
          onPress: () => onValueChange?.(childProps.value),
        });
      })}
    </View>
  );
}

export function RadioGroupItem({ isSelected, onPress, children }: RadioGroupItemProps) {
  return (
    <Pressable onPress={onPress} style={styles.item}>
      <View style={[styles.circle, isSelected && styles.circleSelected]} />
      {children}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  group: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12, // optional spacing between items
  },
  item: {
    alignItems: "center",
    justifyContent: "center",
  },
  circle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#d1d5db",
    alignItems: "center",
    justifyContent: "center",
  },
  circleSelected: {
    backgroundColor: "#3b82f6",
    borderColor: "#3b82f6",
  },
});
