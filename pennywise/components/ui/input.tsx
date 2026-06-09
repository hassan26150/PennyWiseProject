import React from "react";
import {
  TextInput,
  StyleSheet,
  TextInputProps,
  View,
} from "react-native";

type InputProps = TextInputProps & {
  error?: boolean;
};

export function Input({ error, style, ...props }: InputProps) {
  return (
    <View>
      <TextInput
        style={[
          styles.input,
          error && styles.error,
          style,
        ]}
        placeholderTextColor="#888"
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  input: {
    height: 45,
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: "#fff",
  },
  error: {
    borderColor: "red",
  },
});
