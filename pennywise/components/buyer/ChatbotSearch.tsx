import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Animated, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, RADIUS, FONT_SIZE } from '../../theme';
import { trackSearch } from '../../api/analytics.api';
import useChatbotStore from '../../store/chatbotStore';

interface ChatbotSearchProps {
  onNavigate: (screen: string) => void;
  onSelectProduct: (product: any) => void;
}

const sampleQueries = [
  'Phones under PKR 50,000',
  'Best wireless earbuds',
  'Laptops for students',
  'Gaming accessories',
];

export default function ChatbotSearch({ onNavigate, onSelectProduct }: ChatbotSearchProps) {
  const { messages, isTyping, sendMessage, clearChat } = useChatbotStore();
  const [input, setInput] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim()) return;

    trackSearch(messageText).catch(err => console.log('Analytics search failed', err));
    
    sendMessage(messageText);
    setInput('');
  };

  const handleQueryClick = (query: string) => {
    handleSendMessage(query);
  };

  return (
    <KeyboardAvoidingView
      behavior="padding"
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 25}
    >
      <LinearGradient colors={[COLORS.background, '#fff', COLORS.authBg]} style={{ flex: 1 }}>
        {/* Header */}
        <LinearGradient colors={COLORS.gradientPrimary} style={{ padding: 16, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => onNavigate('home')} style={{ padding: 8 }}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 12 }}>
            <LinearGradient colors={COLORS.gradientAccent} style={{ borderRadius: 50, padding: 6, marginRight: 8 }}>
              <Feather name="cpu" size={16} color="#fff" />
            </LinearGradient>
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16 }}>PennyWise AI</Text>
              <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12 }}>Shopping Assistant</Text>
            </View>
            <TouchableOpacity onPress={clearChat} style={{ padding: 8 }}>
              <Feather name="trash-2" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView 
          ref={scrollViewRef}
          style={{ flex: 1 }} 
          contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
          onContentSizeChange={() => {
            if (messages.length > 1) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }}
        >
          {/* Sample Queries */}
          {messages.length === 1 && (
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 }}>Try asking me:</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {sampleQueries.map((query, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => handleQueryClick(query)}
                    style={{
                      backgroundColor: COLORS.primaryTint,
                      paddingVertical: 6,
                      paddingHorizontal: 12,
                      borderRadius: 50,
                      borderWidth: 1,
                      borderColor: COLORS.primary,
                      marginRight: 6,
                      marginBottom: 6,
                    }}
                  >
                    <Text style={{ fontSize: 12, color: COLORS.primary }}>{query}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Messages */}
          {messages.map((msg: any) => (
            <View key={msg.id} style={{ flexDirection: 'row', justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              {msg.type === 'bot' && (
                <View style={{ width: '85%' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <LinearGradient colors={COLORS.gradientPrimary} style={{ borderRadius: 50, padding: 6, marginRight: 8 }}>
                      <Feather name="cpu" size={16} color="#fff" />
                    </LinearGradient>
                    <View style={{ flex: 1 }}>
                      {!!msg.text && (
                        <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
                          <Text style={{ fontSize: 13, color: '#111827' }}>{String(msg.text)}</Text>
                        </View>
                      )}
                      
                      {msg.products && msg.products.length > 0 && (
                        <View style={{ marginTop: 8 }}>
                          {msg.products.map((product: any, idx: number) => (
                            <TouchableOpacity
                              key={product._id || idx}
                              onPress={() => {
                                onSelectProduct(product);
                                onNavigate('product');
                              }}
                              style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                backgroundColor: '#fff',
                                borderRadius: 12,
                                padding: 12,
                                marginBottom: 8,
                                borderWidth: 1,
                                borderColor: COLORS.border,
                              }}
                            >
                              <View style={{ backgroundColor: COLORS.primaryTint, padding: 10, borderRadius: 10, marginRight: 10 }}>
                                <Feather name={product.thumbnail ? "image" : "shopping-bag"} size={24} color={COLORS.primary} />
                              </View>
                              
                              <View style={{ flex: 1, justifyContent: 'center' }}>
                                <Text style={{ fontSize: 13, color: '#111827', marginBottom: 4 }}>
                                  {product.name || 'Unknown Product'}
                                </Text>
                                <Text style={{ fontSize: 13, fontWeight: 'bold', color: COLORS.primary, marginBottom: 4 }}>
                                  PKR {product.lowest_market_price?.toLocaleString() || product.price?.toLocaleString() || '0'}
                                </Text>
                                <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                  {product.best_platform && (
                                    <View style={{ backgroundColor: COLORS.success, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 4 }}>
                                      <Text style={{ fontSize: 10, color: '#fff', fontWeight: 'bold' }}>
                                        Best: {product.best_platform}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              </View>
                            </TouchableOpacity>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                </View>
              )}
              {msg.type === 'user' && (
                <LinearGradient colors={COLORS.gradientPrimary} style={{ borderRadius: 16, padding: 12, maxWidth: '75%' }}>
                  <Text style={{ color: '#fff', fontSize: 13 }}>{String(msg.text)}</Text>
                </LinearGradient>
              )}
            </View>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <LinearGradient colors={COLORS.gradientPrimary} style={{ borderRadius: 50, padding: 6 }}>
                <Feather name="cpu" size={16} color="#fff" />
              </LinearGradient>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: COLORS.border }}>
                <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.primary, marginRight: 2 }} />
                <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.secondary, marginRight: 2 }} />
                <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.accent }} />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={{ padding: 16, backgroundColor: '#fff', borderTopWidth: 1, borderColor: COLORS.border, flexDirection: 'row', gap: 8 }}>
          <TextInput
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => handleSendMessage()}
            placeholder="Ask me anything..."
            placeholderTextColor="#9ca3af"
            style={{
              flex: 1,
              paddingVertical: 10,
              paddingHorizontal: 12,
              borderWidth: 1,
              borderColor: COLORS.border,
              borderRadius: 16,
              backgroundColor: COLORS.primaryTint,
              color: COLORS.textPrimary,
            }}
          />
          <LinearGradient colors={COLORS.gradientPrimary} style={{ borderRadius: 16 }}>
            <TouchableOpacity
              onPress={() => handleSendMessage()}
              disabled={!input.trim()}
              style={{ paddingVertical: 10, paddingHorizontal: 14, alignItems: 'center' }}
            >
              <Feather name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </LinearGradient>
        </View>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}