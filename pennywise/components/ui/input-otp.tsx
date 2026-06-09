import React, { useRef, useState } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from "react-native";

type InputOTPProps = {
  length?: number;
  onComplete?: (value: string) => void;
};

export function InputOTP({ length = 6, onComplete }: InputOTPProps) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<TextInput[]>([]);

  const handleChange = (text: string, index: number) => {
    if (!text) return;

    const newValues = [...values];
    newValues[index] = text.slice(-1);
    setValues(newValues);

    if (index < length - 1) {
      inputs.current[index + 1]?.focus();
    }

    if (newValues.every((v) => v !== "")) {
      onComplete?.(newValues.join(""));
    }
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === "Backspace" && values[index] === "") {
      if (index > 0) {
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.container}>
      {values.map((value, index) => (
        <TextInput
          key={index}
          ref={(ref) => {
            if (ref) inputs.current[index] = ref;
          }}
          value={value}
          onChangeText={(text) => handleChange(text, index)}
          onKeyPress={(e) => handleKeyPress(e, index)}
          keyboardType="number-pad"
          maxLength={1}
          style={styles.input}
        />
      ))}
    </View>
  );
}

/* ------------------ */
/* Separator Component */
/* ------------------ */

export function InputOTPSeparator() {
  return <Text style={styles.separator}>-</Text>;
}

/* ------------------ */
/* Styles */
/* ------------------ */

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  input: {
    width: 45,
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    textAlign: "center",
    fontSize: 18,
    fontWeight: "600",
  },
  separator: {
    fontSize: 20,
    marginHorizontal: 4,
  },
});
