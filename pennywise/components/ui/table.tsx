import * as React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";

/* TABLE CONTAINER */
function Table({ children, style }: { children: React.ReactNode; style?: any }) {
  return (
    <ScrollView horizontal style={[styles.container, style]}>
      <View>{children}</View>
    </ScrollView>
  );
}

/* HEADER */
function TableHeader({ children }: { children: React.ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

/* BODY */
function TableBody({ children }: { children: React.ReactNode }) {
  return <View>{children}</View>;
}

/* FOOTER */
function TableFooter({ children }: { children: React.ReactNode }) {
  return <View style={styles.footer}>{children}</View>;
}

/* ROW */
function TableRow({
  children,
  selected = false,
}: {
  children: React.ReactNode;
  selected?: boolean;
}) {
  return (
    <View style={[styles.row, selected && styles.selectedRow]}>
      {children}
    </View>
  );
}

/* HEADER CELL */
function TableHead({ children }: { children: React.ReactNode }) {
  return <Text style={styles.headCell}>{children}</Text>;
}

/* NORMAL CELL */
function TableCell({ children }: { children: React.ReactNode }) {
  return <Text style={styles.cell}>{children}</Text>;
}

/* CAPTION */
function TableCaption({ children }: { children: React.ReactNode }) {
  return <Text style={styles.caption}>{children}</Text>;
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#f3f4f6",
  },
  row: {
    flexDirection: "row",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  selectedRow: {
    backgroundColor: "#e0f2fe",
  },
  headCell: {
    minWidth: 100,
    fontWeight: "600",
    paddingHorizontal: 8,
  },
  cell: {
    minWidth: 100,
    paddingHorizontal: 8,
  },
  caption: {
    marginTop: 10,
    fontSize: 12,
    color: "#666",
  },
});

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
