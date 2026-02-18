import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedBackground from '../../components/AnimatedBackground';
import { ApiService } from '../../services/api.service';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const NotificationsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    loadNotifications();
    if (user?.id) {
      const subscription = ApiService.subscribeToNotifications(user.id, (notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });
      return () => {
        subscription.unsubscribe();
      };
    }
  }, [user?.id]);

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }
    try {
      const data = await ApiService.getNotifications(30);
      setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      article: 'newspaper-outline',
      appointment: 'calendar-outline',
      message: 'chatbubble-outline',
      system: 'settings-outline',
      community: 'people-outline',
    };
    return icons[type] || 'notifications-outline';
  };

  return (
    <AnimatedBackground>
      <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('notifications_title') || 'Notifications'}</Text>
          <TouchableOpacity onPress={() => ApiService.markAllNotificationsAsRead()}>
            <Text style={styles.markAllRead}>{t('mark_all_read') || 'Tout marquer lu'}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {notifications.map((notification) => (
            <TouchableOpacity
              key={notification.id}
              style={[styles.notificationCard, !notification.is_read && styles.notificationUnread]}
              onPress={() => ApiService.markNotificationAsRead(notification.id)}
            >
              <View style={styles.iconWrapper}>
                <Ionicons 
                  name={getNotificationIcon(notification.type) as any} 
                  size={24} 
                  color="#7b1fa2" 
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationTitle}>{notification.title}</Text>
                <Text style={styles.notificationMessage} numberOfLines={2}>
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>Il y a 1h</Text>
              </View>
              {!notification.is_read && <View style={styles.unreadDot} />}
            </TouchableOpacity>
          ))}
          {notifications.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off-outline" size={64} color="#ddd" />
              <Text style={styles.emptyStateText}>{t('no_notifications') || 'Aucune notification'}</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </AnimatedBackground>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 28, fontWeight: '800', color: '#6a1b9a' },
  markAllRead: { fontSize: 14, fontWeight: '600', color: '#7b1fa2' },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#f3e5f5',
    alignItems: 'flex-start',
  },
  notificationUnread: { backgroundColor: '#f3e5f5' },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  notificationContent: { flex: 1 },
  notificationTitle: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  notificationMessage: { fontSize: 14, fontWeight: '400', color: '#666', marginBottom: 8, lineHeight: 20 },
  notificationTime: { fontSize: 12, fontWeight: '500', color: '#999' },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7b1fa2',
    marginLeft: 8,
    marginTop: 4,
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f3e5f5',
  },
  emptyStateIcon: { fontSize: 48, marginBottom: 16 },
  emptyStateText: { fontSize: 16, fontWeight: '500', color: '#999' },
});

export default NotificationsScreen;
