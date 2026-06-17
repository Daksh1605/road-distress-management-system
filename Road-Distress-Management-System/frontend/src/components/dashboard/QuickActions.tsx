import type { ComponentType } from 'react'
import {
  Video,
  Image,
  Radar,
  FileText,
  Download,
  Map,
  Wrench,
  AlertTriangle,
} from 'lucide-react'
import './QuickActions.css'

// Props interface for Lucide icon components
interface IconProps {
  size?: number | string
  className?: string
}

// Interface describing each quick action structure
export interface ActionItem {
  id: string
  label: string
  icon: ComponentType<IconProps>
  onClick: () => void
  variant?: 'primary' | 'warning' | 'danger' | 'default'
}

// Props interface for the reusable ActionButton component
export interface ActionButtonProps {
  label: string
  icon: ComponentType<IconProps>
  onClick: () => void
  variant?: 'primary' | 'warning' | 'danger' | 'default'
}

// Reusable ActionButton component
export function ActionButton({
  label,
  icon: Icon,
  onClick,
  variant = 'default',
}: ActionButtonProps) {
  return (
    <button
      className={`quick-action-btn quick-action-btn--${variant}`}
      onClick={onClick}
      type="button"
      aria-label={label}
    >
      <div className="quick-action-btn__icon-wrapper">
        <Icon className="quick-action-btn__icon" size={20} />
      </div>
      <span className="quick-action-btn__label">{label}</span>
    </button>
  )
}

export default function QuickActions() {
  const actions: ActionItem[] = [
    {
      id: 'upload-video',
      label: 'Upload Video',
      icon: Video,
      onClick: () => alert('Upload Video trigger: select a distress recording MP4/AVI file.'),
      variant: 'primary',
    },
    {
      id: 'upload-images',
      label: 'Upload Images',
      icon: Image,
      onClick: () => alert('Upload Images trigger: upload photos of road anomalies.'),
      variant: 'primary',
    },
    {
      id: 'live-monitoring',
      label: 'Start Live Monitoring',
      icon: Radar,
      onClick: () => alert('Start Live Monitoring trigger: initiating connection to vehicle camera feeds.'),
      variant: 'warning',
    },
    {
      id: 'generate-report',
      label: 'Generate Report',
      icon: FileText,
      onClick: () => alert('Generate Report trigger: compiling monthly distress summary report PDF.'),
    },
    {
      id: 'export-data',
      label: 'Export Data',
      icon: Download,
      onClick: () => alert('Export Data trigger: exporting all records as CSV.'),
    },
    {
      id: 'open-gis',
      label: 'Open GIS Map',
      icon: Map,
      onClick: () => alert('Open GIS Map trigger: opening high-definition map view.'),
    },
    {
      id: 'schedule-repair',
      label: 'Schedule Repair',
      icon: Wrench,
      onClick: () => alert('Schedule Repair trigger: assigning crew dispatch in maintenance board.'),
    },
    {
      id: 'view-critical',
      label: 'View Critical Distresses',
      icon: AlertTriangle,
      onClick: () => alert('View Critical Distresses trigger: displaying priority-1 high severity incidents.'),
      variant: 'danger',
    },
  ]

  return (
    <div className="quick-actions-container">
      <div className="quick-actions-grid">
        {actions.map((action) => (
          <ActionButton
            key={action.id}
            label={action.label}
            icon={action.icon}
            onClick={action.onClick}
            variant={action.variant}
          />
        ))}
      </div>
    </div>
  )
}
