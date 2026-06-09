import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

interface AccordionItemProps {
  title: string;
  children: React.ReactNode;
}

export function AccordionItem({ title, children }: AccordionItemProps) {
  const [open, setOpen] = useState(false);

  const toggleAccordion = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpen(!open);
  };

  return (
    <View style={styles.item}>
      <TouchableOpacity style={styles.trigger} onPress={toggleAccordion}>
        <Text style={styles.title}>{title}</Text>
        <Ionicons
          name="chevron-down"
          size={20}
          color="#666"
          style={{
            transform: [{ rotate: open ? "180deg" : "0deg" }],
          }}
        />
      </TouchableOpacity>

      {open && <View style={styles.content}>{children}</View>}
    </View>
  );
}

export function Accordion({
  children,
}: {
  children: React.ReactNode;
}) {
  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  item: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  trigger: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    paddingBottom: 16,
  },
});
