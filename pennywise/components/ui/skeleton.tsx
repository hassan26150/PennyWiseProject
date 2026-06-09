import * as React from "react";
import { View, Animated, StyleSheet } from "react-native";

function Skeleton({ style, ...props }: { style?: any }) {
  const opacity = React.useRef(new Animated.Value(0.3)).current;

  React.useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 600,
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        styles.skeleton,
        style,
        { opacity }
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: "#ccc", // equivalent to bg-accent
    borderRadius: 8,         // equivalent to rounded-md
  },
});

export { Skeleton };