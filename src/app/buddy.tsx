import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useApp } from '@/context/AppContext';
import { ClayColors, ClayRadii, ClayShadows } from '@/constants/clayTheme';
import { ClayCard } from '@/components/clay/ClayCard';
import { ClayBuddyAvatar } from '@/components/clay/ClayBuddyAvatar';
import { ClayInput } from '@/components/clay/ClayInput';
import { Ionicons } from '@expo/vector-icons';

const SUGGESTED_PROMPTS = [
  'Someone asked me to scan QR code for rent token?',
  'Suggest budget veg tiffin under ₹3,500/mo',
  'Compare Metro vs Bus fare in Bangalore',
  'Is 2 months deposit normal here?',
  'Draft a WhatsApp message to negotiate rent',
  'What should I check in electricity submeter?',
  'Explain 3 months lock-in period penalty',
];

export default function BuddyChatScreen() {
  const {
    chatMessages,
    sendChatMessage,
    isChatLoading,
    clearChat,
    activeListing,
    backendStatus,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    // Scroll to bottom on new message
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [chatMessages, isChatLoading]);

  const handleSend = () => {
    if (!inputVal.trim()) return;
    const msg = inputVal.trim();
    setInputVal('');
    sendChatMessage(msg);
  };

  const handlePromptPress = (prompt: string) => {
    sendChatMessage(prompt);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Top Assistant Persona Banner */}
      <View style={styles.topPersonaBanner}>
        <View style={styles.personaRow}>
          <ClayBuddyAvatar mood="happy" size={44} animate={false} />
          <View style={styles.personaInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.personaTitle}>PG Proof Buddy</Text>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: backendStatus.aiConfigured
                      ? '#16A34A'
                      : '#CA8A04',
                  },
                ]}
              />
              <Text style={styles.statusLabel}>
                {backendStatus.aiConfigured ? 'Gemini 2.5 Live' : 'Smart Fallback'}
              </Text>
            </View>
            <Text style={styles.personaSubtitle}>
              {activeListing
                ? `Discussing: ${activeListing.title}`
                : 'English • Hindi • Hinglish Fluent'}
            </Text>
          </View>

          <Pressable onPress={clearChat} style={styles.clearBtn}>
            <Ionicons name="trash-outline" size={18} color={ClayColors.textMuted} />
          </Pressable>
        </View>
      </View>

      {/* Messages Scroll View */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.messagesContainer}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isUser ? styles.messageRowUser : styles.messageRowAssistant,
              ]}
            >
              {!isUser && (
                <View style={styles.assistantAvatarSmall}>
                  <ClayBuddyAvatar mood="happy" size={32} animate={false} />
                </View>
              )}

              <View
                style={[
                  styles.bubble,
                  isUser ? styles.bubbleUser : styles.bubbleAssistant,
                  ClayShadows.card,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser ? styles.messageTextUser : styles.messageTextAssistant,
                  ]}
                >
                  {msg.content}
                </Text>

                {/* Quick replies if provided */}
                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <View style={styles.quickRepliesContainer}>
                    {msg.quickReplies.map((reply, idx) => (
                      <Pressable
                        key={idx}
                        onPress={() => handlePromptPress(reply)}
                        style={styles.quickReplyPill}
                      >
                        <Text style={styles.quickReplyText}>{reply}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {/* Loading Indicator Bubble */}
        {isChatLoading && (
          <View style={[styles.messageRow, styles.messageRowAssistant]}>
            <ClayBuddyAvatar mood="thinking" size={32} animate />
            <View style={[styles.bubble, styles.bubbleAssistant, styles.loadingBubble]}>
              <ActivityIndicator size="small" color={ClayColors.buddyPurple} />
              <Text style={styles.thinkingText}>Buddy is thinking...</Text>
            </View>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Suggested Prompts Horizontal Bar */}
      <View style={styles.suggestedBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.suggestedContent}
        >
          {SUGGESTED_PROMPTS.map((prompt, idx) => (
            <Pressable
              key={idx}
              onPress={() => handlePromptPress(prompt)}
              style={({ pressed }) => [
                styles.suggestedPill,
                ClayShadows.pill,
                pressed && { opacity: 0.7 },
              ]}
            >
              <Ionicons name="sparkles" size={12} color={ClayColors.buddyPurple} />
              <Text style={styles.suggestedPillText}>{prompt}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Input Composer */}
      <View style={styles.composerWrapper}>
        <View style={styles.composerInner}>
          <ClayInput
            placeholder="Type in English, Hindi, or Hinglish..."
            value={inputVal}
            onChangeText={setInputVal}
            onSubmitEditing={handleSend}
            onRightIconPress={handleSend}
            returnKeyType="send"
            containerStyle={{ marginVertical: 0, flex: 1 }}
            inputStyle={{ minHeight: 44, paddingVertical: 8 }}
            iconRight={
              <Pressable
                onPress={handleSend}
                disabled={!inputVal.trim() || isChatLoading}
                style={[
                  styles.sendBtn,
                  !inputVal.trim() && styles.sendBtnDisabled,
                ]}
              >
                <Ionicons name="send" size={16} color="#FFFFFF" />
              </Pressable>
            }
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topPersonaBanner: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1.5,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  personaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  personaInfo: {
    marginLeft: 10,
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  personaTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: ClayColors.textPrimary,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginHorizontal: 6,
  },
  statusLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: ClayColors.textMuted,
  },
  personaSubtitle: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginTop: 1,
  },
  clearBtn: {
    padding: 6,
    borderRadius: ClayRadii.pill,
    backgroundColor: '#F1F5F9',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 14,
    alignItems: 'flex-end',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowAssistant: {
    justifyContent: 'flex-start',
  },
  assistantAvatarSmall: {
    marginRight: 8,
  },
  bubble: {
    borderRadius: ClayRadii.lg,
    paddingVertical: 12,
    paddingHorizontal: 15,
    maxWidth: '82%',
    borderWidth: 1.5,
  },
  bubbleUser: {
    backgroundColor: ClayColors.buddyPurple,
    borderColor: '#4F46E5',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  messageTextUser: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  messageTextAssistant: {
    color: ClayColors.textPrimary,
  },
  quickRepliesContainer: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  quickReplyPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: ClayRadii.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#C7D2FE',
  },
  quickReplyText: {
    fontSize: 11,
    color: ClayColors.buddyPurple,
    fontWeight: '700',
  },
  loadingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  thinkingText: {
    fontSize: 12,
    color: ClayColors.textMuted,
    marginLeft: 8,
    fontWeight: '600',
  },
  suggestedBar: {
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingVertical: 8,
  },
  suggestedContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  suggestedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: ClayRadii.pill,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  suggestedPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: ClayColors.textPrimary,
    marginLeft: 5,
  },
  composerWrapper: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1.5,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
  },
  composerInner: {
    maxWidth: 720,
    alignSelf: 'center',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  sendBtn: {
    backgroundColor: ClayColors.buddyPurple,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#CBD5E1',
  },
});
