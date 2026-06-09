import * as React from "react";
import { TextInput, StyleSheet } from "react-native";

type TextareaProps = {
  value?: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  editable?: boolean;
  style?: any;
};

function Textarea({
  value,
  onChangeText,
  placeholder,
  editable = true,
  style,
}: TextareaProps) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      editable={editable}
      multiline
      textAlignVertical="top"
      style={[styles.textarea, style]}
      placeholderTextColor="#9ca3af"
    />
  );
}

const styles = StyleSheet.create({
  textarea: {
    width: "100%",
    minHeight: 80,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
});

export { Textarea };