import { useState, useEffect, useRef } from 'react';
import { Upload, Film, HardDrive, Trash2, ShieldCheck, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import apiService from '../../services/api/apiService';
import type { UploadedVideoResponse } from '../../services/api/apiService';
import './UploadVideo.css';


export default function UploadVideo() {
  const [videos, setVideos] = useState<UploadedVideoResponse[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchVideos = async () => {
    try {
      const list = await apiService.getVideos(0, 100);
      setVideos(list);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch upload registry.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(fetchVideos, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleUploadFile = async (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert("Please upload a valid video file.");
      return;
    }
    setIsUploading(true);
    setUploadProgress(15);
    setError(null);

    // Simulate progress animation
    const progressTimer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 85) {
          clearInterval(progressTimer);
          return 85;
        }
        return prev + 10;
      });
    }, 150);

    try {
      const res = await apiService.uploadVideo(file);
      clearInterval(progressTimer);
      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
        setVideos(prev => [res, ...prev]);
        fetchVideos();
      }, 500);
    } catch (err: any) {
      clearInterval(progressTimer);
      setIsUploading(false);
      setUploadProgress(0);
      setError(err.response?.data?.detail || "Video upload failed. Verify backend services.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadFile(file);
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
      handleUploadFile(file);
    }
  };

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this video file from the system disk?")) {
      return;
    }
    try {
      await apiService.deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err: any) {
      alert("Failed to delete video.");
    }
  };

  // Pre-calculate statistics
  const totalJobs = videos.length;
  const completedJobs = videos.filter(v => v.processing_status.toLowerCase() === 'completed').length;
  const pendingJobs = videos.filter(v => v.processing_status.toLowerCase() === 'processing' || v.processing_status.toLowerCase() === 'queued').length;
  const failedJobs = videos.filter(v => v.processing_status.toLowerCase() === 'failed').length;
  const storageUsedGB = (totalJobs * 0.42).toFixed(1); // Moked size estimate

  return (
    <div className="upload-page animate-fade-in">
      <header className="upload-page__header">
        <h1 className="bold-page-title">Surveillance Upload Center</h1>
        <p className="light-secondary-text">Upload dashcam video footage to initiate the YOLOv11 AI detection pipeline.</p>
      </header>

      <div className="upload-page__layout">
        {/* Left Side: Upload zone and Queue */}
        <div className="upload-page__main">
          {/* Drag & Drop Card */}
          <div 
            className={`upload-zone premium-card ${isDragging ? 'upload-zone--dragging' : ''} ${isUploading ? 'upload-zone--uploading' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              accept="video/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />

            {isUploading ? (
              <div className="upload-zone__progress-view">
                <Loader2 className="animate-spin text-accent" size={48} style={{ color: 'var(--accent-blue)' }} />
                <h3>Uploading Footage...</h3>
                <p className="light-secondary-text">Transmitting binary chunks to PostgreSQL server storage</p>
                <div className="progress-bar-container">
                  <div className="progress-bar-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <span className="progress-percent font-mono">{uploadProgress}%</span>
              </div>
            ) : (
              <div className="upload-zone__prompt">
                <div className="upload-zone__icon-wrapper">
                  <Upload size={32} style={{ color: 'var(--accent-blue)' }} />
                </div>
                <h3>Drag & Drop Surveillance Video</h3>
                <p className="light-secondary-text">Supports MP4, AVI, MOV up to 500MB</p>
                <button className="upload-btn-browse">Browse Local Files</button>
              </div>
            )}
          </div>

          {error && (
            <div className="upload-error-alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Queue & Logs */}
          <div className="upload-queue premium-card">
            <div className="upload-queue__header">
              <h2 className="medium-section-title">Video Processing Queue</h2>
              <button className="btn-refresh" onClick={fetchVideos} disabled={isLoading}>
                <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span>Sync Pipeline</span>
              </button>
            </div>

            {isLoading ? (
              <div className="upload-queue__empty font-mono">Loading queue records...</div>
            ) : videos.length === 0 ? (
              <div className="upload-queue__empty">
                <Film size={28} style={{ color: 'var(--secondary-text)', opacity: 0.5 }} />
                <p>No video files uploaded yet. Drag videos above to begin.</p>
              </div>
            ) : (
              <div className="upload-queue__list">
                {videos.map((vid) => {
                  const status = vid.processing_status.toLowerCase();
                  return (
                    <div key={vid.id} className="queue-item">
                      <div className="queue-item__left">
                        <Film size={18} className="queue-item__icon" />
                        <div className="queue-item__details">
                          <span className="queue-item__name font-mono" title={vid.filename}>{vid.filename}</span>
                          <span className="queue-item__date small-caption">
                            {new Date(vid.upload_timestamp).toLocaleString('en-IN', { hour12: false })}
                          </span>
                        </div>
                      </div>
                      <div className="queue-item__right">
                        <span className={`status-pill status-pill--${status}`}>
                          {status === 'processing' && <Loader2 size={10} className="animate-spin" />}
                          {status}
                        </span>
                        <button 
                          className="btn-trash" 
                          onClick={(e) => handleDelete(vid.id, e)} 
                          title="Delete footage"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Sidebar Stats panel */}
        <div className="upload-page__sidebar">
          {/* Storage Capacity card */}
          <div className="storage-card premium-card">
            <div className="storage-card__header">
              <HardDrive size={20} style={{ color: 'var(--accent-blue)' }} />
              <h3 className="medium-section-title">Cloud GIS Storage</h3>
            </div>
            <div className="storage-card__gauge">
              <span className="large-kpi-number">{storageUsedGB} GB</span>
              <span className="light-secondary-text">of 100 GB occupied</span>
              <div className="progress-bar-container">
                <div 
                  className="progress-bar-fill" 
                  style={{ width: `${Math.min(100, (parseFloat(storageUsedGB) / 100) * 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="storage-card__divider" />
            <div className="storage-card__footer">
              <ShieldCheck size={14} style={{ color: 'var(--success)' }} />
              <span className="small-caption font-bold" style={{ color: 'var(--success)' }}>AI YOLO Engine Status: Online</span>
            </div>
          </div>

          {/* Stats details card */}
          <div className="stats-card premium-card">
            <h3 className="medium-section-title">Upload Analytics</h3>
            <ul className="stats-card__list">
              <li>
                <div className="stats-item">
                  <span className="light-secondary-text">Pending Detections</span>
                  <span className="stats-val font-mono">{pendingJobs}</span>
                </div>
              </li>
              <li>
                <div className="stats-item">
                  <span className="light-secondary-text">Successful Pipelines</span>
                  <span className="stats-val font-mono text-success" style={{ color: 'var(--success)' }}>{completedJobs}</span>
                </div>
              </li>
              <li>
                <div className="stats-item">
                  <span className="light-secondary-text">Failed Run Logs</span>
                  <span className="stats-val font-mono text-danger" style={{ color: 'var(--danger)' }}>{failedJobs}</span>
                </div>
              </li>
              <li>
                <div className="stats-item">
                  <span className="light-secondary-text">Avg Processing Time</span>
                  <span className="stats-val font-mono">1.8m</span>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
