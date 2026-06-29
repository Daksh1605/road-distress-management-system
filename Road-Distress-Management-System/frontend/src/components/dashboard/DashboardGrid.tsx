import { useEffect, useState, useRef } from 'react'
import apiService from '../../services/api/apiService'
import type { RoadDistressResponse } from '../../services/api/apiService'
import DetectionTrendChart from './DetectionTrendChart'
import DistressDistributionChart from './DistressDistributionChart'
import KPISection from './KPISection'
import { Tv, Play, Square, Camera, Map, FileText, Compass } from 'lucide-react'
import './DashboardGrid.css'

interface ActiveOverlay {
  type: string;
  confidence: number;
  severity: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function DashboardGrid() {
  const [distresses, setDistresses] = useState<RoadDistressResponse[]>([]);
  const [reportsCount, setReportsCount] = useState<number>(0);
  
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Simulated Live Camera State
  const [isCameraActive, setIsCameraActive] = useState(true);
  const [fps, setFps] = useState(30);
  const [elapsedSeconds, setElapsedSeconds] = useState(140);
  const [frameCount, setFrameCount] = useState(4200);

  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>({
    type: 'Pothole',
    confidence: 94,
    severity: 'critical',
    x: 40,
    y: 35,
    w: 120,
    h: 80
  });


  const frameIntervalRef = useRef<any>(null);
  const detectionIntervalRef = useRef<any>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [distressLogs, reportsList] = await Promise.all([
        apiService.getDistressLogs(0, 200),
        apiService.getReports(0, 200)
      ]);
      setDistresses(distressLogs);
      setReportsCount(reportsList.length);


    } catch (err: any) {
      console.error(err);
      setError('Failed to fetch dashboard data. Verify that the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Camera telemetries simulator
  useEffect(() => {
    if (isCameraActive) {
      frameIntervalRef.current = setInterval(() => {
        setFrameCount(prev => prev + 3);
        setElapsedSeconds(prev => prev + 1);
        // Slight fps variations
        setFps(Math.floor(29 + Math.random() * 2));
      }, 100);

      detectionIntervalRef.current = setInterval(() => {
        const types = ['Pothole', 'Crack', 'Ravelling', 'Rutting'];
        const severities = ['critical', 'high', 'medium', 'low'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        const conf = Math.floor(82 + Math.random() * 16);

        setActiveOverlay({
          type: randomType,
          confidence: conf,
          severity: randomSeverity,
          x: Math.floor(20 + Math.random() * 50),
          y: Math.floor(20 + Math.random() * 40),
          w: Math.floor(80 + Math.random() * 100),
          h: Math.floor(60 + Math.random() * 80)
        });

        setTimeout(() => {
          setActiveOverlay(null);
        }, 1800);

      }, 4000);
    } else {
      clearInterval(frameIntervalRef.current);
      clearInterval(detectionIntervalRef.current);
      setActiveOverlay(null);
    }

    return () => {
      clearInterval(frameIntervalRef.current);
      clearInterval(detectionIntervalRef.current);
    };
  }, [isCameraActive]);

  const handleCapture = () => {
    alert("Live frame captured & saved to system disk directory uploads/screenshots.");
  };

  const handleReplay = () => {
    setFrameCount(0);
    setElapsedSeconds(0);
    setIsCameraActive(true);
  };

  const handleGenerateReport = async (distressId: number) => {
    try {
      await apiService.generatePDFReport(distressId);
      alert(`Report generated successfully for Road Distress #${distressId}.`);
    } catch (err) {
      alert("Failed to export PDF report.");
    }
  };

  if (isLoading) {
    return (
      <section className="dashboard-page dashboard-page--loading" aria-label="Loading dashboard">
        <div className="dashboard-page__spinner-container">
          <div className="dashboard-page__spinner" />
          <p>Connecting to backend API services...</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="dashboard-page dashboard-page--error" aria-label="Dashboard connection error">
        <div className="dashboard-page__error-container">
          <div className="dashboard-page__error-icon">⚠️</div>
          <h2>Service Connection Failure</h2>
          <p>{error}</p>
          <button className="dashboard-page__retry-btn" onClick={fetchDashboardData}>
            Retry Connection
          </button>
        </div>
      </section>
    );
  }

  // Pre-calculate aggregated numbers for KPIs
  const distressCount = distresses.length;
  const criticalCount = distresses.filter(
    (d) => d.severity.toLowerCase() === 'high' || d.severity.toLowerCase() === 'critical'
  ).length;
  const pendingCount = distresses.filter(
    (d) => d.status.toLowerCase() === 'detected' || d.status.toLowerCase() === 'scheduled' || d.status.toLowerCase() === 'pending'
  ).length;

  // Format elapsed time as MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <section className="dashboard-page" aria-label="Dashboard overview">
      <header className="dashboard-page__header">
        <h1 className="bold-page-title">Fleet Operations Control</h1>
        <p className="light-secondary-text">Redesigned commercial SaaS portal tracking road conditions and maintenance plans.</p>
      </header>

      {/* Row 1: 8 KPI cards */}
      <div className="dash-row">
        <KPISection 
          distressCount={distressCount}
          criticalCount={criticalCount}
          pendingCount={pendingCount}
          reportsCount={reportsCount}
        />
      </div>


      {/* Row 2: Live feed (Left 40%), GIS map (Center 40%), Recent logs feed (Right 20%) */}
      <div className="dash-layout-grid">
        {/* Left Column: Live camera feed simulation */}
        <div className="premium-card live-cam-card">
          <div className="card-header-with-actions">
            <div className="card-header-title">
              <Tv size={16} className="text-accent" style={{ color: 'var(--accent-blue)' }} />
              <h2 className="medium-section-title">Surveillance Stream CAM-04</h2>
            </div>
            <span className="live-cam-badge">
              <span className="live-dot" />
              LIVE
            </span>
          </div>

          <div className="live-cam-viewport">
            <div className="live-cam-simulation-scene">
              {/* Scanlines grid HUD */}
              <div className="hud-telemetry">
                <span>GPS: 18.734, 73.421</span>
                <span>RES: 1080p &bull; {fps} FPS &bull; Frame: {frameCount}</span>
                <span>Elapsed: {formatTime(elapsedSeconds)}</span>
              </div>


              {/* Bounding box display */}
              {isCameraActive && activeOverlay && (
                <div 
                  className={`live-cam-bbox border-${activeOverlay.severity}`}
                  style={{
                    left: `${activeOverlay.x}%`,
                    top: `${activeOverlay.y}%`,
                    width: `${activeOverlay.w}px`,
                    height: `${activeOverlay.h}px`
                  }}
                >
                  <span className={`live-cam-bbox-tag bg-${activeOverlay.severity}`}>
                    {activeOverlay.type} &bull; {activeOverlay.confidence}%
                  </span>
                </div>
              )}

              {/* Grid guide */}
              <div className="hud-grid-lines" />
            </div>
          </div>

          <div className="live-cam-controls">
            <div className="controls-group">
              {isCameraActive ? (
                <button className="btn-control btn-control--stop" onClick={() => setIsCameraActive(false)}>
                  <Square size={12} />
                  <span>Pause</span>
                </button>
              ) : (
                <button className="btn-control btn-control--start" onClick={() => setIsCameraActive(true)}>
                  <Play size={12} />
                  <span>Resume</span>
                </button>
              )}
              <button className="btn-control" onClick={handleReplay}>
                Replay
              </button>
            </div>
            <button className="btn-control btn-control--capture" onClick={handleCapture}>
              <Camera size={12} />
              <span>Capture Frame</span>
            </button>
          </div>
        </div>

        {/* Center Column: GIS Map */}
        <div className="premium-card gis-map-card">
          <div className="card-header-with-actions">
            <div className="card-header-title">
              <Map size={16} />
              <h2 className="medium-section-title">Operations Map</h2>
            </div>
            <span className="small-caption font-bold">NH-48 Corridor</span>
          </div>
          <div className="gis-map-inner-wrapper">
            {/* Direct reuse of interactive GIS vector component */}
            <svg viewBox="0 0 800 450" className="gis-svg-projection">
              <rect width="100%" height="100%" fill="#FAFAFA" />
              <path d="M 50 200 Q 300 280, 500 240 T 750 180" fill="none" stroke="#E2E8F0" strokeWidth="6" strokeLinecap="round" />
              <path d="M 50 200 Q 300 280, 500 240 T 750 180" fill="none" stroke="#4F8EF7" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 4" />
              {/* Cluster items */}
              <circle cx="280" cy="235" r="14" fill="rgba(239, 83, 80, 0.2)" />
              <circle cx="280" cy="235" r="5" fill="#EF5350" />
              
              <circle cx="480" cy="245" r="14" fill="rgba(245, 158, 11, 0.2)" />
              <circle cx="480" cy="245" r="5" fill="#F59E0B" />

              <circle cx="150" cy="180" r="14" fill="rgba(67, 160, 71, 0.2)" />
              <circle cx="150" cy="180" r="5" fill="#43A047" />
            </svg>
            <div className="floating-compass">
              <Compass size={20} />
            </div>
          </div>
        </div>

        {/* Right Column: Recent Detections List */}
        <div className="premium-card recent-detections-list-card">
          <h2 className="medium-section-title card-title-pad">Recent Feed</h2>
          <div className="scrollable-detections-feed">
            {distresses.slice(0, 5).map((d) => (
              <div key={d.id} className="detection-feed-item">
                <div className="feed-item-top">
                  <span className="feed-item-id font-mono font-semibold">RD-{d.id}</span>
                  <span className={`severity-tag severity-tag--${d.severity.toLowerCase()}`}>
                    {d.severity}
                  </span>
                </div>
                <div className="feed-item-middle">
                  <span className="feed-item-type">{d.distress_type.replace('_', ' ')}</span>
                  <span className="feed-item-conf font-mono">{Math.round(d.confidence_score * 100 || 88)}% confidence</span>
                </div>
                <div className="feed-item-footer">
                  <span className="feed-item-date">{new Date(d.detected_at).toLocaleTimeString('en-US', { hour12: false })}</span>
                  <button className="btn-view-feed" onClick={() => alert(`Details: distress ID RD-${d.id}`)}>
                    Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Circular analytics pipelines & standard charts */}
      <div className="dash-analytics-grid">
        <div className="premium-card">
          <h2 className="medium-section-title">Distress Types Summary</h2>
          <DistressDistributionChart data={distresses} />
        </div>

        <div className="premium-card">
          <h2 className="medium-section-title">Weekly Inspection Log Count</h2>
          <DetectionTrendChart data={distresses} />
        </div>

        {/* Circular progress indicators */}
        <div className="premium-card circular-pipelines-card">
          <h2 className="medium-section-title">Pipeline Execution Log</h2>
          <div className="pipelines-container">
            <div className="pipeline-circle-item">
              <div className="circle-svg-wrapper">
                <svg width="70" height="70" viewBox="0 0 36 36">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EEE" strokeWidth="2.5" />
                  <path className="circle-fill" strokeDasharray="84, 100" stroke="var(--success)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" />
                </svg>
                <div className="circle-text font-mono font-bold">84%</div>
              </div>
              <span className="circle-label">Completed</span>
            </div>

            <div className="pipeline-circle-item">
              <div className="circle-svg-wrapper">
                <svg width="70" height="70" viewBox="0 0 36 36">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EEE" strokeWidth="2.5" />
                  <path className="circle-fill" strokeDasharray="12, 100" stroke="var(--accent-blue)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" />
                </svg>
                <div className="circle-text font-mono font-bold">12%</div>
              </div>
              <span className="circle-label">Running</span>
            </div>

            <div className="pipeline-circle-item">
              <div className="circle-svg-wrapper">
                <svg width="70" height="70" viewBox="0 0 36 36">
                  <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#EEE" strokeWidth="2.5" />
                  <path className="circle-fill" strokeDasharray="4, 100" stroke="var(--warning)" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="2.5" />
                </svg>
                <div className="circle-text font-mono font-bold">4%</div>
              </div>
              <span className="circle-label">Queued</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Bottom Recommendation enterprise table */}
      <div className="premium-card recommendation-table-card">
        <div className="card-header-with-actions" style={{ paddingBottom: '16px' }}>
          <h2 className="medium-section-title">Automated AI Maintenance Recommendations</h2>
          <span className="small-caption font-bold">Active Repair Estimates</span>
        </div>
        <div className="table-responsive">
          <table className="enterprise-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Road ID</th>
                <th>Location</th>
                <th>GPS Location</th>
                <th>Severity</th>
                <th>AI Recommendation</th>
                <th>Est. Repair Cost</th>
                <th>Est. Repair Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {distresses.slice(0, 4).map((d) => (
                <tr key={d.id}>
                  <td>
                    <div className="table-thumbnail-wrapper">
                      {d.image_url ? (
                        <img src={d.image_url} alt="Distress visual" className="table-thumbnail" />
                      ) : (
                        <div className="table-thumbnail table-thumbnail--empty">No visual</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <span className="font-mono font-bold">RD-{d.id}</span>
                  </td>
                  <td>
                    <span className="truncate" style={{ maxWidth: '180px', display: 'inline-block' }}>Near Sector {d.id * 3} Corridor</span>
                  </td>
                  <td>
                    <span className="font-mono">{d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}</span>
                  </td>
                  <td>
                    <span className={`status-pill badge-${d.severity.toLowerCase()}`}>
                      {d.severity.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className="recommendation-text-lbl">
                      {d.distress_type === 'pothole' ? 'Pothole asphalt sealing & compaction' : 'Crack expansion joint injection filling'}
                    </span>
                  </td>
                  <td>
                    <span className="font-mono font-semibold">₹{d.distress_type === 'pothole' ? '45,000' : '85,000'}</span>
                  </td>
                  <td>
                    <span>{d.distress_type === 'pothole' ? '6 hours' : '2 days'}</span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button 
                        className="btn-report-run"
                        onClick={() => handleGenerateReport(d.id)}
                        title="Generate Report PDF"
                      >
                        <FileText size={13} />
                        <span>Generate Report</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
