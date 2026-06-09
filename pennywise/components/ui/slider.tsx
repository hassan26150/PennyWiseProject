import * as React from "react";
import { View, PanResponder, StyleSheet, Animated, Text } from "react-native";

type SliderProps = {
  min?: number;
  max?: number;
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (values: number[]) => void;
  step?: number;
  style?: any;
};

function Slider({
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  step = 1,
  style,
}: SliderProps) {
  const initial = value ?? defaultValue ?? [min, max];
  const [sliderValue, setSliderValue] = React.useState(initial[0]);

  const pan = React.useRef(new Animated.Value(sliderValue)).current;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const newVal = Math.min(
          max,
          Math.max(min, sliderValue + (gestureState.dx / 200) * (max - min))
        );
        pan.setValue(newVal);
        setSliderValue(newVal);
        onValueChange?.([newVal]);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  const translateX = pan.interpolate({
    inputRange: [min, max],
    outputRange: [0, 200], // Track width
    extrapolate: "clamp",
  });

  return (
    <View style={[styles.container, style]}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.range,
            {
              width: translateX,
            },
          ]}
        />
      </View>
      <Animated.View
        style={[styles.thumb, { transform: [{ translateX }] }]}
        {...panResponder.panHandlers}
      />
      <Text style={styles.valueText}>{sliderValue.toFixed(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 220,
    height: 40,
    justifyContent: "center",
  },
  track: {
    height: 8,
    backgroundColor: "#ccc",
    borderRadius: 4,
    overflow: "hidden",
  },
  range: {
    height: 8,
    backgroundColor: "#3b82f6", // Primary color
    borderRadius: 4,
  },
  thumb: {
    position: "absolute",
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#3b82f6",
    top: -4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 2,
  },
  valueText: {
    marginTop: 8,
    fontSize: 12,
    color: "#000",
  },
});

export { Slider };
