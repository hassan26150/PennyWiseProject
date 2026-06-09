import * as React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
} from "react-native";

// Enable LayoutAnimation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type CollapsibleProps = {
  children: React.ReactNode;
  open?: boolean;
  style?: any;
};

export const Collapsible: React.FC<CollapsibleProps> = ({
  children,
  open = false,
  style,
}) => {
  const [expanded, setExpanded] = React.useState(open);

  React.useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [expanded]);

  return <View style={style}>{children}</View>;
};

type CollapsibleTriggerProps = {
  onPress?: () => void;
  children: React.ReactNode;
  style?: any;
};

export const CollapsibleTrigger: React.FC<CollapsibleTriggerProps> = ({
  onPress,
  children,
  style,
}) => {
  return (
    <TouchableOpacity onPress={onPress} style={style} activeOpacity={0.7}>
      {children}
    </TouchableOpacity>
  );
};

type CollapsibleContentProps = {
  children: React.ReactNode;
  expanded?: boolean;
  style?: any;
};

export const CollapsibleContent: React.FC<CollapsibleContentProps> = ({
  children,
  expanded = false,
  style,
}) => {
  return expanded ? <View style={style}>{children}</View> : null;
};
