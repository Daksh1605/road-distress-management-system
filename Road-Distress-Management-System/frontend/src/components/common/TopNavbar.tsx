import { useState, useEffect, useRef } from 'react'
import { useLocation, Link } from 'react-router-dom'
import { Search, Bell, ChevronDown, User, Settings, LogOut } from 'lucide-react'
import './TopNavbar.css'

export default function TopNavbar() {
  const location = useLocation()
  const [dateTime, setDateTime] = useState(new Date())
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [unreadNotifications, setUnreadNotifications] = useState(3)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Dynamic Ticking Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Get matching page title from route path
  const getPageTitle = (pathname: string) => {
    const path = pathname.toLowerCase()
    if (path === '/' || path === '/dashboard') return 'Dashboard'
    if (path === '/gis-map') return 'GIS Map Overview'
    if (path === '/live-monitoring') return 'Live Monitoring Feeds'
    if (path === '/analytics') return 'Analytics & Trends'
    if (path === '/reports') return 'Generated Reports'
    if (path === '/maintenance') return 'Maintenance Board'
    if (path === '/settings') return 'System Settings'
    return 'Road Distress MS'
  }

  // Formatting Date and Time
  const formattedDateTime = dateTime.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  })

  const handleNotificationClick = () => {
    // Clear notifications for demo purposes
    setUnreadNotifications(0)
    alert('Notifications panel opened (Mock).')
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Global Search triggered (Mock).')
  }

  return (
    <header className="top-navbar" aria-label="Top Navigation Bar">
      {/* Left Area: Title and Clock */}
      <div className="top-navbar__left">
        <h1 className="top-navbar__title">{getPageTitle(location.pathname)}</h1>
        <span className="top-navbar__clock" aria-live="polite">
          {formattedDateTime}
        </span>
      </div>

      {/* Right Area: Search, Notifications, Profile Dropdown */}
      <div className="top-navbar__right">
        {/* Global Search Bar */}
        <form onSubmit={handleSearchSubmit} className="top-navbar__search-form">
          <div className="top-navbar__search-wrapper">
            <Search className="top-navbar__search-icon" size={16} />
            <input
              type="text"
              placeholder="Search anything..."
              className="top-navbar__search-input"
              aria-label="Global Search"
            />
          </div>
        </form>

        {/* Notifications Icon with Badge */}
        <button
          className="top-navbar__btn top-navbar__btn--notify"
          onClick={handleNotificationClick}
          type="button"
          aria-label={`${unreadNotifications} unread notifications`}
        >
          <Bell size={20} />
          {unreadNotifications > 0 && (
            <span className="top-navbar__badge" aria-hidden="true">
              {unreadNotifications}
            </span>
          )}
        </button>

        {/* Divider */}
        <div className="top-navbar__divider" aria-hidden="true" />

        {/* User Profile Dropdown */}
        <div className="top-navbar__profile-dropdown" ref={dropdownRef}>
          <button
            className="top-navbar__profile-btn"
            onClick={() => setDropdownOpen((prev) => !prev)}
            aria-expanded={dropdownOpen}
            aria-haspopup="menu"
            type="button"
          >
            <div className="top-navbar__avatar">DA</div>
            <span className="top-navbar__user-name">Daksh Agarwal</span>
            <ChevronDown
              size={14}
              className={`top-navbar__chevron ${dropdownOpen ? 'top-navbar__chevron--open' : ''}`}
            />
          </button>

          {dropdownOpen && (
            <div className="top-navbar__menu" role="menu" aria-label="User actions">
              <Link
                to="/settings"
                className="top-navbar__menu-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <User size={14} className="top-navbar__menu-icon" />
                <span>My Profile</span>
              </Link>
              <Link
                to="/settings"
                className="top-navbar__menu-item"
                role="menuitem"
                onClick={() => setDropdownOpen(false)}
              >
                <Settings size={14} className="top-navbar__menu-icon" />
                <span>Settings</span>
              </Link>
              <div className="top-navbar__menu-divider" role="separator" />
              <button
                className="top-navbar__menu-item top-navbar__menu-item--danger"
                role="menuitem"
                type="button"
                onClick={() => {
                  setDropdownOpen(false)
                  alert('Logging out...')
                }}
              >
                <LogOut size={14} className="top-navbar__menu-icon" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
