import * as React from "react";
import { ScrollView, View, StyleSheet } from "react-native";

type ScrollAreaProps = {
  children: React.ReactNode;
  horizontal?: boolean;
  style?: object;
};

export function ScrollArea({ children, horizontal = false, style }: ScrollAreaProps) {
  return (
    <View style={[styles.container, style]}>
      <ScrollView
        horizontal={horizontal}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
      >
        {children}
      </ScrollView>
      {/* Optional: Custom scrollbar indicator */}
      {!horizontal && <ScrollBar />}
    </View>
  );
}

function ScrollBar() {
  // For simplicity, just a thin overlay bar
  return <View style={styles.scrollBar} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: "relative",
  },
  scrollView: {
    flex: 1,
  },
  scrollBar: {
    position: "absolute",
    width: 4,
    right: 2,
    top: 0,
    bottom: 0,
    backgroundColor: "#ccc",
    borderRadius: 2,
  },
});
