import { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  Download, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  FileCheck,
  X,
  Trash2
} from 'lucide-react';
import apiService from '../../services/api/apiService';
import './ReportsTable.css';

export interface ReportItem {
  id: string;
  roadId: string;
  district: string;
  distressType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  generatedDate: string;
  status: 'Draft' | 'Under Review' | 'Approved' | 'Exported';
  filepath?: string;
  reportId?: number;
  reportType?: string;
}

interface ReportsTableProps {
  reports: ReportItem[];
  onDeleteReport?: (id: string, reportId?: number) => void;
}

export default function ReportsTable({ reports, onDeleteReport }: ReportsTableProps) {
  // Navigation & Search State
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal View State
  const [activeReportModal, setActiveReportModal] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Row count per page
  const itemsPerPage = 5;

  // Clear filters helper
  const handleResetFilters = () => {
    setSearchQuery('');
    setTypeFilter('All');
    setSeverityFilter('All');
    setStatusFilter('All');
    setCurrentPage(1);
  };

  // Reset page index on filter updates
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, typeFilter, severityFilter, statusFilter]);

  // Client-side filtering logic
  const filteredReports = useMemo(() => {
    return reports.filter(r => {
      const matchesSearch = r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.roadId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.district.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === 'All' || r.distressType === typeFilter;
      const matchesSeverity = severityFilter === 'All' || r.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;

      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [reports, searchQuery, typeFilter, severityFilter, statusFilter]);

  // Paginated elements mapping
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
  
  const paginatedReports = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredReports, currentPage]);

  // Toast actions triggers helper
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = (report: ReportItem) => {
    if (report.reportId) {
      if (report.reportType === 'EXCEL' || report.id.startsWith('Excel_')) {
        window.location.href = apiService.getExcelReportDownloadUrl(report.reportId);
        showToast(`Downloading Excel Report for ${report.id}...`);
      } else {
        window.location.href = apiService.getReportDownloadUrl(report.reportId);
        showToast(`Downloading PDF Report for ${report.id}...`);
      }
    } else {
      showToast(`Mock downloaded file for ${report.id}`);
    }
  };

  const handlePreview = (report: ReportItem) => {
    if (report.reportId) {
      if (report.reportType === 'EXCEL' || report.id.startsWith('Excel_')) {
        window.location.href = apiService.getExcelReportDownloadUrl(report.reportId);
        showToast(`Downloading Excel Report (Preview not supported)...`);
      } else {
        window.open(apiService.getReportPreviewUrl(report.reportId), '_blank');
        showToast(`Opening PDF preview for ${report.id}...`);
      }
    } else {
      showToast(`Mock preview for ${report.id}`);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Exported':
        return <FileCheck size={13} className="text-blue" />;
      case 'Approved':
        return <CheckCircle size={13} className="text-green" />;
      case 'Under Review':
        return <Clock size={13} className="text-amber" />;
      case 'Draft':
      default:
        return <AlertCircle size={13} className="text-purple" />;
    }
  };

  return (
    <div className="rep-table-card">
      <header className="rep-table-card__header">
        <h3 className="rep-table-card__title">Generated Reports Archive</h3>
        <span className="rep-table-card__badge font-mono">
          {filteredReports.length} {filteredReports.length === 1 ? 'record' : 'records'}
        </span>
      </header>

      {/* Filter and Search Actions Section */}
      <div className="rep-table-card__controls">
        <div className="rep-table-card__search-wrapper">
          <Search size={14} className="rep-table-card__search-icon" />
          <input 
            type="text" 
            placeholder="Search Report ID, Road, District..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rep-table-card__search-input"
          />
        </div>

        <div className="rep-table-card__filters-group">
          {/* Category Filter */}
          <div className="rep-select-box">
            <Filter size={12} className="rep-select-box__icon" />
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rep-select-box__field"
            >
              <option value="All">All Types</option>
              <option value="Pothole">Pothole</option>
              <option value="Alligator Cracks">Alligator Cracks</option>
              <option value="Rutting">Rutting</option>
              <option value="Edge Break">Edge Break</option>
              <option value="Patch">Patch</option>
            </select>
          </div>

          {/* Severity Filter */}
          <select 
            value={severityFilter} 
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rep-select-box__field"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          {/* Status Filter */}
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rep-select-box__field"
          >
            <option value="All">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Exported">Exported</option>
          </select>

          {(searchQuery || typeFilter !== 'All' || severityFilter !== 'All' || statusFilter !== 'All') && (
            <button className="rep-table-card__reset-btn" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Structured Table Element */}
      <div className="rep-table-card__body">
        <div className="rep-table-card__table-wrapper">
          <table className="rep-main-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Road ID</th>
                <th>District</th>
                <th>Distress Type</th>
                <th>Severity</th>
                <th>Generated</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedReports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="rep-main-table__empty">
                    <FileText size={36} className="rep-main-table__empty-icon animate-pulse" />
                    <p>No reports found matching criteria.</p>
                  </td>
                </tr>
              ) : (
                paginatedReports.map((report) => (
                  <tr key={report.id}>
                    <td className="font-mono font-bold text-slate-100">{report.id}</td>
                    <td className="font-bold">{report.roadId}</td>
                    <td>{report.district}</td>
                    <td>{report.distressType}</td>
                    <td>
                      <span className={`live-mon-badge live-mon-badge--${report.severity.toLowerCase()}`}>
                        {report.severity}
                      </span>
                    </td>
                    <td className="font-mono text-xs">{report.generatedDate}</td>
                    <td>
                      <div className="rep-status-pill">
                        {getStatusIcon(report.status)}
                        <span className={`text-status-${report.status.toLowerCase().replace(' ', '-')}`}>
                          {report.status}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="rep-table-actions">
                        <button 
                          className="rep-btn-action rep-btn-action--view" 
                          onClick={() => setActiveReportModal(report)}
                          title="View Details"
                        >
                          <Eye size={13} />
                        </button>
                        <button 
                          className="rep-btn-action rep-btn-action--download" 
                          onClick={() => handleDownload(report)}
                          title="Download PDF Report"
                        >
                          <Download size={13} />
                        </button>
                        <button 
                          className="rep-btn-action rep-btn-action--pdf" 
                          onClick={() => handlePreview(report)}
                          title="Preview PDF Report"
                        >
                          <FileText size={13} />
                        </button>
                        {onDeleteReport && (
                          <button 
                            className="rep-btn-action rep-btn-action--delete" 
                            onClick={() => onDeleteReport(report.id, report.reportId)}
                            title="Delete Archive Record"
                          >
                            <Trash2 size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer Controls */}
      {filteredReports.length > 0 && (
        <footer className="rep-table-card__footer">
          <div className="rep-table-card__showing">
            Showing <span className="font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> to{' '}
            <span className="font-bold">
              {Math.min(currentPage * itemsPerPage, filteredReports.length)}
            </span>{' '}
            of <span className="font-bold">{filteredReports.length}</span> entries
          </div>

          <div className="rep-table-card__pagination">
            <button 
              className="rep-page-btn" 
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft size={14} />
            </button>
            
            <span className="rep-page-info">
              Page <span className="font-bold">{currentPage}</span> of{' '}
              <span className="font-bold">{totalPages}</span>
            </span>

            <button 
              className="rep-page-btn" 
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </footer>
      )}

      {/* Interactive Modal for viewing detailed telemetry report */}
      {activeReportModal && (
        <div className="rep-modal-backdrop" onClick={() => setActiveReportModal(null)}>
          <div className="rep-modal" onClick={(e) => e.stopPropagation()}>
            <header className="rep-modal__header">
              <h4 className="rep-modal__title">Distress Report Telemetry: {activeReportModal.id}</h4>
              <button className="rep-modal__close-btn" onClick={() => setActiveReportModal(null)}>
                <X size={16} />
              </button>
            </header>
            <div className="rep-modal__body">
              <div className="rep-modal__grid">
                <div className="rep-modal__item">
                  <span className="rep-modal__label">Report ID</span>
                  <span className="rep-modal__value font-mono">{activeReportModal.id}</span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">Road Target ID</span>
                  <span className="rep-modal__value font-bold">{activeReportModal.roadId}</span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">District Area</span>
                  <span className="rep-modal__value">{activeReportModal.district}</span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">Detected Distress</span>
                  <span className="rep-modal__value text-slate-100">{activeReportModal.distressType}</span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">Distress Severity</span>
                  <span className={`live-mon-badge live-mon-badge--${activeReportModal.severity.toLowerCase()}`}>
                    {activeReportModal.severity}
                  </span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">Generated Timestamp</span>
                  <span className="rep-modal__value font-mono">{activeReportModal.generatedDate}</span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">Current Status</span>
                  <span className={`rep-type-label rep-type-label--${activeReportModal.status.toLowerCase().replace(' ', '-')}`}>
                    {activeReportModal.status}
                  </span>
                </div>
                <div className="rep-modal__item">
                  <span className="rep-modal__label">AI Detection Confidence</span>
                  <span className="rep-modal__value text-green font-mono">94.8% (Avg Backbone inference)</span>
                </div>
              </div>

              <div className="rep-modal__alert-text">
                This report summarizes the AI-detected surface distress anomalies, structural parameters, and coordinate maps. 
                Pending review, field repair squads can download this and assign repair tasks.
              </div>
            </div>
            <footer className="rep-modal__footer">
              <button 
                className="rep-modal-btn rep-modal-btn--secondary" 
                onClick={() => setActiveReportModal(null)}
              >
                Close View
              </button>
              <button 
                className="rep-modal-btn rep-modal-btn--primary"
                onClick={() => {
                  handleDownload(activeReportModal);
                  setActiveReportModal(null);
                }}
              >
                Download PDF Report
              </button>
            </footer>
          </div>
        </div>
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="rep-toast font-mono">
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
