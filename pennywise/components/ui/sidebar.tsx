import * as React from "react";
import { View, Text, ScrollView, Pressable, StyleSheet, Animated, Dimensions } from "react-native";

const SIDEBAR_WIDTH = 250;
const SIDEBAR_WIDTH_ICON = 50;

const SidebarContext = React.createContext<any>(null);

export function useSidebar() {
  const context = React.useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
}

export function SidebarProvider({ defaultOpen = true, children }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const [openMobile, setOpenMobile] = React.useState(false);

  const toggleSidebar = () => {
    setOpenMobile((prev) => !prev);
    setOpen((prev) => !prev);
  };

  return (
    <SidebarContext.Provider
      value={{ open, setOpen, openMobile, setOpenMobile, toggleSidebar }}
    >
      <View style={{ flex: 1 }}>{children}</View>
    </SidebarContext.Provider>
  );
}

export function Sidebar({ children, collapsible = "offcanvas" }) {
  const { open, toggleSidebar } = useSidebar();

  return (
    <View style={[styles.sidebarContainer, { width: open ? SIDEBAR_WIDTH : SIDEBAR_WIDTH_ICON }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
      {collapsible !== "none" && (
        <Pressable style={styles.sidebarRail} onPress={toggleSidebar}>
          <Text style={{ color: "#fff" }}>{open ? "«" : "»"}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function SidebarHeader({ children }) {
  return <View style={styles.header}>{children}</View>;
}

export function SidebarFooter({ children }) {
  return <View style={styles.footer}>{children}</View>;
}

export function SidebarTitle({ children }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function SidebarDescription({ children }) {
  return <Text style={styles.description}>{children}</Text>;
}

export function SidebarMenu({ children }) {
  return <View style={styles.menu}>{children}</View>;
}

export function SidebarMenuItem({ children }) {
  return <Pressable style={styles.menuItem}>{children}</Pressable>;
}

export function SidebarMenuButton({ children, onPress }) {
  return <Pressable style={styles.menuButton} onPress={onPress}>{children}</Pressable>;
}

export function SidebarContent({ children }) {
  return <View style={styles.content}>{children}</View>;
}

// Add more components like SidebarInput, SidebarGroup, etc. similarly...

const styles = StyleSheet.create({
  sidebarContainer: {
    backgroundColor: "#1f1f1f",
    flexDirection: "column",
    borderRightWidth: 1,
    borderRightColor: "#333",
    height: "100%",
    position: "relative",
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 10,
  },
  sidebarRail: {
    position: "absolute",
    top: 0,
    right: -10,
    width: 20,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#444",
  },
  header: { padding: 10 },
  footer: { padding: 10, marginTop: "auto" },
  title: { fontSize: 18, fontWeight: "bold", color: "#fff" },
  description: { fontSize: 12, color: "#aaa" },
  menu: { flexDirection: "column", paddingVertical: 5 },
  menuItem: { padding: 10, borderRadius: 6, marginVertical: 2 },
  menuButton: { padding: 10, borderRadius: 6, backgroundColor: "#333", marginVertical: 2 },
  content: { flex: 1, padding: 5 },
});
