import * as React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { ChevronRight, MoreHorizontal } from "lucide-react-native"; // install lucide-react-native

type BreadcrumbProps = {
  children: React.ReactNode;
};

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ children }) => {
  return <View style={styles.breadcrumb}>{children}</View>;
};

export const BreadcrumbList: React.FC<BreadcrumbProps> = ({ children }) => {
  return <View style={styles.list}>{children}</View>;
};

export const BreadcrumbItem: React.FC<BreadcrumbProps> = ({ children }) => {
  return <View style={styles.item}>{children}</View>;
};

type BreadcrumbLinkProps = {
  label: string;
  onPress?: () => void;
};

export const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({ label, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text style={styles.link}>{label}</Text>
    </TouchableOpacity>
  );
};

type BreadcrumbPageProps = {
  label: string;
};

export const BreadcrumbPage: React.FC<BreadcrumbPageProps> = ({ label }) => {
  return <Text style={styles.page}>{label}</Text>;
};

type BreadcrumbSeparatorProps = {
  children?: React.ReactNode;
};

export const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({ children }) => {
  return <View style={styles.separator}>{children ?? <ChevronRight size={16} />}</View>;
};

export const BreadcrumbEllipsis: React.FC = () => {
  return (
    <View style={styles.ellipsis}>
      <MoreHorizontal size={16} />
      <Text style={styles.srOnly}>More</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  breadcrumb: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  list: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 4,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  link: {
    color: "#0ea5e9",
    fontSize: 14,
  },
  page: {
    color: "#111",
    fontSize: 14,
    fontWeight: "500",
  },
  separator: {
    marginHorizontal: 2,
  },
  ellipsis: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    top: -1000,
    left: -1000,
  },
});
