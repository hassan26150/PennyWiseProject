import * as React from "react";
import { View, Modal, Pressable, StyleSheet } from "react-native";
import { cn } from "./utils";

type PopoverProps = {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function Popover({ children, open, onOpenChange }: PopoverProps) {
  const [visible, setVisible] = React.useState(open ?? false);

  React.useEffect(() => {
    if (open !== undefined) setVisible(open);
  }, [open]);

  const toggle = () => {
    const newVal = !visible;
    setVisible(newVal);
    onOpenChange?.(newVal);
  };

  return (
    <View style={{ position: "relative" }} data-slot="popover">
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<any>, { toggle, visible })
          : child
      )}
    </View>
  );
}

type PopoverTriggerProps = {
  children: React.ReactNode;
  toggle?: () => void;
};

export function PopoverTrigger({ children, toggle }: PopoverTriggerProps) {
  return (
    <Pressable onPress={toggle} data-slot="popover-trigger">
      {children}
    </Pressable>
  );
}

type PopoverContentProps = {
  children: React.ReactNode;
  visible?: boolean;
  toggle?: () => void;
  style?: any;
};

export function PopoverContent({ children, visible, toggle, style }: PopoverContentProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" onRequestClose={toggle}>
      <Pressable style={styles.backdrop} onPress={toggle}>
        <View style={[styles.content, style]} data-slot="popover-content">
          {children}
        </View>
      </Pressable>
    </Modal>
  );
}

export function PopoverAnchor({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <View style={[{ position: "absolute" }, style]} data-slot="popover-anchor">
      {children}
    </View>
  );
}

// ---------- Styles ----------
const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    minWidth: 280,
  },
});
