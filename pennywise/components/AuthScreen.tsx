import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import useAuthStore from '../store/authStore';

type Role = 'buyer' | 'seller' | 'admin';

export default function AuthScreen() {
  const [role, setRole] = useState<Role>('buyer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [storeName, setStoreName] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const { login, signup, isLoading, error, clearError } = useAuthStore();

  const handleAuth = async () => {
    clearError();
    setFieldErrors({});

    // Basic client-side validation
    const errors: Record<string, string> = {};

    if (!email.trim()) errors.email = 'Email is required';
    if (!password.trim()) errors.password = 'Password is required';

    if (!isLogin) {
      if (!name.trim()) errors.name = 'Name is required';
      if (role === 'seller' && !storeName.trim()) errors.storeName = 'Store name is required';
      if (password.length < 8) errors.password = 'Password must be at least 8 characters';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    let result;

    if (isLogin) {
      result = await login(email.trim(), password, role);
    } else {
      result = await signup(
        name.trim(),
        email.trim(),
        password,
        role,
        role === 'seller' ? storeName.trim() : null
      );
    }

    // Handle field-level validation errors from backend
    if (!result.success && result.errors?.length > 0) {
      const backendErrors: Record<string, string> = {};
      result.errors.forEach((err: any) => {
        if (err.field) backendErrors[err.field] = err.message;
      });
      setFieldErrors(backendErrors);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    clearError();
    setFieldErrors({});
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to PennyWise</Text>
          <Text style={styles.quote}>"Compare smart. Spend Wise"</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{isLogin ? 'Login' : 'Create Account'}</Text>

          {/* Role Selector */}
          <Text style={styles.label}>Select Your Role</Text>
          <View style={styles.roleContainer}>
            {(['buyer', 'seller', 'admin'] as Role[]).map((r) => (
              <TouchableOpacity
                key={r}
                style={[styles.roleButton, role === r && styles.roleButtonActive]}
                onPress={() => setRole(r)}
                disabled={isLoading}
              >
                <Text style={[styles.roleText, role === r && styles.roleTextActive]}>
                  {r.charAt(0).toUpperCase() + r.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Name field (signup only) */}
          {!isLogin && (
            <View style={styles.fieldContainer}>
              <View style={styles.inputGroup}>
                <Feather name="user" size={20} color="#018790" style={styles.icon} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  editable={!isLoading}
                />
              </View>
              {fieldErrors.name && <Text style={styles.fieldError}>{fieldErrors.name}</Text>}
            </View>
          )}

          {/* Email */}
          <View style={styles.fieldContainer}>
            <View style={styles.inputGroup}>
              <Feather name="mail" size={20} color="#018790" style={styles.icon} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#9ca3af"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!isLoading}
              />
            </View>
            {fieldErrors.email && <Text style={styles.fieldError}>{fieldErrors.email}</Text>}
          </View>

          {/* Password */}
          <View style={styles.fieldContainer}>
            <View style={styles.inputGroup}>
              <Feather name="lock" size={20} color="#018790" style={styles.icon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9ca3af"
                style={[styles.input, { flex: 1 }]}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                editable={!isLoading}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Feather name={showPassword ? 'eye-off' : 'eye'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
            {fieldErrors.password && <Text style={styles.fieldError}>{fieldErrors.password}</Text>}
            {!isLogin && (
              <Text style={styles.passwordHint}>Min 8 characters, 1 uppercase, 1 number</Text>
            )}
          </View>

          {/* Store Name (seller signup only) */}
          {!isLogin && role === 'seller' && (
            <View style={styles.fieldContainer}>
              <View style={styles.inputGroup}>
                <Feather name="shopping-bag" size={20} color="#018790" style={styles.icon} />
                <TextInput
                  placeholder="Store Name"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  value={storeName}
                  onChangeText={setStoreName}
                  editable={!isLoading}
                />
              </View>
              {fieldErrors.storeName && <Text style={styles.fieldError}>{fieldErrors.storeName}</Text>}
            </View>
          )}

          {/* Global error message */}
          {error && (
            <View style={styles.errorContainer}>
              <Feather name="alert-circle" size={16} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Submit button */}
          <TouchableOpacity
            style={[styles.mainButton, isLoading && styles.mainButtonDisabled]}
            onPress={handleAuth}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.mainButtonText}>{isLogin ? 'Login' : 'Sign Up'}</Text>
            )}
          </TouchableOpacity>

          {/* Forgot password (login only) */}
          {isLogin && (
            <TouchableOpacity
              onPress={() => Alert.alert('Forgot Password', 'Password reset will be available soon.')}
              style={styles.forgotLink}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Switch login/signup */}
          <TouchableOpacity onPress={switchMode} style={styles.switchLink} disabled={isLoading}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E0F2F1' },
  scrollContent: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#005461' },
  quote: { fontSize: 16, fontStyle: 'italic', color: '#018790', marginTop: 5 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 25, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  cardTitle: { fontSize: 22, fontWeight: 'bold', color: '#005461', textAlign: 'center', marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#666', marginBottom: 10, textAlign: 'center' },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
  roleButton: { flex: 1, paddingVertical: 10, marginHorizontal: 4, borderRadius: 10, borderWidth: 1, borderColor: '#018790', alignItems: 'center' },
  roleButtonActive: { backgroundColor: '#018790' },
  roleText: { color: '#018790', fontWeight: '600' },
  roleTextActive: { color: '#fff' },
  fieldContainer: { marginBottom: 15 },
  inputGroup: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f9f9f9', borderRadius: 12, paddingHorizontal: 15, height: 55 },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 16 },
  fieldError: { color: '#EF4444', fontSize: 12, marginTop: 4, marginLeft: 4 },
  passwordHint: { color: '#9CA3AF', fontSize: 11, marginTop: 4, marginLeft: 4 },
  errorContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FEF2F2', borderRadius: 10, padding: 12, marginBottom: 15, gap: 8 },
  errorText: { color: '#EF4444', fontSize: 14, flex: 1 },
  mainButton: { backgroundColor: '#00B7B5', height: 55, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginTop: 10 },
  mainButtonDisabled: { opacity: 0.7 },
  mainButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  forgotLink: { marginTop: 15, alignItems: 'center' },
  forgotText: { color: '#018790', fontSize: 13 },
  switchLink: { marginTop: 15, alignItems: 'center' },
  switchText: { color: '#005461', fontSize: 14 },
});