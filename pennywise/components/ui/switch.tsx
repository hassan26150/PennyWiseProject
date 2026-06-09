import * as React from "react";
import { Switch as RNSwitch, View, StyleSheet } from "react-native";

type SwitchProps = {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
};

function Switch({ value, onValueChange, disabled }: SwitchProps) {
  return (
    <View style={styles.container}>
      <RNSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{
          false: "#d1d5db", // unchecked background
          true: "#3b82f6",  // checked background (primary)
        }}
        thumbColor={value ? "#ffffff" : "#ffffff"}
        ios_backgroundColor="#d1d5db"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    transform: [{ scaleX: 0.9 }, { scaleY: 0.9 }], // slightly smaller like your web version
  },
});

export { Switch };
