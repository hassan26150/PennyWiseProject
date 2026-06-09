import React from "react";
import { View, Image, Text, ViewProps, ImageProps, StyleSheet } from "react-native";

interface AvatarProps extends ViewProps {
  size?: number; // avatar diameter
  children?: React.ReactNode;
}

interface AvatarImageProps extends ImageProps {
  size?: number;
}

interface AvatarFallbackProps extends AvatarProps {
  label?: string;
}

const Avatar = ({ size = 40, style, children, ...props }: AvatarProps) => {
  return (
    <View
      style={[{ width: size, height: size, borderRadius: size / 2, overflow: "hidden" }, style]}
      {...props}
    >
      {children}
    </View>
  );
};

const AvatarImage = ({ size = 40, style, ...props }: AvatarImageProps) => {
  return <Image style={[{ width: size, height: size, borderRadius: size / 2 }, style]} {...props} />;
};

const AvatarFallback = ({ size = 40, label = "?", style, ...props }: AvatarFallbackProps) => {
  return (
    <View
      style={[
        { width: size, height: size, borderRadius: size / 2, backgroundColor: "#ccc", justifyContent: "center", alignItems: "center" },
        style,
      ]}
      {...props}
    >
      <Text style={{ color: "white", fontWeight: "bold" }}>{label}</Text>
    </View>
  );
};

export { Avatar, AvatarImage, AvatarFallback };