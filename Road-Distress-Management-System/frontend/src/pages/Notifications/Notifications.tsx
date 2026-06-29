import { useState } from 'react';
import { Bell, ShieldAlert, FileText, CheckCircle2, Trash2, Check } from 'lucide-react';
import './Notifications.css';


interface NotificationItem {
  id: string;
  type: 'danger' | 'warning' | 'success' | 'info';
  title: string;
  message: string;
  time: string;
  dateGroup: 'Today' | 'Yesterday' | 'Earlier';
  unread: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'NT-101',
      type: 'danger',
      title: 'Critical Distress Found',
      message: 'Pothole detected on NH-48 (KM 42.5 near Lonavala Ghats) requires immediate work order scheduling.',
      time: '10 mins ago',
      dateGroup: 'Today',
      unread: true,
    },
    {
      id: 'NT-102',
      type: 'success',
      title: 'YOLOv11 Inference Complete',
      message: 'Video upload log surveillance_cam_mumbai.mp4 processed successfully. 12 distresses tagged.',
      time: '2 hours ago',
      dateGroup: 'Today',
      unread: true,
    },
    {
      id: 'NT-103',
      type: 'info',
      title: 'PDF Report Exported',
      message: 'Maintenance team generated and compiled NH-48 quarterly repair estimates document.',
      time: 'Yesterday at 17:30',
      dateGroup: 'Yesterday',
      unread: false,
    },
    {
      id: 'NT-104',
      type: 'warning',
      title: 'Camera CAM-04 Offline',
      message: 'surveillance feed stream from sector 4 has been interrupted for more than 5 minutes.',
      time: 'Yesterday at 12:15',
      dateGroup: 'Yesterday',
      unread: false,
    },
    {
      id: 'NT-105',
      type: 'success',
      title: 'Work Order Closed',
      message: 'Maharashtra highway repair team completed sealing operations on Eastern Express cracks.',
      time: 'June 25, 2026',
      dateGroup: 'Earlier',
      unread: false,
    },
  ]);

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleToggleRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: !n.unread } : n));
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const unreadCount = notifications.filter(n => n.unread).length;

  const renderSection = (groupName: 'Today' | 'Yesterday' | 'Earlier') => {
    const items = notifications.filter(n => n.dateGroup === groupName);
    if (items.length === 0) return null;

    return (
      <div className="notification-section">
        <h3 className="small-caption font-bold notification-section__title">{groupName}</h3>
        <div className="notification-section__list">
          {items.map((item) => (
            <div key={item.id} className={`notification-item ${item.unread ? 'notification-item--unread' : ''}`}>
              <div className={`notification-item__icon-wrapper notification-item__icon-wrapper--${item.type}`}>
                {item.type === 'danger' && <ShieldAlert size={16} />}
                {item.type === 'warning' && <ShieldAlert size={16} />}
                {item.type === 'success' && <CheckCircle2 size={16} />}
                {item.type === 'info' && <FileText size={16} />}
              </div>
              <div className="notification-item__content">
                <div className="notification-item__header">
                  <h4 className="notification-item__title">{item.title}</h4>
                  <span className="notification-item__time">{item.time}</span>
                </div>
                <p className="notification-item__message">{item.message}</p>
              </div>
              <div className="notification-item__actions">
                <button 
                  className={`btn-mark ${item.unread ? 'btn-mark--unread' : ''}`}
                  onClick={() => handleToggleRead(item.id)}
                  title={item.unread ? "Mark as read" : "Mark as unread"}
                >
                  <Check size={14} />
                </button>
                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(item.id)}
                  title="Remove notification"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="notifications-page animate-fade-in">
      <header className="notifications-page__header">
        <div className="notifications-page__titles">
          <h1 className="bold-page-title">Notification Center</h1>
          <p className="light-secondary-text">Keep track of real-time road anomalies flagged by the AI engine.</p>
        </div>
        {unreadCount > 0 && (
          <span className="unread-badge">{unreadCount} Unread Alerts</span>
        )}
      </header>

      <div className="notifications-container premium-card">
        <div className="notifications-container__header">
          <h2 className="medium-section-title">All Notifications</h2>
          {unreadCount > 0 && (
            <button className="btn-mark-all" onClick={handleMarkAllAsRead}>
              <CheckCircle2 size={14} />
              <span>Mark all as read</span>
            </button>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <Bell size={36} style={{ color: 'var(--secondary-text)', opacity: 0.5 }} />
            <p>Your notification tray is empty.</p>
          </div>
        ) : (
          <div className="notifications-sections">
            {renderSection('Today')}
            {renderSection('Yesterday')}
            {renderSection('Earlier')}
          </div>
        )}
      </div>
    </div>
  );
}
