import * as React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Calendar as RNCalendar, LocaleConfig } from "react-native-calendars";
import { MaterialIcons } from "@expo/vector-icons"; // For arrows
//import { buttonVariants } from "./button"; // optional for button styles

// Optional: configure locale
LocaleConfig.locales["en"] = {
  monthNames: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  monthNamesShort: [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ],
  dayNames: ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"],
  dayNamesShort: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
};
LocaleConfig.defaultLocale = "en";

interface CalendarProps {
  onDayPress?: (day: any) => void;
  markedDates?: any;
}

export function Calendar({ onDayPress, markedDates }: CalendarProps) {
  return (
    <View style={styles.container}>
      <RNCalendar
        onDayPress={onDayPress}
        markedDates={markedDates}
        theme={{
          todayTextColor: "#3b82f6",
          selectedDayBackgroundColor: "#3b82f6",
          selectedDayTextColor: "#fff",
          arrowColor: "#3b82f6",
          textDisabledColor: "#a1a1aa",
          monthTextColor: "#111827",
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        renderArrow={(direction) => (
          <MaterialIcons
            name={direction === "left" ? "chevron-left" : "chevron-right"}
            size={24}
            color="#3b82f6"
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
