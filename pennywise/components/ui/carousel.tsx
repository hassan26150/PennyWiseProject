import * as React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  ScrollViewProps,
} from "react-native";

// Optional icon replacement (you can use react-native-vector-icons)
import { Ionicons } from "@expo/vector-icons";

// Utility for combining className styles
const cn = (...styles: (ViewStyle | undefined)[]) => Object.assign({}, ...styles);

// ---------------- Context Types ----------------
type CarouselContextType = {
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  orientation: "horizontal" | "vertical";
};

const CarouselContext = React.createContext<CarouselContextType | undefined>(
  undefined
);

export function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

// ---------------- Carousel ----------------
type CarouselProps = {
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  style?: ViewStyle;
};

export const Carousel: React.FC<CarouselProps> = ({
  orientation = "horizontal",
  children,
  style,
}) => {
  const scrollRef = React.useRef<ScrollView>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const scrollPrev = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      x: orientation === "horizontal" ? -300 : 0,
      y: orientation === "vertical" ? -300 : 0,
      animated: true,
    });
  };

  const scrollNext = () => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      x: orientation === "horizontal" ? 300 : 0,
      y: orientation === "vertical" ? 300 : 0,
      animated: true,
    });
  };

  return (
    <CarouselContext.Provider
      value={{ scrollPrev, scrollNext, canScrollPrev, canScrollNext, orientation }}
    >
      <View style={[{ position: "relative" }, style]}>{children}</View>
    </CarouselContext.Provider>
  );
};

// ---------------- Carousel Content ----------------
type CarouselContentProps = ScrollViewProps & {
  children: React.ReactNode;
};

export const CarouselContent: React.FC<CarouselContentProps> = ({
  children,
  ...props
}) => {
  const { orientation } = useCarousel();

  return (
    <ScrollView
      ref={React.createRef<ScrollView>()}
      horizontal={orientation === "horizontal"}
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      {...props}
    >
      <View
        style={{
          flexDirection: orientation === "horizontal" ? "row" : "column",
        }}
      >
        {children}
      </View>
    </ScrollView>
  );
};

// ---------------- Carousel Item ----------------
type CarouselItemProps = { children: React.ReactNode; style?: ViewStyle };

export const CarouselItem: React.FC<CarouselItemProps> = ({ children, style }) => {
  const { orientation } = useCarousel();
  return (
    <View
      style={[
        {
          flexShrink: 0,
          width: orientation === "horizontal" ? 300 : "100%",
          height: orientation === "vertical" ? 200 : "100%",
          marginRight: orientation === "horizontal" ? 10 : 0,
          marginBottom: orientation === "vertical" ? 10 : 0,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
};

// ---------------- Carousel Controls ----------------
type CarouselButtonProps = {
  size?: number;
  style?: ViewStyle;
};

export const CarouselPrevious: React.FC<CarouselButtonProps> = ({
  size = 40,
  style,
}) => {
  const { scrollPrev } = useCarousel();
  return (
    <TouchableOpacity
      onPress={scrollPrev}
      style={[{ position: "absolute", left: 10, top: "50%" }, style]}
    >
      <Ionicons name="chevron-back" size={size} color="black" />
    </TouchableOpacity>
  );
};

export const CarouselNext: React.FC<CarouselButtonProps> = ({
  size = 40,
  style,
}) => {
  const { scrollNext } = useCarousel();
  return (
    <TouchableOpacity
      onPress={scrollNext}
      style={[{ position: "absolute", right: 10, top: "50%" }, style]}
    >
      <Ionicons name="chevron-forward" size={size} color="black" />
    </TouchableOpacity>
  );
};
