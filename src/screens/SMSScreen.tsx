import React, { useState, useEffect } from 'react';
import { View, StyleSheet, FlatList, ListRenderItem } from 'react-native';
import { Text, Card, Avatar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import { Header, BottomNavigation, Image } from '../components';
import { useCollection } from '../hooks/useCollection';
import { colors, spacing } from '../helpers/theme';
import { formatTime, formatDate } from '../helpers/dateUtils';
import { getMap } from '../helpers/generalUtils';
import { RootStackParamList } from '../navigation/types';

/**
 * SMSScreen - Modern WhatsApp conversation screen
 * Replaces the legacy SMSScreen.js with modern TypeScript implementation
 */

// Type definitions
interface LeadDetails {
  phone_1?: string;
  phone_2?: string;
  telephone?: string;
}

interface MessageUser {
  first_name: string;
  last_name?: string;
}

interface MessageData {
  id: number;
  text: string;
  action: 'SENT' | 'RECEIVED';
  created_at: string;
  contact?: string;
  lead_details?: LeadDetails;
  moderator_details?: MessageUser;
}

interface GroupedMessage {
  date: string;
  messages: MessageData[];
}

type Props = NativeStackScreenProps<RootStackParamList, 'SMS'>;

const SMSScreen = ({ navigation, route }: Props) => {
  const { data, title } = route.params;
  const [groupedMessages, setGroupedMessages] = useState<GroupedMessage[]>([]);

  // Get contact information
  const contact = data.contact || 
    data.lead_details?.phone_1 || 
    data.lead_details?.phone_2 || 
    data.lead_details?.telephone;

  // Fetch conversation data
  const { collection, updateCollection } = useCollection<MessageData>(
    `whatsapp-conversations/${contact}`,
    { autoFetch: true }
  );

  // Set navigation title
  useEffect(() => {
    navigation.setOptions({ 
      title: title || 'Messages',
      headerShown: false
    });
  }, [navigation, title]);

  // Group messages by date
  useEffect(() => {
    if (collection.items.length > 0) {
      const mappedMessages = getMap(
        collection.items,
        'created_at',
        true,
        (dateStr: string) => formatDate(dateStr, 'yyyy-MM-dd')
      );

      const newGroupedMessages: GroupedMessage[] = [];
      Object.entries(mappedMessages).forEach(([date, messages]) => {
        newGroupedMessages.push({
          date,
          messages: messages as MessageData[]
        });
      });

      // Sort by date (newest first)
      newGroupedMessages.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setGroupedMessages(newGroupedMessages);
    }
  }, [collection.items]);

  // Auto-refresh messages every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateCollection({ reload: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [updateCollection]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const renderMessageItem = ({ item }: { item: MessageData }) => {
    const isReceived = item.action === 'SENT';
    const messageTime = formatTime(item.created_at);

    return (
      <View style={[
        styles.messageContainer,
        isReceived ? styles.receivedMessageContainer : styles.sentMessageContainer
      ]}>
        {/* Avatar for received messages */}
        {isReceived && (
          <Avatar.Image
            size={33}
            source={{ uri: 'https://via.placeholder.com/66/3498db/ffffff?text=U' }}
            style={styles.avatar}
          />
        )}

        <View style={[
          styles.messageContent,
          isReceived ? styles.receivedMessageContent : styles.sentMessageContent
        ]}>
          <View style={styles.messageBubble}>
            <Text style={styles.messageText}>
              {item.text}
            </Text>
          </View>
          
          <View style={styles.timeContainer}>
            <Text style={styles.messageTime}>
              {messageTime}
            </Text>
          </View>
        </View>

        {/* Spacer for sent messages */}
        {!isReceived && <View style={styles.messageSpacer} />}
      </View>
    );
  };

  const renderDayGroup = ({ item }: { item: GroupedMessage }) => (
    <View style={styles.dayGroup}>
      <View style={styles.dayHeader}>
        <Text style={styles.dayText}>
          {formatDate(item.date, 'EEEE, dd MMMM yyyy')}
        </Text>
      </View>
      
      <FlatList
        data={item.messages}
        keyExtractor={(message) => message.id.toString()}
        renderItem={renderMessageItem}
        scrollEnabled={false}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Custom Header */}
      <Header
        title={title}
        canGoBack
        onBackPress={handleBackPress}
        noShadow
      />

      {/* Messages List */}
      <FlatList
        data={groupedMessages}
        keyExtractor={(item) => item.date}
        renderItem={renderDayGroup}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingTop: 0,
  },
  messagesList: {
    flex: 1,
    paddingHorizontal: spacing.md,
    marginBottom: 66, // Space for bottom navigation
  },
  messagesContent: {
    paddingVertical: spacing.md,
  },
  dayGroup: {
    marginBottom: spacing.lg,
  },
  dayHeader: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  dayText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  messageContainer: {
    flexDirection: 'row',
    marginVertical: spacing.sm,
    alignItems: 'flex-end',
  },
  receivedMessageContainer: {
    justifyContent: 'flex-start',
  },
  sentMessageContainer: {
    justifyContent: 'flex-end',
    flexDirection: 'row-reverse',
  },
  avatar: {
    marginRight: spacing.sm,
  },
  messageContent: {
    flex: 1,
    maxWidth: '80%',
  },
  receivedMessageContent: {
    alignItems: 'flex-start',
  },
  sentMessageContent: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    backgroundColor: colors.grey100,
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.xs,
  },
  messageText: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
  timeContainer: {
    paddingHorizontal: spacing.sm,
  },
  messageTime: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  messageSpacer: {
    width: 40,
  },
});

export default SMSScreen;