import React, { useState } from 'react';
import {
  User,
  Info,
  Bell,
  Lock,
  Sliders,
  Palette,
  Cpu,
  Save,
  CheckCircle,
  Key,
  Database,
  Server,
  AlertTriangle
} from 'lucide-react';
import './SettingsDashboard.css';

// ----------------------------------------------------
// Strict Type Definitions
// ----------------------------------------------------
interface ProfileSettings {
  name: string;
  email: string;
  role: string;
  department: string;
  phoneNumber: string;
}

interface AccountInfo {
  userId: string;
  createdDate: string;
  lastLogin: string;
  accessLevel: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  criticalAlerts: boolean;
  maintenanceUpdates: boolean;
  weeklyReports: boolean;
}

interface SecuritySettings {
  twoFactorAuth: boolean;
  activeSessions: number;
}

interface SystemPreferences {
  defaultView: 'Overview' | 'Live Feed' | 'GIS Map' | 'Analytics';
  defaultMapZoom: number;
  preferredReportFormat: 'PDF' | 'CSV' | 'JSON';
  language: string;
}

interface AppearanceSettings {
  darkTheme: boolean;
  compactMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
}

interface SystemInfo {
  version: string;
  buildDate: string;
  yoloModel: string;
  databaseStatus: 'Online' | 'Offline';
  backendStatus: 'Online' | 'Offline';
}

export default function SettingsDashboard() {
  // 1. Profile Settings State
  const [profile, setProfile] = useState<ProfileSettings>({
    name: 'Daksh Agarwal',
    email: 'daksh.agarwal@example.com',
    role: 'Lead System Administrator',
    department: 'Urban Infrastructure Operations',
    phoneNumber: '+1 (555) 019-2834'
  });

  // 2. Account Information (Mock Static Data)
  const accountInfo: AccountInfo = {
    userId: 'USR-2026-9812A',
    createdDate: '2024-11-15',
    lastLogin: '2026-06-20 15:48:21 (IST)',
    accessLevel: 'Level 5 (Super Admin)'
  };

  // 3. Notification Settings State
  const [notifications, setNotifications] = useState<NotificationSettings>({
    emailNotifications: true,
    criticalAlerts: true,
    maintenanceUpdates: false,
    weeklyReports: true
  });

  // 4. Security Settings State
  const [security, setSecurity] = useState<SecuritySettings>({
    twoFactorAuth: true,
    activeSessions: 3
  });

  // Password Update Form State
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // 5. System Preferences State
  const [preferences, setPreferences] = useState<SystemPreferences>({
    defaultView: 'GIS Map',
    defaultMapZoom: 14,
    preferredReportFormat: 'PDF',
    language: 'English (US)'
  });

  // 6. Appearance & Theme State
  const [appearance, setAppearance] = useState<AppearanceSettings>({
    darkTheme: true,
    compactMode: false,
    fontSize: 'medium'
  });

  // 7. About System (Mock Static Data)
  const systemInfo: SystemInfo = {
    version: 'v3.2.0-stable',
    buildDate: '2026-06-15 08:30:12 UTC',
    yoloModel: 'YOLOv11x-RoadDistress-v4.6.2',
    databaseStatus: 'Online',
    backendStatus: 'Online'
  };

  // Toast / Feedback message states
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // ----------------------------------------------------
  // Handlers
  // ----------------------------------------------------
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.name || !profile.email) {
      triggerToast('Name and Email fields are required.', 'error');
      return;
    }
    triggerToast('Profile settings saved successfully.');
  };

  const handleNotificationToggle = (field: keyof NotificationSettings) => {
    setNotifications(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    triggerToast('Notification preferences updated.');
  };

  const handle2FAToggle = () => {
    setSecurity(prev => ({
      ...prev,
      twoFactorAuth: !prev.twoFactorAuth
    }));
    triggerToast(`Two-Factor Authentication ${!security.twoFactorAuth ? 'enabled' : 'disabled'}.`);
  };

  const handleRevokeSessions = () => {
    setSecurity(prev => ({
      ...prev,
      activeSessions: 1
    }));
    triggerToast('All other active sessions revoked.');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }

    // Success flow
    triggerToast('Password updated successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowPasswordChange(false);
  };

  const handlePreferenceChange = (
    field: keyof SystemPreferences,
    value: string | number
  ) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
    triggerToast('System preference updated.');
  };

  const handleAppearanceToggle = (field: 'darkTheme' | 'compactMode') => {
    setAppearance(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
    triggerToast(`${field === 'darkTheme' ? 'Dark Theme' : 'Compact Mode'} toggled.`);
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const size = e.target.value as 'small' | 'medium' | 'large';
    setAppearance(prev => ({
      ...prev,
      fontSize: size
    }));
    triggerToast(`Font size set to ${size}.`);
  };

  return (
    <div className={`settings-dash ${appearance.compactMode ? 'settings-compact' : ''}`}>
      {/* Page Header */}
      <header className="settings-dash__header">
        <h1 className="settings-dash__title">Settings</h1>
        <p className="settings-dash__subtitle">
          Manage account, system preferences and application configuration.
        </p>

        {/* Dynamic Status Toast Notification inside Settings Dashboard */}
        {toastMessage && (
          <div className={`settings-save-toast ${toastType === 'error' ? 'settings-btn--danger' : ''}`}>
            {toastType === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            <span>{toastMessage}</span>
          </div>
        )}
      </header>

      {/* Row 1: Profile Settings & Account Information */}
      <div className="settings-dash__grid-row">
        {/* Profile Settings Card */}
        <section className="settings-card" aria-labelledby="profile-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><User size={18} /></span>
            <h2 id="profile-title" className="settings-card__title">Profile Settings</h2>
          </header>
          <div className="settings-card__body">
            <form onSubmit={handleProfileSubmit} className="settings-form">
              <div className="settings-form__row">
                <div className="form-group">
                  <label htmlFor="profile-name" className="form-label">Full Name</label>
                  <input
                    type="text"
                    id="profile-name"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-email" className="form-label">Email Address</label>
                  <input
                    type="email"
                    id="profile-email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="settings-form__row">
                <div className="form-group">
                  <label htmlFor="profile-role" className="form-label">Role</label>
                  <input
                    type="text"
                    id="profile-role"
                    name="role"
                    value={profile.role}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="profile-dept" className="form-label">Department</label>
                  <input
                    type="text"
                    id="profile-dept"
                    name="department"
                    value={profile.department}
                    onChange={handleProfileChange}
                    className="form-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="profile-phone" className="form-label">Phone Number</label>
                <input
                  type="text"
                  id="profile-phone"
                  name="phoneNumber"
                  value={profile.phoneNumber}
                  onChange={handleProfileChange}
                  className="form-input"
                />
              </div>

              <button type="submit" className="settings-btn settings-btn--primary">
                <Save size={16} />
                <span>Save Changes</span>
              </button>
            </form>
          </div>
        </section>

        {/* Account Information Card */}
        <section className="settings-card" aria-labelledby="account-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><Info size={18} /></span>
            <h2 id="account-title" className="settings-card__title">Account Information</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-meta-grid">
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">User ID</span>
                <span className="settings-meta-val font-mono">{accountInfo.userId}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Access Level</span>
                <span className="settings-meta-val">{accountInfo.accessLevel}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Account Created</span>
                <span className="settings-meta-val">{accountInfo.createdDate}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Last Login</span>
                <span className="settings-meta-val font-mono">{accountInfo.lastLogin}</span>
              </div>
            </div>
            <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(192, 132, 252, 0.04)', borderRadius: '10px', border: '1px solid rgba(192, 132, 252, 0.1)' }}>
              <p className="settings-toggle-desc" style={{ color: '#cbd5e1', fontWeight: 600 }}>System Authorization</p>
              <p className="settings-toggle-desc" style={{ marginTop: '0.25rem' }}>
                Your account is currently verified for core infrastructure configuration changes. Access logs are archived automatically.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Row 2: Notification Settings & Security Settings */}
      <div className="settings-dash__grid-row">
        {/* Notification Settings Card */}
        <section className="settings-card" aria-labelledby="notifications-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><Bell size={18} /></span>
            <h2 id="notifications-title" className="settings-card__title">Notification Settings</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-toggle-group">
              {/* Toggle 1: Email */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Email Notifications</span>
                  <span className="settings-toggle-desc">Receive email summaries of daily road detections.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.emailNotifications}
                    onChange={() => handleNotificationToggle('emailNotifications')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Toggle 2: Critical Alerts */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Critical Alert Notifications</span>
                  <span className="settings-toggle-desc">Instant alerts for severe structural road failures.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.criticalAlerts}
                    onChange={() => handleNotificationToggle('criticalAlerts')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Toggle 3: Maintenance Updates */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Maintenance Updates</span>
                  <span className="settings-toggle-desc">Get notified when repair schedules are updated.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.maintenanceUpdates}
                    onChange={() => handleNotificationToggle('maintenanceUpdates')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Toggle 4: Weekly Reports */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Weekly Reports</span>
                  <span className="settings-toggle-desc">Receive comprehensive analytical report attachments.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={notifications.weeklyReports}
                    onChange={() => handleNotificationToggle('weeklyReports')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </section>

        {/* Security Settings Card */}
        <section className="settings-card" aria-labelledby="security-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><Lock size={18} /></span>
            <h2 id="security-title" className="settings-card__title">Security Settings</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-security-layout">
              {/* Active Sessions count display */}
              <div className="active-sessions-banner">
                <div className="active-sessions-banner__count">
                  <span className="sessions-dot"></span>
                  <span>{security.activeSessions} Active Sessions</span>
                </div>
                {security.activeSessions > 1 && (
                  <button
                    onClick={handleRevokeSessions}
                    className="settings-btn settings-btn--danger"
                    style={{ padding: '0.25rem 0.50rem', fontSize: '0.75rem', borderRadius: '4px' }}
                  >
                    Revoke Others
                  </button>
                )}
              </div>

              {/* Two-Factor Authentication toggle */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Two-Factor Authentication</span>
                  <span className="settings-toggle-desc">Secure account access using authenticator tokens.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={security.twoFactorAuth}
                    onChange={handle2FAToggle}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Change Password Panel */}
              <div className="form-group">
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="settings-btn settings-btn--secondary settings-btn--full"
                >
                  <Key size={16} />
                  <span>{showPasswordChange ? 'Cancel Password Change' : 'Change Password'}</span>
                </button>

                {showPasswordChange && (
                  <form onSubmit={handlePasswordSubmit} className="password-panel">
                    {passwordError && (
                      <div style={{ color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                        {passwordError}
                      </div>
                    )}
                    <div className="form-group">
                      <label htmlFor="curr-pwd" className="form-label">Current Password</label>
                      <input
                        type="password"
                        id="curr-pwd"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="new-pwd" className="form-label">New Password</label>
                      <input
                        type="password"
                        id="new-pwd"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="conf-pwd" className="form-label">Confirm New Password</label>
                      <input
                        type="password"
                        id="conf-pwd"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="form-input"
                      />
                    </div>
                    <button type="submit" className="settings-btn settings-btn--primary">
                      Update Password
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Row 3: System Preferences & Appearance & Theme */}
      <div className="settings-dash__grid-row">
        {/* System Preferences Card */}
        <section className="settings-card" aria-labelledby="preferences-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><Sliders size={18} /></span>
            <h2 id="preferences-title" className="settings-card__title">System Preferences</h2>
          </header>
          <div className="settings-card__body">
            <div className="preferences-grid">
              {/* Default View Selection */}
              <div className="form-group">
                <label htmlFor="pref-view" className="form-label">Default Dashboard View</label>
                <select
                  id="pref-view"
                  value={preferences.defaultView}
                  onChange={(e) => handlePreferenceChange('defaultView', e.target.value as any)}
                  className="form-select"
                >
                  <option value="Overview">Overview</option>
                  <option value="Live Feed">Live Feed</option>
                  <option value="GIS Map">GIS Map</option>
                  <option value="Analytics">Analytics</option>
                </select>
              </div>

              {/* Default Map Zoom selection */}
              <div className="form-group">
                <label htmlFor="pref-zoom" className="form-label">Default Map Zoom</label>
                <select
                  id="pref-zoom"
                  value={preferences.defaultMapZoom}
                  onChange={(e) => handlePreferenceChange('defaultMapZoom', parseInt(e.target.value))}
                  className="form-select"
                >
                  <option value="10">City Level (10x)</option>
                  <option value="12">District Level (12x)</option>
                  <option value="14">Sector Level (14x)</option>
                  <option value="16">Street Level (16x)</option>
                </select>
              </div>

              {/* Preferred Report Format selection */}
              <div className="form-group">
                <label htmlFor="pref-report" className="form-label">Preferred Report Format</label>
                <select
                  id="pref-report"
                  value={preferences.preferredReportFormat}
                  onChange={(e) => handlePreferenceChange('preferredReportFormat', e.target.value as any)}
                  className="form-select"
                >
                  <option value="PDF">PDF (Enterprise Document)</option>
                  <option value="CSV">CSV (Spreadsheet/Tables)</option>
                  <option value="JSON">JSON (Developer Feeds)</option>
                </select>
              </div>

              {/* Language selection */}
              <div className="form-group">
                <label htmlFor="pref-lang" className="form-label">Language Selection</label>
                <select
                  id="pref-lang"
                  value={preferences.language}
                  onChange={(e) => handlePreferenceChange('language', e.target.value)}
                  className="form-select"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="Spanish">Español (ES)</option>
                  <option value="French">Français (FR)</option>
                  <option value="German">Deutsch (DE)</option>
                  <option value="Hindi">हिन्दी (IN)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance & Theme Card */}
        <section className="settings-card" aria-labelledby="appearance-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><Palette size={18} /></span>
            <h2 id="appearance-title" className="settings-card__title">Appearance & Theme</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-toggle-group">
              {/* Toggle Dark Theme */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Dark Theme</span>
                  <span className="settings-toggle-desc">Toggle between high-contrast dark and light modes.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={appearance.darkTheme}
                    onChange={() => handleAppearanceToggle('darkTheme')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Toggle Compact Mode */}
              <div className="settings-toggle-item">
                <div className="settings-toggle-details">
                  <span className="settings-toggle-title">Compact Mode</span>
                  <span className="settings-toggle-desc">Reduce margins and padding to show more information.</span>
                </div>
                <label className="switch-control">
                  <input
                    type="checkbox"
                    checked={appearance.compactMode}
                    onChange={() => handleAppearanceToggle('compactMode')}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>

              {/* Selector Font Size */}
              <div className="form-group" style={{ marginTop: '0.25rem' }}>
                <label htmlFor="pref-font" className="form-label">Font Size</label>
                <select
                  id="pref-font"
                  value={appearance.fontSize}
                  onChange={handleFontSizeChange}
                  className="form-select"
                >
                  <option value="small">Small (14px)</option>
                  <option value="medium">Medium (16px)</option>
                  <option value="large">Large (18px)</option>
                </select>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Row 4: About System Panel */}
      <div className="settings-dash__grid-row settings-dash__grid-row--full">
        <section className="settings-card" aria-labelledby="about-title">
          <header className="settings-card__header">
            <span className="settings-card__icon"><Cpu size={18} /></span>
            <h2 id="about-title" className="settings-card__title">About System Panel</h2>
          </header>
          <div className="settings-card__body">
            <div className="settings-meta-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Version Number</span>
                <span className="settings-meta-val font-mono">{systemInfo.version}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Build Date</span>
                <span className="settings-meta-val font-mono">{systemInfo.buildDate}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">YOLO Model Version</span>
                <span className="settings-meta-val font-mono">{systemInfo.yoloModel}</span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Database Status</span>
                <span className="settings-meta-val">
                  <span className={`status-badge status-badge--${systemInfo.databaseStatus === 'Online' ? 'online' : 'offline'}`}>
                    <Database size={12} />
                    <span>{systemInfo.databaseStatus} (PostgreSQL)</span>
                  </span>
                </span>
              </div>
              <div className="settings-meta-item">
                <span className="settings-meta-lbl">Backend Status</span>
                <span className="settings-meta-val">
                  <span className={`status-badge status-badge--${systemInfo.backendStatus === 'Online' ? 'online' : 'offline'}`}>
                    <Server size={12} />
                    <span>{systemInfo.backendStatus} (API Gateway)</span>
                  </span>
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
