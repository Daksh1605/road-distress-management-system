import { useState, type ComponentType } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Map,
  Radar,
  BarChart3,
  FileText,
  Wrench,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import './Sidebar.css'

// Interfaces for component props
interface LucideIconProps {
  size?: number | string
  className?: string
}

interface SidebarMenuItem {
  path: string
  label: string
  icon: ComponentType<LucideIconProps>
}

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const menuItems: SidebarMenuItem[] = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      path: '/gis-map',
      label: 'GIS Map',
      icon: Map,
    },
    {
      path: '/live-monitoring',
      label: 'Live Monitoring',
      icon: Radar,
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: BarChart3,
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: FileText,
    },
    {
      path: '/maintenance',
      label: 'Maintenance',
      icon: Wrench,
    },
    {
      path: '/settings',
      label: 'Settings',
      icon: Settings,
    },
  ]

  const toggleSidebar = () => {
    setIsCollapsed((prev) => !prev)
  }

  return (
    <aside className={`sidebar ${isCollapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Top Header Section */}
      <div className="sidebar__header">
        <div className="sidebar__brand">
          {!isCollapsed ? (
            <span className="sidebar__brand-full" title="Road Distress Management System">
              Road Distress MS
            </span>
          ) : (
            <span className="sidebar__brand-short" title="Road Distress Management System">
              RDMS
            </span>
          )}
        </div>
        <button
          className="sidebar__toggle-btn"
          onClick={toggleSidebar}
          type="button"
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Main Navigation Section */}
      <nav className="sidebar__nav" aria-label="Main Navigation">
        <ul className="sidebar__nav-list">
          {menuItems.map((item) => (
            <li key={item.path} className="sidebar__nav-item">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `sidebar__nav-link ${isActive ? 'sidebar__nav-link--active' : ''}`
                }
                title={isCollapsed ? item.label : undefined}
              >
                <item.icon className="sidebar__nav-icon" size={20} />
                {!isCollapsed && <span className="sidebar__nav-label">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Bottom User Profile Section */}
      <div className="sidebar__footer">
        <div className="sidebar__profile">
          <div className="sidebar__profile-avatar" aria-hidden="true">
            DA
          </div>
          {!isCollapsed && (
            <div className="sidebar__profile-info">
              <span className="sidebar__profile-name">Daksh Agarwal</span>
              <span className="sidebar__profile-role">Admin Engineer</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
