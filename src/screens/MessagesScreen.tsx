import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  // Image,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Surface,
  Text,
  Card,
  Avatar,
  Badge,
  // IconButton,
  ActivityIndicator,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Modern hooks and helpers
import { useCollection } from '../hooks/useCollection';
import { useRefresh } from '../hooks/useRefresh';
import { useUserId } from '../hooks/useAsyncStorage';
import { getDisplayName, getUserInitials } from '../helpers/applicationUtils';
import { formatDate, getRelativeTime } from '../helpers/dateUtils';
import { colors, spacing } from '../helpers/theme';
import { apiService } from '../helpers/request';
import { Header, BottomNavigation } from '../components';


// Type definitions
interface User {
  id: number;
  first_name: string;
  last_name?: string;
  email?: string;
}

interface EmailItem {
  id: number;
  user_details: User;
  template_details: {
    subject: string;
  };
  created_at: string;
}

interface MessageItem {
  id: number;
  moderator_details?: User;
  text: string;
  unread_count: number;
  created_at: string;
}

type MessageType = 'email' | 'whatsapp';

type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  Email: { data: EmailItem; title: string };
  SMS: { data: MessageItem; title: string };
  Notification: undefined;
};

type MessagesScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: MessagesScreenNavigationProp;
}

const MessagesScreen: React.FC<Props> = ({ navigation }) => {
  // Modern hooks
  const { userId } = useUserId();
  
  // State management
  const [selectedTab, setSelectedTab] = useState<MessageType>('email');
  const [emailItems, setEmailItems] = useState<EmailItem[]>([]);
  const [messageItems, setMessageItems] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  // Load data
  const loadEmails = useCallback(async () => {
    try {
      // Use the same endpoint as legacy: 'me/email-logs'
      const response = await apiService.get('me/email-logs');
      setEmailItems(response.data.data || []);
    } catch (error) {
      console.error('Error loading emails:', error);
      Alert.alert('Error', 'Failed to load emails');
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      // Use modern userId hook instead of SecureStorage
      if (userId) {
        const response = await apiService.get(`whatsapp-conversations?id_lead=${userId}`);
        setMessageItems(response.data.data || []);
      } else {
        console.log('No userId found, loading conversations without filter');
        const response = await apiService.get('whatsapp-conversations');
        setMessageItems(response.data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
    }
  }, [userId]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([loadEmails(), loadMessages()]);
    } finally {
      setLoading(false);
    }
  }, [loadEmails, loadMessages]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadData();
    } finally {
      setRefreshing(false);
    }
  }, [loadData]);

  // Load data on mount and set up refresh interval
  useEffect(() => {
    loadData();

    // Set up auto-refresh every 5 seconds
    const interval = setInterval(() => {
      loadData();
    }, 5000);

    return () => clearInterval(interval);
  }, [loadData]);

  // Navigation handlers
  const handleEmailPress = useCallback((item: EmailItem) => {
    navigation.navigate('Email', {
      data: item,
      title: item.user_details.first_name,
    });
  }, [navigation]);

  const handleMessagePress = useCallback((item: MessageItem) => {
    navigation.navigate('SMS', {
      data: item,
      title: item.moderator_details?.first_name || '(No name)',
    });
  }, [navigation]);

  // Format date helper
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  // Render email item
  const renderEmailItem = ({ item }: { item: EmailItem }) => (
    <Card style={styles.messageCard} onPress={() => handleEmailPress(item)}>
      <Card.Content style={styles.messageContent}>
        <View style={styles.messageRow}>
          <Avatar.Text
            size={50}
            label={item.user_details.first_name.charAt(0).toUpperCase()}
            style={styles.avatar}
          />
          <View style={styles.messageInfo}>
            <View style={styles.messageHeader}>
              <Text style={styles.senderName}>
                {item.user_details.first_name}
              </Text>
              <Text style={styles.sentTime}>
                {formatDate(item.created_at)}
              </Text>
            </View>
            <Text style={styles.messageText} numberOfLines={2}>
              {item.template_details.subject}
            </Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  // Render message item
  const renderMessageItem = ({ item }: { item: MessageItem }) => (
    <Card style={styles.messageCard} onPress={() => handleMessagePress(item)}>
      <Card.Content style={styles.messageContent}>
        <View style={styles.messageRow}>
          <Avatar.Text
            size={50}
            label={(item.moderator_details?.first_name || 'U').charAt(0).toUpperCase()}
            style={styles.avatar}
          />
          <View style={styles.messageInfo}>
            <View style={styles.messageHeader}>
              <Text style={styles.senderName}>
                {item.moderator_details?.first_name || '(No name)'}
              </Text>
              <Text style={styles.sentTime}>
                {formatDate(item.created_at)}
              </Text>
            </View>
            <View style={styles.messageBottom}>
              <Text style={styles.messageText} numberOfLines={2}>
                {item.text}
              </Text>
              {item.unread_count > 0 && (
                <Badge style={styles.unreadBadge}>
                  {item.unread_count}
                </Badge>
              )}
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        title="Messages"
        showNotification
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Tab Switcher */}
        <Surface style={styles.tabContainer}>
          <View style={styles.customSegmentedButtons}>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                selectedTab === 'email' && styles.segmentButtonActive
              ]}
              onPress={() => setSelectedTab('email')}
              activeOpacity={0.7}
            >
              <Icon 
                name="mail" 
                size={20} 
                color={selectedTab === 'email' ? '#6750A4' : '#666'} 
              />
              <Text style={[
                styles.segmentButtonText,
                selectedTab === 'email' && styles.segmentButtonTextActive
              ]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentButton,
                selectedTab === 'whatsapp' && styles.segmentButtonActive
              ]}
              onPress={() => setSelectedTab('whatsapp')}
              activeOpacity={0.7}
            >
              <Icon 
                name="message-circle" 
                size={20} 
                color={selectedTab === 'whatsapp' ? '#6750A4' : '#666'} 
              />
              <Text style={[
                styles.segmentButtonText,
                selectedTab === 'whatsapp' && styles.segmentButtonTextActive
              ]}>
                WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        </Surface>

        {/* Messages List */}
        {loading && (selectedTab === 'email' ? emailItems : messageItems).length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" />
            <Text style={styles.loadingText}>Loading messages...</Text>
          </View>
        ) : selectedTab === 'email' ? (
          <FlatList
            data={emailItems}
            renderItem={renderEmailItem}
            keyExtractor={(item) => `email-${item.id}`}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No emails found</Text>
              </View>
            }
          />
        ) : (
          <FlatList
            data={messageItems}
            renderItem={renderMessageItem}
            keyExtractor={(item) => `message-${item.id}`}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No messages found</Text>
              </View>
            }
          />
        )}
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 16,
    marginBottom: 66, // Account for bottom navigation
  },
  tabContainer: {
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  customSegmentedButtons: {
    flexDirection: 'row',
    margin: 8,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    gap: 8,
  },
  segmentButtonActive: {
    backgroundColor: '#E8DEF8',
  },
  segmentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  segmentButtonTextActive: {
    color: '#6750A4',
  },
  listContainer: {
    paddingBottom: 20,
  },
  messageCard: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  messageContent: {
    padding: 12,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  avatar: {
    marginRight: 12,
  },
  messageInfo: {
    flex: 1,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  sentTime: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  messageBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  messageText: {
    fontSize: 14,
    color: '#7f8c8d',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#3498db',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
  },
});

export default MessagesScreen;