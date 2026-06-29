import { useState } from 'react';
import { Map, Layers, ZoomIn, ZoomOut, Compass, X, ShieldAlert } from 'lucide-react';
import type { RoadDistress } from '../../types/gis';
import './GISMapContainer.css';

interface GISMapContainerProps {
  distresses: RoadDistress[];
  selectedDistress: RoadDistress | null;
  onSelect: (distress: RoadDistress | null) => void;
  isLoading?: boolean;
}

export default function GISMapContainer({
  distresses,
  selectedDistress,
  onSelect,
  isLoading = false,
}: GISMapContainerProps) {
  const [zoom, setZoom] = useState<number>(1.0);
  const [hoveredDistress, setHoveredDistress] = useState<RoadDistress | null>(null);

  // Zoom controls (bound between 0.8x and 2.0x)
  const handleZoomIn = () => {
    setZoom((prev) => Math.min(2.0, Number((prev + 0.2).toFixed(1))));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.8, Number((prev - 0.2).toFixed(1))));
  };

  // Projected coordinate helper updated to cover India coordinates (Lat 8.0 - 30.0, Lng 68.0 - 88.0)
  const projectCoordinates = (coords: [number, number]): { x: number; y: number } => {
    const [lat, lng] = coords;
    const minLat = 8.0;
    const maxLat = 30.0;
    const minLng = 68.0;
    const maxLng = 88.0;

    const x = ((lng - minLng) / (maxLng - minLng)) * 660 + 70;
    const y = 450 - ((lat - minLat) / (maxLat - minLat)) * 310 - 70;

    return { x, y };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return '#ef4444'; // Red
      case 'high':
        return '#f97316'; // Orange
      case 'medium':
        return '#eab308'; // Yellow
      case 'low':
        return '#3b82f6'; // Blue
      default:
        return '#a855f7';
    }
  };

  const formatDistressType = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  // Calculate counts for Active Filter Summary Bar
  const summaryCounts = distresses.reduce(
    (acc, d) => {
      acc.total += 1;
      if (d.severity in acc.severities) {
        acc.severities[d.severity as keyof typeof acc.severities] += 1;
      }
      return acc;
    },
    {
      total: 0,
      severities: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0,
      },
    }
  );

  return (
    <section className="gis-map-container" aria-labelledby="map-title">
      {/* Header bar */}
      <header className="gis-map-container__header">
        <div className="gis-map-container__title-wrapper">
          <Map className="gis-map-container__icon" size={20} />
          <h2 id="map-title" className="gis-map-container__title">
            Road Distress Map
          </h2>
        </div>
        <div className="gis-map-container__actions">
          <span className="gis-map-container__zoom-level">
            Zoom: {Math.round(zoom * 100)}%
          </span>
          <button className="gis-map-container__action-btn" title="Map Layers" type="button">
            <Layers size={16} />
          </button>
          <button
            className="gis-map-container__action-btn"
            title="Zoom In"
            type="button"
            onClick={handleZoomIn}
            disabled={zoom >= 2.0 || isLoading}
          >
            <ZoomIn size={16} />
          </button>
          <button
            className="gis-map-container__action-btn"
            title="Zoom Out"
            type="button"
            onClick={handleZoomOut}
            disabled={zoom <= 0.8 || isLoading}
          >
            <ZoomOut size={16} />
          </button>
        </div>
      </header>

      {/* Active Filter Summary Bar */}
      <div className="gis-map-container__filter-summary">
        <div className="gis-map-container__summary-pill">
          <span className="gis-map-container__summary-dot" />
          <span className="gis-map-container__summary-text">
            Total: <strong>{isLoading ? '...' : summaryCounts.total}</strong>
          </span>
        </div>
        <div className="gis-map-container__summary-pill gis-map-container__summary-pill--critical">
          <span className="gis-map-container__summary-dot" />
          <span className="gis-map-container__summary-text">
            Critical: <strong>{isLoading ? '...' : summaryCounts.severities.critical}</strong>
          </span>
        </div>
        <div className="gis-map-container__summary-pill gis-map-container__summary-pill--high">
          <span className="gis-map-container__summary-dot" />
          <span className="gis-map-container__summary-text">
            High: <strong>{isLoading ? '...' : summaryCounts.severities.high}</strong>
          </span>
        </div>
        <div className="gis-map-container__summary-pill gis-map-container__summary-pill--medium">
          <span className="gis-map-container__summary-dot" />
          <span className="gis-map-container__summary-text">
            Medium: <strong>{isLoading ? '...' : summaryCounts.severities.medium}</strong>
          </span>
        </div>
        <div className="gis-map-container__summary-pill gis-map-container__summary-pill--low">
          <span className="gis-map-container__summary-dot" />
          <span className="gis-map-container__summary-text">
            Low: <strong>{isLoading ? '...' : summaryCounts.severities.low}</strong>
          </span>
        </div>
      </div>

      <div className="gis-map-container__canvas-wrapper">
        {/* Shimmer loading skeleton overlay */}
        {isLoading && (
          <div className="gis-map-container__loading-overlay" aria-live="polite">
            <div className="gis-map-container__loading-spinner" />
            <span className="gis-map-container__loading-text shimmer-text">Loading Geospatial Data...</span>
          </div>
        )}

        {/* Modern Stylized SVG Mock Map */}
        <svg
          className={`gis-map-container__canvas ${isLoading ? 'gis-map-container__canvas--loading' : ''}`}
          viewBox="0 0 800 450"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Grid Pattern */}
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="rgba(148, 163, 184, 0.04)"
                strokeWidth="1"
              />
            </pattern>
            {/* Glow Filter for Selected Marker */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid Background */}
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Map Content scaled dynamically based on internal Zoom State */}
          <g
            transform={`scale(${zoom})`}
            style={{
              transformOrigin: '400px 225px',
              transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            {/* Stylized Topography/Borders */}
            <path
              d="M 50 100 Q 200 80 400 120 T 750 90"
              fill="none"
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth="2"
              strokeDasharray="4 8"
            />
            <path
              d="M 100 380 Q 250 340 450 390 T 700 350"
              fill="none"
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth="2"
              strokeDasharray="4 8"
            />
            <path
              d="M 120 50 Q 80 200 150 350 T 200 420"
              fill="none"
              stroke="rgba(148, 163, 184, 0.08)"
              strokeWidth="2"
              strokeDasharray="4 8"
            />

            {/* Major Roads */}
            <g className="gis-map-container__roads">
              {/* NH-48 */}
              <path
                d="M 50 200 C 200 180, 300 280, 500 240 S 650 160, 750 180"
                fill="none"
                stroke="rgba(148, 163, 184, 0.15)"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <path
                d="M 50 200 C 200 180, 300 280, 500 240 S 650 160, 750 180"
                fill="none"
                stroke="#0f172a"
                strokeWidth="2"
                strokeLinecap="round"
                strokeDasharray="5 5"
              />

              {/* SH-17 */}
              <path
                d="M 150 50 L 650 400"
                fill="none"
                stroke="rgba(148, 163, 184, 0.12)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* NH-4 */}
              <path
                d="M 600 80 Q 550 200 620 380"
                fill="none"
                stroke="rgba(148, 163, 184, 0.12)"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>

            {/* Stylized Road Labels / shields */}
            <g className="gis-map-container__road-labels">
              {/* NH-48 Shield */}
              <rect x="75" y="172" width="40" height="16" rx="4" fill="#1e293b" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
              <text x="95" y="184" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
                NH-48
              </text>

              {/* SH-17 Label */}
              <rect x="545" y="325" width="40" height="16" rx="4" fill="#1e293b" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" transform="rotate(30 565 333)" />
              <text x="565" y="337" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle" transform="rotate(30 565 337)">
                SH-17
              </text>

              {/* NH-4 Shield */}
              <rect x="555" y="222" width="36" height="16" rx="4" fill="#1e293b" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" />
              <text x="573" y="234" fill="#cbd5e1" fontSize="9" fontWeight="bold" textAnchor="middle">
                NH-4
              </text>
            </g>

            {/* Distress Markers (hidden while loading) */}
            {!isLoading && (
              <g className="gis-map-container__markers">
                {distresses.map((distress) => {
                  const { x, y } = projectCoordinates(distress.coordinates);
                  const color = getSeverityColor(distress.severity);
                  const isSelected = selectedDistress?.id === distress.id;
                  const isCritical = distress.severity === 'critical';
                  const isHigh = distress.severity === 'high';

                  // Assign different pulse speeds based on severity
                  let pulseClass = '';
                  if (isCritical) {
                    pulseClass = 'gis-map-container__pulse-ring--critical';
                  } else if (isHigh) {
                    pulseClass = 'gis-map-container__pulse-ring--high';
                  }

                  return (
                    <g
                      key={distress.id}
                      className={`gis-map-container__marker-group ${
                        isSelected ? 'gis-map-container__marker-group--selected' : ''
                      }`}
                      onClick={() => onSelect(distress)}
                      onMouseEnter={() => setHoveredDistress(distress)}
                      onMouseLeave={() => setHoveredDistress(null)}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Selected Outer Ring */}
                      {isSelected && (
                        <circle
                          cx={x}
                          cy={y}
                          r="16"
                          fill="none"
                          stroke={color}
                          strokeWidth="2"
                          opacity="0.6"
                          className="gis-map-container__ping-ring"
                        />
                      )}

                      {/* Marker Pulse Ring */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '10' : '6'}
                        fill={color}
                        opacity={isSelected ? '0.3' : '0.15'}
                        className={`gis-map-container__pulse-ring ${pulseClass}`}
                      />

                      {/* Marker Center */}
                      <circle
                        cx={x}
                        cy={y}
                        r={isSelected ? '6' : '4'}
                        fill={color}
                        stroke="#0f172a"
                        strokeWidth="1.5"
                        filter={isSelected ? 'url(#glow)' : undefined}
                      />
                    </g>
                  );
                })}
              </g>
            )}
          </g>
        </svg>

        {/* Hover Tooltip Overlay (only active when not loading) */}
        {!isLoading && hoveredDistress && (() => {
          const { x, y } = projectCoordinates(hoveredDistress.coordinates);
          const scaleX = (x - 400) * zoom + 400;
          const scaleY = (y - 225) * zoom + 225;

          const pctLeft = (scaleX / 800) * 100;
          const pctTop = (scaleY / 450) * 100;

          return (
            <div
              className="gis-map-container__tooltip"
              style={{
                left: `${pctLeft}%`,
                top: `${pctTop}%`,
              }}
            >
              <div className="gis-map-container__tooltip-row">
                <span className="gis-map-container__tooltip-id">{hoveredDistress.id}</span>
                <span
                  className="gis-map-container__tooltip-severity"
                  style={{ color: getSeverityColor(hoveredDistress.severity) }}
                >
                  {hoveredDistress.severity.toUpperCase()}
                </span>
              </div>
              <div className="gis-map-container__tooltip-row">
                <span className="gis-map-container__tooltip-type">
                  {formatDistressType(hoveredDistress.distressType)}
                </span>
                <span className="gis-map-container__tooltip-conf">
                  {hoveredDistress.confidence}% Conf.
                </span>
              </div>
              <div className="gis-map-container__tooltip-arrow" />
            </div>
          );
        })()}

        {/* Floating Compass */}
        <div className="gis-map-container__compass">
          <Compass size={24} />
        </div>

        {/* Marker Count Badge (Top-Right of Map) */}
        {!isLoading && (
          <div className="gis-map-container__count-badge">
            <span className="gis-map-container__count-badge-val">{distresses.length}</span>
            <span className="gis-map-container__count-badge-lbl">Visible</span>
          </div>
        )}

        {/* Floating Selected Marker Info Card */}
        {!isLoading && selectedDistress && (
          <div className="gis-map-container__floating-card">
            <header className="gis-map-container__floating-card-header">
              <div className="gis-map-container__floating-card-title-group">
                <ShieldAlert
                  size={15}
                  style={{ color: getSeverityColor(selectedDistress.severity) }}
                />
                <span className="gis-map-container__floating-card-title">
                  {selectedDistress.id}
                </span>
              </div>
              <button
                className="gis-map-container__floating-card-close"
                type="button"
                onClick={() => onSelect(null)}
                aria-label="Close detail card"
              >
                <X size={14} />
              </button>
            </header>
            <div className="gis-map-container__floating-card-body">
              <div className="gis-map-container__floating-card-row">
                <span className="gis-map-container__floating-card-lbl">Location:</span>
                <span className="gis-map-container__floating-card-val truncate">
                  {selectedDistress.location}
                </span>
              </div>
              <div className="gis-map-container__floating-card-row">
                <span className="gis-map-container__floating-card-lbl">Type:</span>
                <span className="gis-map-container__floating-card-val">
                  {formatDistressType(selectedDistress.distressType)}
                </span>
              </div>
              <div className="gis-map-container__floating-card-row">
                <span className="gis-map-container__floating-card-lbl">Severity:</span>
                <span
                  className="gis-map-container__floating-card-val font-semibold"
                  style={{ color: getSeverityColor(selectedDistress.severity) }}
                >
                  {selectedDistress.severity.toUpperCase()}
                </span>
              </div>
              <div className="gis-map-container__floating-card-row">
                <span className="gis-map-container__floating-card-lbl">Confidence:</span>
                <span className="gis-map-container__floating-card-val">
                  {selectedDistress.confidence}%
                </span>
              </div>
              <div className="gis-map-container__floating-card-row">
                <span className="gis-map-container__floating-card-lbl">Last Updated:</span>
                <span className="gis-map-container__floating-card-val">
                  {selectedDistress.lastInspectionDate}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Centered Placeholder Text (Only overlay when map has no items and not loading) */}
        {!isLoading && distresses.length === 0 && (
          <div className="gis-map-container__overlay" aria-hidden="true">
            <p className="gis-map-container__placeholder-text">
              Interactive GIS Map will be displayed here
            </p>
            <span className="gis-map-container__placeholder-subtext">
              No distress data matches the current filters.
            </span>
          </div>
        )}
      </div>

      {/* Footer / Legends */}
      <footer className="gis-map-container__footer">
        <div className="gis-map-container__legend">
          <span className="gis-map-container__legend-title">Legend:</span>
          <div className="gis-map-container__legend-item">
            <span className="gis-map-container__legend-dot gis-map-container__legend-dot--critical" />
            <span>Critical</span>
          </div>
          <div className="gis-map-container__legend-item">
            <span className="gis-map-container__legend-dot gis-map-container__legend-dot--high" />
            <span>High</span>
          </div>
          <div className="gis-map-container__legend-item">
            <span className="gis-map-container__legend-dot gis-map-container__legend-dot--medium" />
            <span>Medium</span>
          </div>
          <div className="gis-map-container__legend-item">
            <span className="gis-map-container__legend-dot gis-map-container__legend-dot--low" />
            <span>Low</span>
          </div>
        </div>
        <div className="gis-map-container__scale">Scale 1 : 250,000</div>
      </footer>
    </section>
  );
}
