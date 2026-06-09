import React from "react";
import Toast from "react-native-toast-message";
import { useColorScheme } from "react-native";

export function Toaster() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <Toast
      config={{
        success: (props) => (
          <ToastBase {...props} type="success" isDark={isDark} />
        ),
        error: (props) => (
          <ToastBase {...props} type="error" isDark={isDark} />
        ),
        info: (props) => (
          <ToastBase {...props} type="info" isDark={isDark} />
        ),
      }}
    />
  );
}

function ToastBase({ text1, text2, type, isDark }: any) {
  return (
    <Toast
      position="top"
      visibilityTime={3000}
      autoHide
      topOffset={50}
    />
  );
}