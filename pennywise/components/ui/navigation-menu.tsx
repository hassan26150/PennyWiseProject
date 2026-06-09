import * as React from "react";
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from "react-native";

import { cn } from "./utils";

// Main Navigation Menu
function NavigationMenu({ children }: { children: React.ReactNode }) {
  return <View style={styles.menu}>{children}</View>;
}

// Menu List (horizontal scrollable)
function NavigationMenuList({ children }: { children: React.ReactNode }) {
  return <ScrollView horizontal style={styles.menuList}>{children}</ScrollView>;
}

// Individual Menu Item
function NavigationMenuItem({ children }: { children: React.ReactNode }) {
  return <View style={styles.menuItem}>{children}</View>;
}

// Trigger that opens submenu / dropdown
function NavigationMenuTrigger({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Pressable style={styles.trigger} onPress={() => setOpen(!open)}>
        <Text style={styles.triggerText}>{children} ▼</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.dropdown}>
            {React.Children.map(children, (child) =>
              React.isValidElement(child) ? React.cloneElement(child) : child
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

// Dropdown Link / Item
function NavigationMenuLink({ children, onPress }: { children: React.ReactNode; onPress?: () => void }) {
  return (
    <Pressable style={styles.link} onPress={onPress}>
      <Text style={styles.linkText}>{children}</Text>
    </Pressable>
  );
}

// Optional indicator (arrow / triangle)
function NavigationMenuIndicator() {
  return <View style={styles.indicator} />;
}

// Styles
const styles = StyleSheet.create({
  menu: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  menuList: {
    flexDirection: "row",
  },
  menuItem: {
    marginHorizontal: 4,
  },
  trigger: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#f2f2f2",
  },
  triggerText: {
    fontSize: 16,
    fontWeight: "500",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdown: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 8,
    minWidth: 150,
    elevation: 5,
  },
  link: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  linkText: {
    fontSize: 14,
  },
  indicator: {
    width: 8,
    height: 8,
    backgroundColor: "#000",
    transform: [{ rotate: "45deg" }],
    alignSelf: "center",
    marginTop: 4,
  },
});

export {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuLink,
  NavigationMenuIndicator,
};