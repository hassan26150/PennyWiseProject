import * as React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react-native"; // make sure to install lucide-react-native

type PaginationProps = {
  children?: React.ReactNode;
};

export function Pagination({ children }: PaginationProps) {
  return <View style={styles.pagination}>{children}</View>;
}

export function PaginationContent({ children }: { children?: React.ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

export function PaginationItem({ children }: { children?: React.ReactNode }) {
  return <View style={styles.item}>{children}</View>;
}

type PaginationLinkProps = {
  isActive?: boolean;
  label?: string;
  onPress?: () => void;
  children?: React.ReactNode;
};

export function PaginationLink({ isActive, label, onPress }: PaginationLinkProps) {
  return (
    <Pressable
      style={[styles.link, isActive && styles.activeLink]}
      onPress={onPress}
    >
      <Text style={[styles.linkText, isActive && styles.activeLinkText]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function PaginationPrevious({ onPress }: { onPress?: () => void }) {
  return (
    <PaginationLink
      label="Previous"
      onPress={onPress}
    >
      <ChevronLeftIcon width={20} height={20} />
    </PaginationLink>
  );
}

export function PaginationNext({ onPress }: { onPress?: () => void }) {
  return (
    <PaginationLink
      label="Next"
      onPress={onPress}
    >
      <ChevronRightIcon width={20} height={20} />
    </PaginationLink>
  );
}

export function PaginationEllipsis() {
  return (
    <View style={styles.ellipsis}>
      <MoreHorizontalIcon width={20} height={20} />
      <Text style={styles.srOnly}>More pages</Text>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    marginHorizontal: 2,
  },
  link: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: "#eee",
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  activeLink: {
    backgroundColor: "#333",
  },
  linkText: {
    fontSize: 14,
    color: "#000",
  },
  activeLinkText: {
    color: "#fff",
  },
  ellipsis: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  srOnly: {
    position: "absolute",
    width: 1,
    height: 1,
    top: -9999,
    left: -9999,
  },
});