import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type TabsContextType = {
  value: string;
  setValue: (val: string) => void;
};

const TabsContext = React.createContext<TabsContextType | null>(null);

/* ROOT */
function Tabs({
  defaultValue,
  children,
}: {
  defaultValue: string;
  children: React.ReactNode;
}) {
  const [value, setValue] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <View style={styles.container}>{children}</View>
    </TabsContext.Provider>
  );
}

/* LIST */
function TabsList({ children }: { children: React.ReactNode }) {
  return <View style={styles.list}>{children}</View>;
}

/* TRIGGER */
function TabsTrigger({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) return null;

  const isActive = context.value === value;

  return (
    <Pressable
      onPress={() => context.setValue(value)}
      style={[styles.trigger, isActive && styles.activeTrigger]}
    >
      <Text style={[styles.triggerText, isActive && styles.activeText]}>
        {children}
      </Text>
    </Pressable>
  );
}

/* CONTENT */
function TabsContent({
  value,
  children,
}: {
  value: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) return null;

  if (context.value !== value) return null;

  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "column",
    gap: 10,
  },
  list: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 4,
  },
  trigger: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
  },
  activeTrigger: {
    backgroundColor: "#ffffff",
  },
  triggerText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  activeText: {
    color: "#111827",
    fontWeight: "600",
  },
  content: {
    marginTop: 10,
  },
});

export { Tabs, TabsList, TabsTrigger, TabsContent };
