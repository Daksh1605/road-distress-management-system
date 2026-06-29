import {
  Milestone,
  Compass,
  Zap,
  Clock,
  Coins,
  FileText,
  UserCheck,
  CalendarDays,
} from 'lucide-react';
import type { RoadDistress } from '../../types/gis';
import './RoadDetailsPanel.css';

interface RoadDetailsPanelProps {
  selectedDistress: RoadDistress | null;
  isLoading?: boolean;
}

export default function RoadDetailsPanel({
  selectedDistress,
  isLoading = false,
}: RoadDetailsPanelProps) {
  const getSeverityBadgeClass = (severity: string) => {
    return `gis-details__badge gis-details__badge--severity-${severity}`;
  };

  const getStatusBadgeClass = (status: string) => {
    return `gis-details__badge gis-details__badge--status-${status}`;
  };

  const formatDistressType = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  // Map database maintenanceStatus to requested Repair Status Badges
  const getRepairStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'scheduled':
        return 'Assigned';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return 'Pending';
    }
  };

  const getRepairStatusClass = (status: string) => {
    switch (status) {
      case 'pending':
        return 'pending';
      case 'scheduled':
        return 'assigned';
      case 'in_progress':
        return 'in-progress';
      case 'completed':
        return 'completed';
      default:
        return 'pending';
    }
  };

  // Render loading skeleton
  if (isLoading) {
    return (
      <article className="gis-details gis-details--loading" aria-label="Loading details">
        <header className="gis-details__header">
          <div className="gis-details__skeleton-header-icon shimmer" />
          <div className="gis-details__skeleton-title shimmer" />
        </header>

        <div className="gis-details__body">
          {/* Stats grid skeletons */}
          <div className="gis-details__stats-grid">
            {[1, 2, 3].map((i) => (
              <div key={i} className="gis-details__skeleton-stat-card shimmer" />
            ))}
          </div>

          {/* Details list skeletons */}
          <div className="gis-details__meta-section">
            <div className="gis-details__meta-grid">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <div key={i} className="gis-details__skeleton-meta-item">
                  <div className="gis-details__skeleton-meta-lbl shimmer" />
                  <div className="gis-details__skeleton-meta-val shimmer" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <footer className="gis-details__actions">
          {[1, 2, 3].map((i) => (
            <div key={i} className="gis-details__skeleton-btn shimmer" />
          ))}
        </footer>
      </article>
    );
  }

  if (!selectedDistress) {
    return (
      <article className="gis-details gis-details--empty" aria-label="Road Distress Details">
        <div className="gis-details__empty-content">
          <div className="gis-details__empty-icon-wrapper">
            <Compass className="gis-details__empty-icon" size={32} />
          </div>
          <h3 className="gis-details__empty-title">Selected Road Distress</h3>
          <p className="gis-details__empty-subtitle">
            Select a distress marker on the map to view details
          </p>
        </div>
      </article>
    );
  }

  return (
    <article className="gis-details" aria-labelledby="details-title">
      <header className="gis-details__header">
        <div className="gis-details__header-title-group">
          <Milestone className="gis-details__header-icon" size={20} />
          <h3 id="details-title" className="gis-details__title">
            Selected Road Distress
          </h3>
        </div>
        <span className={getSeverityBadgeClass(selectedDistress.severity)}>
          {selectedDistress.severity.toUpperCase()}
        </span>
      </header>

      <div className="gis-details__body">
        {/* Quick Statistics Grid */}
        <section className="gis-details__stats-grid" aria-label="Quick Statistics">
          <div className="gis-details__stat-card">
            <div className="gis-details__stat-header">
              <Coins size={14} className="gis-details__stat-icon text-amber" />
              <span className="gis-details__stat-lbl">Estimated Cost</span>
            </div>
            <span className="gis-details__stat-val">{selectedDistress.estimatedRepairCost}</span>
          </div>

          <div className="gis-details__stat-card">
            <div className="gis-details__stat-header">
              <Clock size={14} className="gis-details__stat-icon text-blue" />
              <span className="gis-details__stat-lbl">Repair Duration</span>
            </div>
            <span className="gis-details__stat-val">{selectedDistress.estimatedRepairTime}</span>
          </div>

          <div className="gis-details__stat-card">
            <div className="gis-details__stat-header">
              <Zap size={14} className="gis-details__stat-icon text-violet" />
              <span className="gis-details__stat-lbl">Priority Score</span>
            </div>
            <span className="gis-details__stat-val">{selectedDistress.priorityScore}</span>
          </div>
        </section>

        {/* Detailed Metadata Grid */}
        <section className="gis-details__meta-section" aria-label="Distress Parameters">
          <div className="gis-details__meta-grid">
            {/* Distress ID */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Distress ID</span>
              <span className="gis-details__meta-val font-mono">{selectedDistress.id}</span>
            </div>

            {/* Road ID */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Road ID</span>
              <span className="gis-details__meta-val font-mono">{selectedDistress.roadId}</span>
            </div>

            {/* Road Name */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Road Name</span>
              <span className="gis-details__meta-val">{selectedDistress.roadName}</span>
            </div>

            {/* State */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">State</span>
              <span className="gis-details__meta-val">{selectedDistress.state}</span>
            </div>

            {/* District */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">District</span>
              <span className="gis-details__meta-val">{selectedDistress.district}</span>
            </div>

            {/* Coordinates */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Latitude</span>
              <span className="gis-details__meta-val font-mono">
                {selectedDistress.coordinates[0].toFixed(4)}° N
              </span>
            </div>

            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Longitude</span>
              <span className="gis-details__meta-val font-mono">
                {selectedDistress.coordinates[1].toFixed(4)}° E
              </span>
            </div>

            {/* Distress Type */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Distress Type</span>
              <span className="gis-details__meta-val">
                {formatDistressType(selectedDistress.distressType)}
              </span>
            </div>

            {/* Confidence Score */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Confidence Score</span>
              <span className="gis-details__meta-val highlight-violet">
                {selectedDistress.confidence}%
              </span>
            </div>

            {/* Dates */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Detection Date</span>
              <span className="gis-details__meta-val">
                {new Date(selectedDistress.detectionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Last Updated</span>
              <span className="gis-details__meta-val">
                {new Date(selectedDistress.lastInspectionDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            </div>

            {/* Assigned Team */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Assigned Team</span>
              <span className="gis-details__meta-val">
                {selectedDistress.assignedTeam === 'Not Assigned' ? (
                  <span className="text-muted italic">{selectedDistress.assignedTeam}</span>
                ) : (
                  <span>{selectedDistress.assignedTeam}</span>
                )}
              </span>
            </div>

            {/* Repair Status */}
            <div className="gis-details__meta-item">
              <span className="gis-details__meta-lbl">Repair Status</span>
              <span className="gis-details__meta-val">
                <span className={getStatusBadgeClass(getRepairStatusClass(selectedDistress.maintenanceStatus))}>
                  {getRepairStatusLabel(selectedDistress.maintenanceStatus)}
                </span>
              </span>
            </div>
          </div>
        </section>
      </div>

      <footer className="gis-details__actions">
        <button className="gis-details__btn-action gis-details__btn-action--secondary" type="button">
          <FileText size={14} />
          <span>View Full Report</span>
        </button>
        <button className="gis-details__btn-action gis-details__btn-action--outline" type="button">
          <UserCheck size={14} />
          <span>Assign Team</span>
        </button>
        <button className="gis-details__btn-action gis-details__btn-action--primary" type="button">
          <CalendarDays size={14} />
          <span>Schedule Repair</span>
        </button>
      </footer>
    </article>
  );
}
