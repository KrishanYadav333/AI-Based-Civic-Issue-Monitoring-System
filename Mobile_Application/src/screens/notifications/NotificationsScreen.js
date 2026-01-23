import React, { useEffect } from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Text, FAB, Divider } from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markAsRead } from '../../store/slices/notificationSlice';

export default function NotificationsScreen() {
  const dispatch = useDispatch();
  const notifications = useSelector(state => state.notification.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, []);

  const handleNotificationPress = (notification) => {
    if (!notification.read) {
      dispatch(markAsRead(notification.id));
    }
  };

  const renderItem = ({ item }) => (
    <>
      <List.Item
        title={item.title}
        description={item.body}
        left={props => <List.Icon {...props} icon={item.read ? "email-open" : "email"} />}
        right={props => (
          <Text variant="bodySmall" style={styles.time}>
            {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        )}
        onPress={() => handleNotificationPress(item)}
        style={item.read ? {} : styles.unread}
      />
      <Divider />
    </>
  );

  return (
    <View style={styles.container}>
      {notifications.length === 0 ? (
        <View style={styles.empty}>
          <Text variant="bodyLarge" style={styles.emptyText}>No notifications</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          renderItem={renderItem}
          keyExtractor={item => item.id.toString()}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  unread: { backgroundColor: '#E3F2FD' },
  time: { color: '#666', marginTop: 8 },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyText: { color: '#999' },
});
