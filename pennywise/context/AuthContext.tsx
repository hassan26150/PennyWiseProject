import React, { createContext, useContext, useEffect } from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import useAuthStore from '../store/authStore';
import { COLORS } from '../theme';

const AuthContext = createContext(null);

/**
 * Auth Provider — wraps the app and handles session restore on mount.
 * Shows a loading screen while checking for an existing session.
 */
export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const isLoading = useAuthStore((s) => s.isLoading);
  const restoreSession = useAuthStore((s) => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  // Show branded loading screen while restoring session
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.logo}>PennyWise</Text>
        <Text style={styles.tagline}>Compare smart. Spend Wise.</Text>
        <ActivityIndicator size="large" color={COLORS.accent} style={styles.spinner} />
      </View>
    );
  }

  return (
    <AuthContext.Provider value={null}>
      {children}
    </AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E0F2F1',
  },
  logo: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: COLORS.secondary,
    marginBottom: 40,
  },
  spinner: {
    marginTop: 20,
  },
});

