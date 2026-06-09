import * as React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { LineChart, BarChart, PieChart } from "react-native-chart-kit";

type ChartConfigItem = {
  label?: string;
  color?: string;
};

export type ChartConfig = Record<string, ChartConfigItem>;

type ChartContextProps = {
  config: ChartConfig;
};

const ChartContext = React.createContext<ChartContextProps | null>(null);

export function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

type ChartContainerProps = {
  config: ChartConfig;
  children: React.ReactNode;
  width: number;
  height: number;
};

export const ChartContainer: React.FC<ChartContainerProps> = ({
  config,
  children,
  width,
  height,
}) => {
  return (
    <ChartContext.Provider value={{ config }}>
      <View style={{ width, height, justifyContent: "center" }}>{children}</View>
    </ChartContext.Provider>
  );
};

// ---------------- Chart Tooltip ----------------
type ChartTooltipProps = {
  label: string;
  value: number;
  color?: string;
};

export const ChartTooltip: React.FC<ChartTooltipProps> = ({
  label,
  value,
  color = "#000",
}) => {
  return (
    <View style={[styles.tooltip, { borderColor: color }]}>
      <Text style={[styles.tooltipLabel, { color }]}>{label}</Text>
      <Text style={[styles.tooltipValue, { color }]}>{value}</Text>
    </View>
  );
};

// ---------------- Chart Legend ----------------
type ChartLegendProps = {
  payload: { name: string; color: string }[];
  hideIcon?: boolean;
};

export const ChartLegend: React.FC<ChartLegendProps> = ({ payload, hideIcon }) => {
  return (
    <View style={styles.legendContainer}>
      {payload.map((item) => (
        <View key={item.name} style={styles.legendItem}>
          {!hideIcon && (
            <View
              style={[styles.legendIcon, { backgroundColor: item.color }]}
            />
          )}
          <Text>{item.name}</Text>
        </View>
      ))}
    </View>
  );
};

// ---------------- Styles ----------------
const styles = StyleSheet.create({
  tooltip: {
    padding: 8,
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
  tooltipLabel: {
    fontWeight: "bold",
  },
  tooltipValue: {},
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  legendIcon: {
    width: 12,
    height: 12,
    borderRadius: 2,
  },
});