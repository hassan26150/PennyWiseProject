import * as React from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from "react-native";

type CommandItemType = {
  id: string;
  label: string;
  onPress: () => void;
  shortcut?: string;
};

type CommandDialogProps = {
  visible: boolean;
  onClose: () => void;
  items: CommandItemType[];
  title?: string;
  description?: string;
};

export const CommandDialog: React.FC<CommandDialogProps> = ({
  visible,
  onClose,
  items,
  title = "Command Palette",
  description = "Search for a command to run...",
}) => {
  const [query, setQuery] = React.useState("");

  const filteredItems = items.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Type a command..."
              style={styles.input}
              autoFocus
            />
          </View>
          <FlatList
            data={filteredItems}
            keyExtractor={(item) => item.id}
            style={{ maxHeight: 300 }}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.item}
                onPress={() => {
                  item.onPress();
                  onClose();
                }}
              >
                <Text style={styles.itemLabel}>{item.label}</Text>
                {item.shortcut && <Text style={styles.shortcut}>{item.shortcut}</Text>}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <Text style={styles.emptyText}>No commands found</Text>
            }
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  container: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: { fontWeight: "bold", fontSize: 16, marginBottom: 4 },
  description: { fontSize: 12, color: "#666", marginBottom: 8 },
  inputWrapper: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  input: { height: 40, fontSize: 14 },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  itemLabel: { fontSize: 14 },
  shortcut: { fontSize: 12, color: "#888" },
  emptyText: { textAlign: "center", padding: 16, color: "#888" },
});
