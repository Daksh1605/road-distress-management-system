import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Square, 
  Upload, 
  Maximize2, 
  Minimize2, 
  Radio, 
  AlertTriangle, 
  History, 
  Activity, 
  Check, 
  Tv,
  Loader2,
  Trash2,
  Video
} from 'lucide-react';
import './LiveMonitoringDashboard.css';
import RealTimeDetectionFeed from '../../components/monitoring/RealTimeDetectionFeed';
import apiService from '../../services/api/apiService';
import type { UploadedVideoResponse } from '../../services/api/apiService';

interface Detection {
  id: string;
  time: string;
  location: string;
  distressType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  confidence: number;
  status: string;
}

interface ActiveOverlay {
  type: string;
  confidence: number;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  x: number;
  y: number;
  w: number;
  h: number;
}

export default function LiveMonitoringDashboard() {
  // Simulator State
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [framesProcessed, setFramesProcessed] = useState(142030);
  const [distressesCount, setDistressesCount] = useState(87);
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(12);
  const [avgConfidence, setAvgConfidence] = useState(91.8);
  const [videoFile, setVideoFile] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<ActiveOverlay | null>(null);

  // Video Management System API state
  const [uploadedVideos, setUploadedVideos] = useState<UploadedVideoResponse[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [rightTab, setRightTab] = useState<'stats' | 'videos'>('videos');
  const [isDragging, setIsDragging] = useState(false);

  // Lists state
  const [recentDetections, setRecentDetections] = useState<Detection[]>([
    { id: 'DET-8830', time: '16:01:05', location: 'NH-48 (KM 42)', distressType: 'Pothole', severity: 'Critical', confidence: 94, status: 'Active' },
    { id: 'DET-8829', time: '15:59:42', location: 'SH-10 (Lonavala)', distressType: 'Alligator Cracks', severity: 'High', confidence: 89, status: 'Active' },
    { id: 'DET-8828', time: '15:58:11', location: 'NH-4 (Pune Bypass)', distressType: 'Rutting', severity: 'Medium', confidence: 87, status: 'Active' },
    { id: 'DET-8827', time: '15:55:04', location: 'Expressway Sector 4', distressType: 'Edge Break', severity: 'Low', confidence: 85, status: 'Acknowledged' }
  ]);

  const [alerts, setAlerts] = useState<Detection[]>([
    { id: 'DET-8830', time: '16:01:05', location: 'NH-48 (KM 42)', distressType: 'Pothole', severity: 'Critical', confidence: 94, status: 'Active' }
  ]);

  const [history, setHistory] = useState<Detection[]>([
    { id: 'DET-8830', time: '16:01:05', location: 'NH-48 (KM 42)', distressType: 'Pothole', severity: 'Critical', confidence: 94, status: 'Active' },
    { id: 'DET-8829', time: '15:59:42', location: 'SH-10 (Lonavala)', distressType: 'Alligator Cracks', severity: 'High', confidence: 89, status: 'Active' },
    { id: 'DET-8828', time: '15:58:11', location: 'NH-4 (Pune Bypass)', distressType: 'Rutting', severity: 'Medium', confidence: 87, status: 'Active' },
    { id: 'DET-8827', time: '15:55:04', location: 'Expressway Sector 4', distressType: 'Edge Break', severity: 'Low', confidence: 85, status: 'Acknowledged' },
    { id: 'DET-8826', time: '15:52:19', location: 'NH-48 (KM 21)', distressType: 'Longitudinal Cracks', severity: 'Medium', confidence: 90, status: 'Acknowledged' },
    { id: 'DET-8825', time: '15:48:30', location: 'SH-10 (Khandala)', distressType: 'Pothole', severity: 'Critical', confidence: 96, status: 'Completed' }
  ]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // References for keeping track of counters in simulation ticks
  const countersRef = useRef({
    totalFrames: 142030,
    totalDetections: 87,
    totalCritical: 12,
    confidencesSum: 87 * 91.8
  });
  const nextIdRef = useRef(8831);

  // YOLO Telemetry Tick Simulator
  useEffect(() => {
    let frameInterval: any;
    let detectionInterval: any;

    if (isMonitoring) {
      // 1. Tick frames processed (simulates 30fps = 3 frames every 100ms)
      frameInterval = setInterval(() => {
        countersRef.current.totalFrames += 3;
        setFramesProcessed(countersRef.current.totalFrames);
      }, 100);

      // 2. Tick random detections every 4 seconds
      const roads = ['NH-48 (KM 46)', 'SH-10 (Khandala)', 'NH-4 (Thane Expressway)', 'Bypass Highway 2', 'Expressway Section 6'];
      const distresses = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Longitudinal Cracks', 'Patch'];
      const severities: ('Critical' | 'High' | 'Medium' | 'Low')[] = ['Critical', 'High', 'Medium', 'Low'];

      detectionInterval = setInterval(() => {
        const randomRoad = roads[Math.floor(Math.random() * roads.length)];
        const randomType = distresses[Math.floor(Math.random() * distresses.length)];
        const randomSeverity = severities[Math.floor(Math.random() * severities.length)];
        const randomConf = Math.floor(80 + Math.random() * 18);

        const newId = `DET-${nextIdRef.current++}`;
        const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });

        const newDet: Detection = {
          id: newId,
          time: timestamp,
          location: randomRoad,
          distressType: randomType,
          severity: randomSeverity,
          confidence: randomConf,
          status: 'Active'
        };

        // Update counters
        countersRef.current.totalDetections += 1;
        countersRef.current.confidencesSum += randomConf;
        const newAvgConf = Number((countersRef.current.confidencesSum / countersRef.current.totalDetections).toFixed(1));

        setDistressesCount(countersRef.current.totalDetections);
        setAvgConfidence(newAvgConf);

        // Update list states
        setRecentDetections(prev => [newDet, ...prev.slice(0, 7)]);
        setHistory(prev => [newDet, ...prev.slice(0, 15)]);

        if (randomSeverity === 'Critical') {
          countersRef.current.totalCritical += 1;
          setCriticalAlertsCount(countersRef.current.totalCritical);
          setAlerts(prev => [newDet, ...prev.slice(0, 4)]);
        }

        // Draw bounding box overlay trigger on screen
        setActiveOverlay({
          type: randomType,
          confidence: randomConf,
          severity: randomSeverity,
          x: Math.floor(15 + Math.random() * 50),
          y: Math.floor(15 + Math.random() * 45),
          w: Math.floor(80 + Math.random() * 120),
          h: Math.floor(60 + Math.random() * 100)
        });

        // Auto clear overlay after 2 seconds
        setTimeout(() => {
          setActiveOverlay(null);
        }, 2000);

      }, 4000);
    }

    return () => {
      clearInterval(frameInterval);
      clearInterval(detectionInterval);
    };
  }, [isMonitoring]);

  const fetchVideos = async () => {
    try {
      const data = await apiService.getVideos(0, 100);
      setUploadedVideos(data);
      setFetchError(null);
    } catch (err: any) {
      console.error(err);
      setFetchError("Failed to fetch uploaded videos library from database.");
    }
  };

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleVideoUploadFile = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      const res = await apiService.uploadVideo(file);
      setUploadedVideos(prev => [res, ...prev]);
      setVideoFile(res.filename);
      setIsMonitoring(false);
      setActiveOverlay(null);
      fetchVideos();
    } catch (err: any) {
      console.error(err);
      setUploadError(err.response?.data?.detail || "Failed to upload video file.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleStart = () => {
    setIsMonitoring(true);
  };

  const handleStop = () => {
    setIsMonitoring(false);
    setActiveOverlay(null);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleVideoUploadFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleVideoUploadFile(file);
    }
  };

  const handleDeleteVideo = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this video log and remove the physical file from server disk?")) {
      return;
    }
    try {
      await apiService.deleteVideo(id);
      setUploadedVideos(prev => prev.filter(v => v.id !== id));
      if (videoFile && uploadedVideos.find(v => v.id === id)?.filename === videoFile) {
        setVideoFile(null);
        setIsMonitoring(false);
      }
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete video file.");
    }
  };

  const handleSelectVideo = (video: UploadedVideoResponse) => {
    if (video.processing_status === 'failed') {
      alert("Cannot process a failed video upload log.");
      return;
    }
    setVideoFile(video.filename);
    // Reset counters for new simulation run
    countersRef.current = {
      totalFrames: 0,
      totalDetections: 0,
      totalCritical: 0,
      confidencesSum: 0
    };
    setFramesProcessed(0);
    setDistressesCount(0);
    setCriticalAlertsCount(0);
    setAvgConfidence(0);
    setRecentDetections([]);
    setAlerts([]);
    setIsMonitoring(true);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleAcknowledgeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    setRecentDetections(prev => prev.map(d => d.id === id ? { ...d, status: 'Acknowledged' } : d));
    setHistory(prev => prev.map(d => d.id === id ? { ...d, status: 'Acknowledged' } : d));
  };

  // Map recent detections to FeedDetection type required by RealTimeDetectionFeed
  const feedDetections = recentDetections.map(d => {
    const numPart = d.location.replace(/[^0-9]/g, '');
    const roadId = d.location.startsWith('NH-48') 
      ? 'RD-48102' 
      : d.location.startsWith('SH-10') 
      ? 'RD-10294' 
      : d.location.startsWith('NH-4') 
      ? 'RD-48301' 
      : 'RD-40291';
    const coords = numPart 
      ? `18.734${numPart.slice(0, 1) || '0'}, 73.42${numPart.slice(1, 3) || '00'}` 
      : '18.8912, 73.2045';

    return {
      id: d.id,
      time: d.time,
      roadId,
      distressType: d.distressType,
      severity: d.severity,
      confidence: d.confidence,
      coordinates: coords
    };
  });

  return (
    <div className="live-mon">
      {/* Page Header */}
      <header className="live-mon__header">
        <div className="live-mon__header-titles">
          <h1 className="live-mon__title">Live Monitoring Center</h1>
          <p className="live-mon__subtitle">
            Real-time road distress detection and surveillance
          </p>
        </div>
        <div className={`live-mon__status-pill ${isMonitoring ? 'live-mon__status-pill--active' : ''}`}>
          <span className="live-mon__status-dot"></span>
          <span>{isMonitoring ? 'FEED: ACTIVE' : videoFile ? 'FEED: READY' : 'FEED: IDLE'}</span>
        </div>
      </header>

      {/* Row 1: Live Video Feed and Quick Stats */}
      <div className="live-mon__grid-row live-mon__grid-row--feed-split">
        {/* Live Video Feed Card */}
        <section className={`live-mon-video-card ${isFullscreen ? 'live-mon-video-card--fullscreen' : ''}`} aria-label="Video surveillance feed">
          <header className="live-mon-video-card__header">
            <div className="live-mon-video-card__title-group">
              <Tv size={16} className="text-purple" />
              <h2 className="live-mon-video-card__title">
                {videoFile ? `Surveillance Feed: ${videoFile}` : 'Surveillance Feed (Camera CAM-04)'}
              </h2>
            </div>
            <button 
              className="live-mon-video-card__fullscreen-btn" 
              onClick={toggleFullscreen} 
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
            </button>
          </header>

          <div className="live-mon-video-card__viewport">
            {/* Background Simulated Road Video */}
            <div className="live-mon-video-card__simulator-bg">
              <div className="live-mon-video-card__road-perspective">
                {/* Horizontal scan line */}
                {isMonitoring && <div className="live-mon-video-card__scanner-line" />}
                
                {/* Bounding box detection overlay overlay */}
                {isMonitoring && activeOverlay && (
                  <div 
                    className={`live-mon-video-card__bbox border-${activeOverlay.severity.toLowerCase()}`}
                    style={{
                      left: `${activeOverlay.x}%`,
                      top: `${activeOverlay.y}%`,
                      width: `${activeOverlay.w}px`,
                      height: `${activeOverlay.h}px`
                    }}
                  >
                    <span className={`live-mon-video-card__bbox-tag bg-${activeOverlay.severity.toLowerCase()}`}>
                      {activeOverlay.type} ({activeOverlay.confidence}%)
                    </span>
                  </div>
                )}
                
                {/* Simulated telemetry grids */}
                <div className="live-mon-video-card__hud-grid" />
                
                {/* Simulated camera settings info */}
                <div className="live-mon-video-card__hud-overlay">
                  <span className="font-mono text-purple">CAM-04/NH48</span>
                  <span className="font-mono text-amber">GPS: 18.734, 73.421</span>
                  <span className="font-mono text-blue">YOLOv11x ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Empty view state when idle */}
            {!isMonitoring && !videoFile && (
              <div className="live-mon-video-card__empty-state">
                <Radio className="live-mon-video-card__empty-icon animate-pulse" size={40} />
                <p className="live-mon-video-card__empty-text">Camera stream is offline. Start monitoring to activate feed.</p>
              </div>
            )}
          </div>

          <footer className="live-mon-video-card__controls">
            <div className="live-mon-video-card__button-group">
              <button 
                className={`live-mon-btn live-mon-btn--success ${isMonitoring ? 'live-mon-btn--disabled' : ''}`}
                onClick={handleStart}
                disabled={isMonitoring}
              >
                <Play size={14} />
                <span>Start Monitoring</span>
              </button>

              <button 
                className={`live-mon-btn live-mon-btn--danger ${!isMonitoring ? 'live-mon-btn--disabled' : ''}`}
                onClick={handleStop}
                disabled={!isMonitoring}
              >
                <Square size={14} />
                <span>Stop Monitoring</span>
              </button>
            </div>

            <div className="live-mon-video-card__upload-group">
              <input 
                type="file" 
                accept="video/*" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
              />
              <button className="live-mon-btn live-mon-btn--secondary" onClick={handleUploadClick}>
                <Upload size={14} />
                <span>Upload Video</span>
              </button>
              {videoFile && <span className="live-mon-video-card__file-label font-mono">{videoFile}</span>}
            </div>
          </footer>
        </section>

        {/* Quick Stats & Video Management tabbed container */}
        <section className="live-mon-side-panel" aria-labelledby="side-panel-title">
          <header className="live-mon-side-panel__tabs">
            <button 
              type="button"
              className={`live-mon-side-panel__tab-btn ${rightTab === 'videos' ? 'live-mon-side-panel__tab-btn--active' : ''}`}
              onClick={() => setRightTab('videos')}
            >
              <Video size={14} />
              <span>Video Library</span>
            </button>
            <button 
              type="button"
              className={`live-mon-side-panel__tab-btn ${rightTab === 'stats' ? 'live-mon-side-panel__tab-btn--active' : ''}`}
              onClick={() => setRightTab('stats')}
            >
              <Activity size={14} />
              <span>Diagnostic Stats</span>
            </button>
          </header>

          <div className="live-mon-side-panel__content">
            {rightTab === 'stats' ? (
              <div className="live-mon-stats-card__body">
                {/* Metric Frame */}
                <div className="live-mon-stat-block">
                  <span className="live-mon-stat-block__label">Frames Processed</span>
                  <span className="live-mon-stat-block__value font-mono">{framesProcessed.toLocaleString()}</span>
                </div>

                {/* Metric Distresses */}
                <div className="live-mon-stat-block">
                  <span className="live-mon-stat-block__label">Anomalies Detected</span>
                  <span className="live-mon-stat-block__value font-mono text-purple">{distressesCount}</span>
                </div>

                {/* Metric Alerts */}
                <div className="live-mon-stat-block">
                  <span className="live-mon-stat-block__label">Critical Alerts</span>
                  <span className="live-mon-stat-block__value font-mono text-red">{criticalAlertsCount}</span>
                </div>

                {/* Metric Conf */}
                <div className="live-mon-stat-block">
                  <span className="live-mon-stat-block__label">Avg Confidence</span>
                  <span className="live-mon-stat-block__value font-mono text-green">{avgConfidence}%</span>
                </div>
              </div>
            ) : (
              <div className="vms-panel">
                {/* Drag and Drop Upload Area */}
                <div 
                  className={`vms-upload-dropzone ${isDragging ? 'vms-upload-dropzone--dragging' : ''} ${isUploading ? 'vms-upload-dropzone--uploading' : ''}`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleUploadClick}
                  role="button"
                  tabIndex={0}
                  aria-label="Upload video file"
                >
                  {isUploading ? (
                    <div className="vms-upload-dropzone__loading">
                      <Loader2 className="animate-spin text-purple" size={32} />
                      <p>Uploading to backend...</p>
                    </div>
                  ) : (
                    <div className="vms-upload-dropzone__prompt">
                      <Upload className="vms-upload-dropzone__icon text-purple" size={32} />
                      <p className="vms-upload-dropzone__text-main">Drag & drop video feed here</p>
                      <p className="vms-upload-dropzone__text-sub">or click to browse (.mp4, .avi, .mov)</p>
                    </div>
                  )}
                </div>

                {uploadError && <p className="vms-panel__error-text font-mono">{uploadError}</p>}

                {/* Uploaded videos metadata list */}
                <div className="vms-library">
                  <h3 className="vms-library__title font-mono">Surveillance Feeds database</h3>
                  {fetchError ? (
                    <p className="vms-library__error font-mono">{fetchError}</p>
                  ) : uploadedVideos.length === 0 ? (
                    <div className="vms-library__empty">
                      <Video size={20} className="text-slate-500" />
                      <span>No videos found in PostgreSQL</span>
                    </div>
                  ) : (
                    <div className="vms-library__list">
                      {uploadedVideos.map((video) => {
                        const isCurrent = videoFile === video.filename;
                        const statusClass = `vms-status-badge--${video.processing_status}`;
                        
                        return (
                          <div 
                            key={video.id} 
                            className={`vms-video-row ${isCurrent ? 'vms-video-row--active' : ''}`}
                            onClick={() => handleSelectVideo(video)}
                          >
                            <div className="vms-video-row__info">
                              <span className="vms-video-row__filename font-mono" title={video.filename}>
                                {video.filename}
                              </span>
                              <span className="vms-video-row__date font-mono">
                                {new Date(video.upload_timestamp).toLocaleString('en-IN', { hour12: false })}
                              </span>
                            </div>
                            <div className="vms-video-row__actions">
                              <span className={`vms-status-badge ${statusClass} font-mono`}>
                                {video.processing_status === 'processing' && (
                                  <Loader2 className="animate-spin" size={10} style={{ marginRight: '4px' }} />
                                )}
                                {video.processing_status}
                              </span>
                              <button 
                                type="button"
                                className="vms-video-row__delete-btn"
                                onClick={(e) => handleDeleteVideo(video.id, e)}
                                title="Delete video"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Row 2: Live Log Feed and Critical Alert Panel */}
      <div className="live-mon__grid-row live-mon__grid-row--feed-split">
        {/* Real-time Ticker Feed */}
        <RealTimeDetectionFeed 
          detections={feedDetections} 
          isMonitoringActive={isMonitoring} 
        />

        {/* Critical Warnings Panel */}
        <section className="live-mon-alerts-card" aria-labelledby="alerts-title">
          <header className="live-mon-alerts-card__header">
            <AlertTriangle size={16} className="text-red" />
            <h2 id="alerts-title" className="live-mon-alerts-card__title">Critical Alerts</h2>
          </header>
          <div className="live-mon-alerts-card__body">
            {alerts.length === 0 ? (
              <div className="live-mon-alerts-card__empty">
                <Check className="live-mon-alerts-card__empty-icon" size={24} />
                <span>No active critical alerts pending</span>
              </div>
            ) : (
              <div className="live-mon-alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className="live-mon-alert-box">
                    <div className="live-mon-alert-box__main">
                      <div className="live-mon-alert-box__header">
                        <span className="live-mon-alert-box__id font-mono">{alert.id}</span>
                        <span className="live-mon-alert-box__time">{alert.time}</span>
                      </div>
                      <h3 className="live-mon-alert-box__title">{alert.distressType}</h3>
                      <p className="live-mon-alert-box__location">{alert.location}</p>
                    </div>
                    <button 
                      className="live-mon-alert-box__ack-btn"
                      onClick={() => handleAcknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Row 3: Full Session Detection History Table */}
      <section className="live-mon-history-card" aria-labelledby="history-title">
        <header className="live-mon-history-card__header">
          <History size={16} className="text-blue" />
          <h2 id="history-title" className="live-mon-history-card__title">Detection History Logs</h2>
        </header>
        <div className="live-mon-history-card__body">
          <div className="live-mon-history-table-wrapper">
            <table className="live-mon-history-table">
              <thead>
                <tr>
                  <th>Detection ID</th>
                  <th>Timestamp</th>
                  <th>Location Landmark</th>
                  <th>Distress Category</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(row => (
                  <tr key={row.id}>
                    <td className="font-mono font-bold text-slate-100">{row.id}</td>
                    <td>{row.time}</td>
                    <td>{row.location}</td>
                    <td>{row.distressType}</td>
                    <td>
                      <span className={`live-mon-badge live-mon-badge--${row.severity.toLowerCase()}`}>
                        {row.severity}
                      </span>
                    </td>
                    <td className="font-mono">{row.confidence}%</td>
                    <td>
                      <span className={`live-mon-status-badge live-mon-status-badge--${row.status.toLowerCase()}`}>
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
