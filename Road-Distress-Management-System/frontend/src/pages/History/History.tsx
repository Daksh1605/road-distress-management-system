import { useState, useEffect } from 'react';
import { History as HistoryIcon, Download, Search, ShieldCheck, Trash2, Calendar, FileSpreadsheet } from 'lucide-react';
import apiService from '../../services/api/apiService';
import type { ReportResponse, UploadedVideoResponse } from '../../services/api/apiService';
import './History.css';


export default function History() {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [videos, setVideos] = useState<UploadedVideoResponse[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const [reportsList, videosList] = await Promise.all([
        apiService.getReports(0, 100),
        apiService.getVideos(0, 100)
      ]);
      setReports(reportsList);
      setVideos(videosList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDeleteReport = async (id: number) => {
    if (!confirm("Are you sure you want to delete this historical report record?")) {
      return;
    }
    try {
      await apiService.deleteReport(id);
      setReports(prev => prev.filter(r => r.id !== id));
    } catch (err) {
      alert("Failed to delete report.");
    }
  };

  const filteredReports = reports.filter(r => 
    r.report_name.toLowerCase().includes(search.toLowerCase()) ||
    r.report_type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="history-page animate-fade-in">
      <header className="history-page__header">
        <h1 className="bold-page-title">Operational History</h1>
        <p className="light-secondary-text">Review and audit all video detection pipelines and exported spreadsheet/PDF summaries.</p>
      </header>

      <div className="history-tabs premium-card">
        <div className="history-tabs__search">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search report logs..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="history-grid">
        {/* Left panel: Generated reports logs */}
        <div className="history-card premium-card">
          <div className="history-card__header">
            <HistoryIcon size={18} style={{ color: 'var(--accent-blue)' }} />
            <h2 className="medium-section-title">Reports Export Archive</h2>
          </div>

          {isLoading ? (
            <div className="history-empty">Syncing logs...</div>
          ) : filteredReports.length === 0 ? (
            <div className="history-empty">No reports found in operational archives.</div>
          ) : (
            <div className="history-list">
              {filteredReports.map((rep) => (
                <div key={rep.id} className="history-item">
                  <div className="history-item__left">
                    {rep.report_type.toLowerCase() === 'excel' ? (
                      <FileSpreadsheet className="history-item__file-icon excel" size={20} />
                    ) : (
                      <Download className="history-item__file-icon pdf" size={20} />
                    )}
                    <div className="history-item__info">
                      <span className="history-item__title font-mono">{rep.report_name}</span>
                      <span className="history-item__meta small-caption">
                        Type: {rep.report_type} &bull; Generated: {new Date(rep.generated_at).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  <div className="history-item__actions">
                    <a 
                      href={rep.report_type.toLowerCase() === 'excel' ? apiService.getExcelReportDownloadUrl(rep.id) : apiService.getReportDownloadUrl(rep.id)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="download-link"
                      title="Download report file"
                    >
                      <Download size={14} />
                    </a>
                    <button 
                      className="delete-report-btn" 
                      onClick={() => handleDeleteReport(rep.id)}
                      title="Delete log"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel: Video runs pipeline history */}
        <div className="history-card premium-card">
          <div className="history-card__header">
            <ShieldCheck size={18} style={{ color: 'var(--success)' }} />
            <h2 className="medium-section-title">Inference Run Logs</h2>
          </div>

          {isLoading ? (
            <div className="history-empty">Syncing logs...</div>
          ) : videos.length === 0 ? (
            <div className="history-empty">No processed pipelines in database.</div>
          ) : (
            <div className="history-list">
              {videos.map((vid) => (
                <div key={vid.id} className="history-item">
                  <div className="history-item__left">
                    <Calendar className="history-item__file-icon" size={20} style={{ color: 'var(--secondary-text)' }} />
                    <div className="history-item__info">
                      <span className="history-item__title font-mono" title={vid.filename}>{vid.filename}</span>
                      <span className="history-item__meta small-caption">
                        Uploader ID: {vid.uploader_id || 1} &bull; Status: {vid.processing_status}
                      </span>
                    </div>
                  </div>
                  <div className="history-item__actions">
                    <span className="status-pill status-pill--completed font-mono">
                      {vid.processing_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
