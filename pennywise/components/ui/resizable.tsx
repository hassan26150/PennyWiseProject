import * as React from "react";
import { View, PanResponder, StyleSheet } from "react-native";

type PanelGroupProps = {
  children: React.ReactNode[];
  direction?: "horizontal" | "vertical";
};

type PanelProps = {
  children: React.ReactNode;
  size?: number; // fraction between 0 and 1
};

export function ResizablePanelGroup({ children, direction = "horizontal" }: PanelGroupProps) {
  const [sizes, setSizes] = React.useState<number[]>(children.map(() => 1 / children.length));

  const panResponders = children.map((_, index) =>
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const delta = direction === "horizontal" ? gestureState.dx : gestureState.dy;
        setSizes((prev) => {
          const newSizes = [...prev];
          if (delta !== 0 && index < prev.length - 1) {
            const total = newSizes[index] + newSizes[index + 1];
            const fraction = delta / 300; // adjust sensitivity
            newSizes[index] = Math.min(Math.max(newSizes[index] + fraction, 0.1), total - 0.1);
            newSizes[index + 1] = total - newSizes[index];
          }
          return newSizes;
        });
      },
      onPanResponderTerminationRequest: () => true,
    })
  );

  return (
    <View
      style={[
        styles.group,
        direction === "vertical" ? styles.vertical : styles.horizontal,
      ]}
    >
      {children.map((child, index) => (
        <React.Fragment key={index}>
          <View
            style={[
              direction === "horizontal"
                ? { flex: sizes[index] }
                : { flex: sizes[index] },
            ]}
          >
            {child}
          </View>
          {index < children.length - 1 && (
            <View
              {...panResponders[index].panHandlers}
              style={[
                styles.handle,
                direction === "vertical" ? styles.handleHorizontal : styles.handleVertical,
              ]}
            />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

export function ResizablePanel({ children }: PanelProps) {
  return <View style={{ flex: 1 }}>{children}</View>;
}

const styles = StyleSheet.create({
  group: {
    flex: 1,
  },
  horizontal: {
    flexDirection: "row",
  },
  vertical: {
    flexDirection: "column",
  },
  handle: {
    backgroundColor: "#ccc",
  },
  handleVertical: {
    width: 10,
    
  },
  handleHorizontal: {
    height: 10,
 
  },
});
