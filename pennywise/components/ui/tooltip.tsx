import * as React from "react";
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
} from "react-native";

type TooltipContextType = {
  visible: boolean;
  setVisible: (v: boolean) => void;
};

const TooltipContext = React.createContext<TooltipContextType | null>(null);

/* PROVIDER */
function TooltipProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ visible, setVisible }}>
      {children}
    </TooltipContext.Provider>
  );
}

/* ROOT */
function Tooltip({ children }: { children: React.ReactNode }) {
  return <TooltipProvider>{children}</TooltipProvider>;
}

/* TRIGGER */
function TooltipTrigger({ children }: { children: React.ReactNode }) {
  const context = React.useContext(TooltipContext);
  if (!context) return null;

  return (
    <Pressable onPress={() => context.setVisible(true)}>
      {children}
    </Pressable>
  );
}

/* CONTENT */
function TooltipContent({ children }: { children: React.ReactNode }) {
  const context = React.useContext(TooltipContext);
  if (!context) return null;

  return (
    <Modal
      transparent
      visible={context.visible}
      animationType="fade"
    >
      <Pressable
        style={styles.overlay}
        onPress={() => context.setVisible(false)}
      >
        <View style={styles.tooltip}>
          <Text style={styles.tooltipText}>{children}</Text>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  tooltip: {
    backgroundColor: "#111827",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  tooltipText: {
    color: "#ffffff",
    fontSize: 12,
  },
});

export { Tooltip, TooltipTrigger, TooltipContent };
