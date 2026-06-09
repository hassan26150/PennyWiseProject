import React from "react";
import { View, ViewProps, StyleSheet } from "react-native";

interface AspectRatioProps extends ViewProps {
  ratio?: number; // width / height, default 1
  children: React.ReactNode;
}

const AspectRatio = ({ ratio = 1, style, children, ...props }: AspectRatioProps) => {
  return (
    <View
      style={[{ aspectRatio: ratio }, style]}
      {...props}
    >
      {children}
    </View>
  );
};

export { AspectRatio };