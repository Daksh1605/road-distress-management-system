import { Milestone, Compass, FileText, ExternalLink } from 'lucide-react';
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
    return `status-pill badge-${severity.toLowerCase()}`;
  };

  const formatDistressType = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  // Google Maps helper
  const handleOpenGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
  };

  if (isLoading) {
    return (
      <article className="gis-details gis-details--loading" aria-label="Loading details">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px' }}>
          <div className="gis-details__skeleton-title shimmer" style={{ height: '24px', width: '60%' }} />
          <div className="gis-details__skeleton-stat-card shimmer" style={{ height: '140px', borderRadius: '12px' }} />
          <div className="gis-details__skeleton-meta-item shimmer" style={{ height: '16px', width: '80%' }} />
          <div className="gis-details__skeleton-meta-item shimmer" style={{ height: '16px', width: '40%' }} />
        </div>
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

  const recommendationText = selectedDistress.distressType === 'pothole'
    ? 'Pothole asphalt sealing & compaction'
    : 'Crack expansion joint injection filling';

  return (
    <article className="gis-details" aria-labelledby="details-title">
      <header className="gis-details__header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginBottom: '14px' }}>
        <div className="gis-details__header-title-group" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Milestone className="gis-details__header-icon" size={18} style={{ color: 'var(--accent-blue)' }} />
          <h3 id="details-title" className="gis-details__title" style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-text)' }}>
            Selected Distress Details
          </h3>
        </div>
        <span className={getSeverityBadgeClass(selectedDistress.severity)}>
          {selectedDistress.severity.toUpperCase()}
        </span>
      </header>

      <div className="gis-details__body-grid" style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', marginBottom: '16px' }}>
        {/* Left Side Thumbnail */}
        <div className="gis-details-thumb-wrapper" style={{ height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--card-border)', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <img 
            src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=150" 
            alt="defect visual clip" 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        </div>

        {/* Right Side Key Metadata info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Road ID</span>
            <span className="font-mono font-bold">{selectedDistress.roadId}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>GPS Coordinates</span>
            <span className="font-mono font-semibold" style={{ fontSize: '12px' }}>
              {selectedDistress.coordinates[0].toFixed(4)}° N, {selectedDistress.coordinates[1].toFixed(4)}° E
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Confidence</span>
            <span className="font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>{selectedDistress.confidence}%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Detection Time</span>
            <span>
              {new Date(selectedDistress.detectionDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>
        </div>
      </div>

      {/* AI Recommendation & cost summaries */}
      <div style={{ background: 'var(--primary-bg)', padding: '12px 16px', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px', fontSize: '13px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>AI Recommendation</span>
          <span className="font-semibold text-capitalize" style={{ color: 'var(--primary-text)' }}>{formatDistressType(selectedDistress.distressType)} Repair</span>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--secondary-text)', fontStyle: 'italic', borderLeft: '2px solid var(--accent-blue)', paddingLeft: '8px' }}>
          {recommendationText}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '8px', marginTop: '4px' }}>
          <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Est. Repair Cost</span>
          <span className="font-mono font-bold" style={{ fontSize: '14px' }}>{selectedDistress.estimatedRepairCost}</span>
        </div>
      </div>

      {/* Bottom Actions Row */}
      <footer className="gis-details__actions" style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="btn-control" 
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'center', background: 'var(--primary-bg)' }}
          onClick={() => alert("Report generated successfully.")}
        >
          <FileText size={13} />
          <span>Generate Report</span>
        </button>
        <button 
          className="btn-control btn-control--capture" 
          style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'center', background: 'var(--primary-text)', color: '#FFF' }}
          onClick={() => handleOpenGoogleMaps(selectedDistress.coordinates[0], selectedDistress.coordinates[1])}
        >
          <ExternalLink size={13} />
          <span>Open in Google Maps</span>
        </button>
      </footer>
    </article>
  );
}
