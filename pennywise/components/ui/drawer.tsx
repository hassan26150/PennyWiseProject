import React, { useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  Dimensions,
} from "react-native";

const { height, width } = Dimensions.get("window");

type Direction = "bottom" | "left" | "right";

type DrawerProps = {
  visible: boolean;
  onClose: () => void;
  direction?: Direction;
  children: React.ReactNode;
};

export function Drawer({
  visible,
  onClose,
  direction = "bottom",
  children,
}: DrawerProps) {
  const slideAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      slideAnim.setValue(0);
    }
  }, [visible]);

  const getTransform = () => {
    if (direction === "bottom") {
      return {
        transform: [
          {
            translateY: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [height, 0],
            }),
          },
        ],
      };
    }

    if (direction === "left") {
      return {
        transform: [
          {
            translateX: slideAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [-width, 0],
            }),
          },
        ],
      };
    }

    return {
      transform: [
        {
          translateX: slideAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [width, 0],
          }),
        },
      ],
    };
  };

  return (
    <Modal transparent visible={visible} animationType="fade">
      <Pressable style={styles.overlay} onPress={onClose} />

      <Animated.View
        style={[
          styles.drawer,
          direction === "bottom" && styles.bottom,
          direction === "left" && styles.left,
          direction === "right" && styles.right,
          getTransform(),
        ]}
      >
        {children}
      </Animated.View>
    </Modal>
  );
}

export function DrawerHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function DrawerFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

export function DrawerTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function DrawerDescription({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Text style={styles.description}>{children}</Text>;
}
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  drawer: {
    position: "absolute",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
  },
  bottom: {
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: "80%",
  },
  left: {
    left: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
  },
  right: {
    right: 0,
    top: 0,
    bottom: 0,
    width: width * 0.75,
  },
  header: {
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
});