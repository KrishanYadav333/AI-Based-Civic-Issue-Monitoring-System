import { useState, useEffect } from 'react';
import { Bell, X, Check, CheckCheck } from 'lucide-react';
import { notificationService } from '../../services/newFeatures';
import { formatDistanceToNow } from 'date-fns';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationService.getNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to fetch unread count:', error);
    }
  };

  // Mark as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Poll for new notifications every 30 seconds
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fetch full notifications when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const getNotificationIcon = (type) => {
    const iconMap = {
      issue_resolved: '✅',
      issue_rejected: '❌',
      priority_escalated: '⚠️',
      civic_voice_alert: '📢'
    };
    return iconMap[type] || '📬';
  };

  return (
    <div className="notification-bell-container">
      {/* Bell Icon Button */}
      <button 
        className="notification-bell-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div className="notification-overlay" onClick={() => setIsOpen(false)} />
          <div className="notification-panel">
            {/* Header */}
            <div className="notification-header">
              <h3>Notifications</h3>
              <div className="notification-header-actions">
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                    title="Mark all as read"
                  >
                    <CheckCheck size={16} />
                  </button>
                )}
                <button 
                  className="close-panel-btn"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Notifications List */}
            <div className="notification-list">
              {loading ? (
                <div className="notification-loading">Loading...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">
                  <Bell size={48} strokeWidth={1} />
                  <p>No notifications yet</p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div 
                    key={notification.id}
                    className={`notification-item ${!notification.is_read ? 'unread' : ''}`}
                    onClick={() => !notification.is_read && handleMarkAsRead(notification.id)}
                  >
                    <div className="notification-icon">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="notification-content">
                      <h4>{notification.title}</h4>
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    {!notification.is_read && (
                      <button 
                        className="mark-read-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                        title="Mark as read"
                      >
                        <Check size={16} />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationBell;
