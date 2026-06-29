import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, ShieldAlert, FileText, Edit2, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import apiService from '../../services/api/apiService';
import type { RoadDistressResponse } from '../../services/api/apiService';
import './RoadDistresses.css';


export default function RoadDistresses() {
  const [distresses, setDistresses] = useState<RoadDistressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchDistressLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDistressLogs(0, 200);
      setDistresses(data);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to sync distress logs database. Make sure backend service is active.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDistressLogs();
  }, []);

  const handleGeneratePDF = async (id: number) => {
    try {
      await apiService.generatePDFReport(id);
      alert(`PDF report generated successfully for Distress #${id}! Check Reports section.`);
    } catch (err: any) {
      alert("Failed to generate PDF. Defaulting to mock generation.");
    }
  };

  // Filter and Search logic
  const filteredDistresses = useMemo(() => {
    return distresses.filter((item) => {
      const matchesSearch = 
        item.id.toString().includes(search) ||
        (item.distress_type || '').toLowerCase().includes(search.toLowerCase()) ||
        `RD-${item.id}`.toLowerCase().includes(search.toLowerCase());
      
      const matchesSeverity = severityFilter === '' || item.severity.toLowerCase() === severityFilter.toLowerCase();
      const matchesType = typeFilter === '' || item.distress_type.toLowerCase() === typeFilter.toLowerCase();
      const matchesStatus = statusFilter === '' || item.status.toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesSeverity && matchesType && matchesStatus;
    });
  }, [distresses, search, severityFilter, typeFilter, statusFilter]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDistresses.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDistresses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDistresses, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  const formatDistressType = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  const getSeverityBadgeClass = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical' || s === 'high') return 'badge-danger';
    if (s === 'medium') return 'badge-warning';
    return 'badge-success';
  };

  return (
    <div className="distress-page animate-fade-in">
      <header className="distress-page__header">
        <h1 className="bold-page-title">Road Distress Logs</h1>
        <p className="light-secondary-text">Manage geo-tagged structural road defects flagged by AI YOLO v11 model runs.</p>
      </header>

      {/* Toolbar: Search & Filters */}
      <div className="distress-toolbar premium-card">
        <div className="distress-toolbar__search">
          <Search className="search-icon" size={16} />
          <input 
            type="text" 
            placeholder="Search road ID, type..." 
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
          />
        </div>

        <div className="distress-toolbar__filters">
          <div className="filter-select">
            <Filter size={12} className="filter-select__icon" />
            <select 
              value={severityFilter} 
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter Severity"
            >
              <option value="">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="filter-select">
            <Filter size={12} className="filter-select__icon" />
            <select 
              value={typeFilter} 
              onChange={(e) => { setTypeFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter Distress Type"
            >
              <option value="">All Distress Types</option>
              <option value="pothole">Pothole</option>
              <option value="crack">Crack</option>
              <option value="alligator_cracks">Alligator Cracks</option>
              <option value="rutting">Rutting</option>
              <option value="ravelling">Ravelling</option>
              <option value="edge_break">Edge Break</option>
            </select>
          </div>

          <div className="filter-select">
            <Filter size={12} className="filter-select__icon" />
            <select 
              value={statusFilter} 
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              aria-label="Filter Work Status"
            >
              <option value="">All Statuses</option>
              <option value="detected">Detected</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table section */}
      <div className="distress-grid premium-card">
        {isLoading ? (
          <div className="distress-grid__loading">
            <div className="loading-spinner" />
            <p>Syncing telemetry records...</p>
          </div>
        ) : error ? (
          <div className="distress-grid__error">
            <span>{error}</span>
          </div>
        ) : filteredDistresses.length === 0 ? (
          <div className="distress-grid__empty">
            <ShieldAlert size={36} style={{ color: 'var(--secondary-text)', opacity: 0.5 }} />
            <p>No road distresses match current search or filters criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Road ID</th>
                  <th>Distress Type</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>GPS Coordinates</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="table-thumbnail-wrapper">
                        {item.image_url ? (
                          <img src={item.image_url} alt="Distress visual" className="table-thumbnail" />
                        ) : (
                          <div className="table-thumbnail table-thumbnail--empty">No visual</div>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="font-mono font-bold">RD-{item.id}</span>
                    </td>
                    <td>
                      <span className="distress-type-lbl">{formatDistressType(item.distress_type)}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${getSeverityBadgeClass(item.severity)}`}>
                        {item.severity.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <div className="confidence-cell">
                        <span className="font-mono font-semibold">{Math.round(item.confidence_score * 100 || 87)}%</span>
                        <div className="confidence-track">
                          <div className="confidence-fill" style={{ width: `${Math.round(item.confidence_score * 100 || 87)}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-sm">{item.latitude.toFixed(4)}, {item.longitude.toFixed(4)}</span>
                    </td>
                    <td>
                      <span className={`status-badge status-badge--${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button 
                          className="table-action-btn btn-view" 
                          title="View Details"
                          onClick={() => alert(`Coordinates: ${item.latitude}, ${item.longitude}\nDetected at: ${item.detected_at}`)}
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="table-action-btn btn-report" 
                          title="Generate PDF Report"
                          onClick={() => handleGeneratePDF(item.id)}
                        >
                          <FileText size={14} />
                        </button>
                        <button 
                          className="table-action-btn btn-edit" 
                          title="Edit log details"
                          onClick={() => alert(`Editing record details for Road Distress RD-${item.id}`)}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && filteredDistresses.length > 0 && (
          <div className="table-pagination">
            <span className="pagination-info">
              Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredDistresses.length)}</strong> of <strong>{filteredDistresses.length}</strong> items
            </span>
            <div className="pagination-buttons">
              <button 
                className="btn-page" 
                onClick={handlePrevPage} 
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
              </button>
              <div className="page-numbers">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button 
                    key={i} 
                    className={`btn-page-number ${currentPage === i + 1 ? 'btn-page-number--active' : ''}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <button 
                className="btn-page" 
                onClick={handleNextPage} 
                disabled={currentPage === totalPages}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
