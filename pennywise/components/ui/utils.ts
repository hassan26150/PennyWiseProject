import { StyleProp, ViewStyle, TextStyle, ImageStyle } from "react-native";

type RNStyle = StyleProp<ViewStyle | TextStyle | ImageStyle>;

/**
 * Merge multiple React Native styles into one.
 * Similar to clsx/twMerge for web Tailwind.
 */
export function cn(...styles: RNStyle[]): RNStyle {
  return styles.filter(Boolean);
}
