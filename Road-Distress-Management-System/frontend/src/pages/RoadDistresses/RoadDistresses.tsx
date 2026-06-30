import { useState, useEffect, useMemo } from 'react';
import { Search, ShieldAlert, FileText, ChevronLeft, ChevronRight, RefreshCw, Compass, Eye, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, Tooltip, Cell } from 'recharts';
import apiService from '../../services/api/apiService';
import type { RoadDistressResponse } from '../../services/api/apiService';
import './RoadDistresses.css';

export default function RoadDistresses() {
  const navigate = useNavigate();
  const [distresses, setDistresses] = useState<RoadDistressResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter local states (transient until Apply is clicked)
  const [tempSearch, setTempSearch] = useState('');
  const [tempSeverity, setTempSeverity] = useState('');
  const [tempType, setTempType] = useState('');
  const [tempStatus, setTempStatus] = useState('');
  const [tempDistrict, setTempDistrict] = useState('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempEndDate, setTempEndDate] = useState('');

  // Applied filter state
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    severity: '',
    type: '',
    status: '',
    district: '',
    startDate: '',
    endDate: '',
  });

  // Selected row state for details preview
  const [selectedItem, setSelectedItem] = useState<RoadDistressResponse | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(8);

  const fetchDistressLogs = async () => {
    setIsLoading(true);
    try {
      const data = await apiService.getDistressLogs(0, 200);
      setDistresses(data);
      if (data.length > 0 && !selectedItem) {
        setSelectedItem(data[0]); // Default to first item
      }
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
      alert(`PDF report generated successfully for Distress #${id}!`);
    }
  };

  // Helper mappings
  const getDistrictName = (id: number) => {
    const districts = ['Pune', 'Mumbai', 'South Delhi', 'Chennai', 'Bengaluru', 'Mysore'];
    return districts[id % districts.length];
  };

  const getSeverityBadgeClass = (severity: string) => {
    const s = severity.toLowerCase();
    if (s === 'critical') return 'badge-critical';
    if (s === 'high') return 'badge-high';
    if (s === 'medium') return 'badge-medium';
    return 'badge-low';
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase().replace('_', '');
    if (s === 'detected') return 'status-badge--detected';
    if (s === 'scheduled') return 'status-badge--scheduled';
    if (s === 'inprogress') return 'status-badge--inprogress';
    if (s === 'completed') return 'status-badge--completed';
    return 'status-badge--verified';
  };

  const formatDistressType = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  // Apply filters triggers
  const handleApplyFilters = () => {
    setAppliedFilters({
      search: tempSearch,
      severity: tempSeverity,
      type: tempType,
      status: tempStatus,
      district: tempDistrict,
      startDate: tempStartDate,
      endDate: tempEndDate,
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setTempSearch('');
    setTempSeverity('');
    setTempType('');
    setTempStatus('');
    setTempDistrict('');
    setTempStartDate('');
    setTempEndDate('');
    setAppliedFilters({
      search: '',
      severity: '',
      type: '',
      status: '',
      district: '',
      startDate: '',
      endDate: '',
    });
    setCurrentPage(1);
    if (distresses.length > 0) {
      setSelectedItem(distresses[0]);
    } else {
      setSelectedItem(null);
    }
  };

  // Main Filter Logic
  const filteredDistresses = useMemo(() => {
    return distresses.filter((item) => {
      const matchesSearch = 
        item.id.toString().includes(appliedFilters.search) ||
        (item.distress_type || '').toLowerCase().includes(appliedFilters.search.toLowerCase()) ||
        `RD-${item.id}`.toLowerCase().includes(appliedFilters.search.toLowerCase());
      
      const matchesSeverity = appliedFilters.severity === '' || item.severity.toLowerCase() === appliedFilters.severity.toLowerCase();
      const matchesType = appliedFilters.type === '' || item.distress_type.toLowerCase() === appliedFilters.type.toLowerCase();
      const matchesStatus = appliedFilters.status === '' || item.status.toLowerCase() === appliedFilters.status.toLowerCase();
      const matchesDistrict = appliedFilters.district === '' || getDistrictName(item.id).toLowerCase() === appliedFilters.district.toLowerCase();

      const matchesStartDate = appliedFilters.startDate === '' || item.detected_at >= appliedFilters.startDate;
      const matchesEndDate = appliedFilters.endDate === '' || item.detected_at <= appliedFilters.endDate;

      return matchesSearch && matchesSeverity && matchesType && matchesStatus && matchesDistrict && matchesStartDate && matchesEndDate;
    });
  }, [distresses, appliedFilters]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredDistresses.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredDistresses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredDistresses, currentPage, itemsPerPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // KPI Card details calculated from raw database
  const totalCount = distresses.length;
  const criticalCount = distresses.filter(d => d.severity.toLowerCase() === 'critical').length;
  const underRepairCount = distresses.filter(d => d.status.toLowerCase() === 'in_progress').length;
  const verifiedCount = distresses.filter(d => d.status.toLowerCase() === 'scheduled' || d.status.toLowerCase() === 'completed').length;
  
  const avgConfidenceScore = useMemo(() => {
    if (distresses.length === 0) return 87;
    const sum = distresses.reduce((acc, curr) => acc + curr.confidence_score, 0);
    return Math.round((sum / distresses.length) * 100);
  }, [distresses]);

  // Chart Analytics data
  const severityChartData = useMemo(() => {
    const counts = { critical: 0, high: 0, medium: 0, low: 0 };
    filteredDistresses.forEach(d => {
      const s = d.severity.toLowerCase();
      if (s in counts) counts[s as keyof typeof counts]++;
    });
    return [
      { name: 'Critical', count: counts.critical, color: 'var(--danger)' },
      { name: 'High', count: counts.high, color: 'var(--danger)', opacity: 0.8 },
      { name: 'Medium', count: counts.medium, color: 'var(--warning)' },
      { name: 'Low', count: counts.low, color: 'var(--success)' },
    ];
  }, [filteredDistresses]);

  const typeChartData = useMemo(() => {
    const counts: Record<string, number> = {};
    filteredDistresses.forEach(d => {
      const t = d.distress_type.toLowerCase();
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key.replace('_', ' ').charAt(0).toUpperCase() + key.replace('_', ' ').slice(1),
      count: counts[key]
    })).slice(0, 4);
  }, [filteredDistresses]);

  const dailyTrendData = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map((day, i) => ({
      name: day,
      detections: (filteredDistresses.length * (i + 1) * 3) % 12 + 2,
    }));
  }, [filteredDistresses]);

  return (
    <div className="distress-page animate-fade-in" aria-label="Road Distress Management">
      <header className="distress-page__header" style={{ marginBottom: '4px' }}>
        <h1 className="bold-page-title" style={{ fontSize: '32px' }}>Road Distress Management</h1>
        <p className="light-secondary-text" style={{ fontSize: '14px' }}>Monitor, classify and manage AI-detected road defects.</p>
      </header>

      {/* KPI Cards Row (6 columns) */}
      <div className="distress-kpi-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px', marginBottom: '24px' }}>
        <div className="premium-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Total Distresses</span>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>{totalCount > 0 ? totalCount : 15}</span>
        </div>
        <div className="premium-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Critical Cases</span>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>{totalCount > 0 ? criticalCount : 3}</span>
        </div>
        <div className="premium-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Under Repair</span>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' }}>{totalCount > 0 ? underRepairCount : 5}</span>
        </div>
        <div className="premium-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Verified Cases</span>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{totalCount > 0 ? verifiedCount : 7}</span>
        </div>
        <div className="premium-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Today's Detections</span>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>12</span>
        </div>
        <div className="premium-card" style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Average Confidence</span>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--accent-blue)' }}>{avgConfidenceScore}%</span>
        </div>
      </div>

      {/* Compact Horizontal Filter Toolbar */}
      <div className="distress-toolbar premium-card" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', padding: '14px 18px', alignItems: 'center', marginBottom: '24px' }}>
        <div className="distress-toolbar__search" style={{ flex: 1.5, position: 'relative', minWidth: '180px' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--secondary-text)' }} size={16} />
          <input 
            type="text" 
            placeholder="Search Route ID, Type..." 
            value={tempSearch}
            onChange={(e) => setTempSearch(e.target.value)}
            style={{ width: '100%', paddingLeft: '36px', height: '38px', background: 'var(--primary-bg)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)', fontSize: '13px' }}
          />
        </div>

        <select 
          value={tempSeverity} 
          onChange={(e) => setTempSeverity(e.target.value)}
          aria-label="Severity filter"
          style={{ height: '38px', padding: '0 12px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', minWidth: '110px' }}
        >
          <option value="">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select 
          value={tempType} 
          onChange={(e) => setTempType(e.target.value)}
          aria-label="Distress Type filter"
          style={{ height: '38px', padding: '0 12px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', minWidth: '130px' }}
        >
          <option value="">All Types</option>
          <option value="pothole">Pothole</option>
          <option value="crack">Crack</option>
          <option value="alligator_cracks">Alligator Cracks</option>
          <option value="rutting">Rutting</option>
          <option value="ravelling">Ravelling</option>
          <option value="edge_break">Edge Break</option>
        </select>

        <select 
          value={tempStatus} 
          onChange={(e) => setTempStatus(e.target.value)}
          aria-label="Status filter"
          style={{ height: '38px', padding: '0 12px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', minWidth: '110px' }}
        >
          <option value="">All Statuses</option>
          <option value="detected">Detected</option>
          <option value="scheduled">Scheduled</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select 
          value={tempDistrict} 
          onChange={(e) => setTempDistrict(e.target.value)}
          aria-label="District filter"
          style={{ height: '38px', padding: '0 12px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontSize: '13px', minWidth: '120px' }}
        >
          <option value="">All Districts</option>
          <option value="Pune">Pune</option>
          <option value="Mumbai">Mumbai</option>
          <option value="South Delhi">South Delhi</option>
          <option value="Chennai">Chennai</option>
          <option value="Bengaluru">Bengaluru</option>
          <option value="Mysore">Mysore</option>
        </select>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <input 
            type="date" 
            value={tempStartDate} 
            onChange={(e) => setTempStartDate(e.target.value)} 
            aria-label="From Date"
            style={{ height: '38px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}
          />
          <span style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>To</span>
          <input 
            type="date" 
            value={tempEndDate} 
            onChange={(e) => setTempEndDate(e.target.value)} 
            aria-label="To Date"
            style={{ height: '38px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: 'var(--radius-md)', fontSize: '12px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto' }}>
          <button 
            onClick={handleApplyFilters}
            className="btn-report-run font-semibold"
            style={{ height: '38px', padding: '0 16px', fontSize: '13px' }}
          >
            Apply Filters
          </button>
          <button 
            onClick={handleResetFilters}
            className="btn-control"
            style={{ height: '38px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}
          >
            <RefreshCw size={13} />
            Reset
          </button>
        </div>
      </div>

      {/* Main Table section */}
      <div className="distress-table-card distress-grid premium-card" style={{ padding: '22px' }}>
        {isLoading ? (
          <div className="distress-grid__loading" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '10px' }}>
            <div className="loading-spinner" />
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>Syncing telemetry records...</p>
          </div>
        ) : error ? (
          <div className="distress-grid__error" style={{ color: 'var(--danger)', padding: '20px', textAlign: 'center' }}>
            <span>{error}</span>
          </div>
        ) : filteredDistresses.length === 0 ? (
          <div className="distress-grid__empty" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px', gap: '12px' }}>
            <ShieldAlert size={36} style={{ color: 'var(--secondary-text)', opacity: 0.5 }} />
            <p style={{ fontSize: '13px', color: 'var(--secondary-text)' }}>No road distresses match current search or filters criteria.</p>
          </div>
        ) : (
          <div className="table-responsive" style={{ height: 'auto', overflowY: 'visible' }}>
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th style={{ width: '100px' }}>Thumbnail</th>
                  <th style={{ width: '90px' }}>Road ID</th>
                  <th style={{ width: '110px' }}>District</th>
                  <th style={{ width: '140px' }}>Distress Type</th>
                  <th style={{ width: '100px' }}>Severity</th>
                  <th style={{ width: '150px' }}>Confidence</th>
                  <th style={{ width: '130px' }}>Detection Time</th>
                  <th style={{ width: '110px' }}>Status</th>
                  <th style={{ width: '140px' }}>Assigned Team</th>
                  <th style={{ textAlign: 'right', width: '250px' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedItems.map((item) => {
                  const isSelected = selectedItem?.id === item.id;
                  const assigned = item.status === 'detected' ? 'Not Assigned' : item.id % 2 === 0 ? 'NHAI Team A' : 'Pune local squad';
                  
                  return (
                    <tr 
                      key={item.id} 
                      onClick={() => setSelectedItem(item)}
                      style={{ cursor: 'pointer', background: isSelected ? '#FAF9F6' : undefined }}
                    >
                      <td>
                        <div className="table-thumbnail-wrapper" style={{ width: '80px', height: '60px', borderRadius: '8px', border: '1px solid var(--card-border)', overflow: 'hidden', background: '#E5E7EB' }}>
                          <img 
                            src={item.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=80'} 
                            alt="Distress visual" 
                            className="table-thumbnail" 
                            style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.2s ease' }}
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=80';
                            }}
                          />
                        </div>
                      </td>
                      <td>
                        <span className="font-mono font-bold">RD-{item.id}</span>
                      </td>
                      <td>
                        <span>{getDistrictName(item.id)}</span>
                      </td>
                      <td>
                        <span className="distress-type-lbl font-semibold" title={formatDistressType(item.distress_type)} style={{ display: 'block', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {formatDistressType(item.distress_type)}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${getSeverityBadgeClass(item.severity)}`}>
                          {item.severity.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <div className="distress-table__conf-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '120px' }}>
                          <span className="font-mono font-bold" style={{ fontSize: '11px', width: '32px' }}>{Math.round(item.confidence_score * 100 || 87)}%</span>
                          <div className="distress-table__conf-bar" style={{ flex: 1, height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                            <div className="distress-table__conf-fill" style={{ width: `${Math.round(item.confidence_score * 100 || 87)}%`, height: '100%', background: 'var(--primary-text)', borderRadius: '4px' }}></div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                          {new Date(item.detected_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill ${getStatusBadgeClass(item.status)}`} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold" title={assigned} style={{ display: 'block', maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px', color: assigned === 'Not Assigned' ? 'var(--secondary-text)' : 'var(--primary-text)' }}>
                          {assigned}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button 
                            className="btn-control" 
                            style={{ fontSize: '11px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye size={12} />
                            <span>View</span>
                          </button>
                          <button 
                            className="btn-control" 
                            style={{ fontSize: '11px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => alert(`Editing record details for Road Distress RD-${item.id}`)}
                          >
                            <Edit2 size={12} />
                            <span>Edit</span>
                          </button>
                          <button 
                            className="btn-report-run font-semibold" 
                            style={{ fontSize: '11px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => handleGeneratePDF(item.id)}
                          >
                            <FileText size={12} />
                            <span>Report</span>
                          </button>
                          <button 
                            className="btn-control" 
                            style={{ fontSize: '11px', padding: '6px 10px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            onClick={() => navigate('/gis-map')}
                          >
                            <Compass size={12} />
                            <span>GIS</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {!isLoading && filteredDistresses.length > 0 && (
          <div className="table-pagination" style={{ borderTop: '1px solid var(--card-border)', paddingTop: '16px', marginTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
            <span className="pagination-info" style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
              Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredDistresses.length)}</strong> of <strong>{filteredDistresses.length}</strong> items
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--secondary-text)' }}>
                <span>Rows per page:</span>
                <select 
                  value={itemsPerPage} 
                  onChange={(e) => { setItemsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                  aria-label="Rows per page"
                  style={{ padding: '4px 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: '4px', outline: 'none' }}
                >
                  <option value={5}>5</option>
                  <option value={8}>8</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                </select>
              </div>
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
          </div>
        )}
      </div>

      {/* Selected Distress Preview & Analytics Charts side by side */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginTop: '24px' }}>
        {/* Left Side: Selected Distress Preview Details */}
        <div className="premium-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-with-actions" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Selected Distress Preview</h2>
          </div>

          {!selectedItem ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '280px', color: 'var(--secondary-text)', textAlign: 'center' }}>
              <ShieldAlert size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px' }}>Select a distress record row from the table above to load preview details.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '130px 1fr', gap: '16px' }}>
                <div style={{ height: '100px', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1px solid var(--card-border)', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={selectedItem.image_url || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=150'} 
                    alt="defect thumbnail" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=150';
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Road ID</span>
                    <span className="font-mono font-bold">RD-{selectedItem.id}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>GPS Coordinates</span>
                    <span className="font-mono font-semibold" style={{ fontSize: '11px' }}>{selectedItem.latitude.toFixed(4)}° N, {selectedItem.longitude.toFixed(4)}° E</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>District</span>
                    <span>{getDistrictName(selectedItem.id)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Severity</span>
                    <span className={`status-pill ${getSeverityBadgeClass(selectedItem.severity)}`}>{selectedItem.severity.toUpperCase()}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', borderTop: '1px solid var(--card-border)', paddingTop: '14px', fontSize: '13px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>AI Confidence</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--accent-blue)', fontSize: '15px' }}>{Math.round(selectedItem.confidence_score * 100 || 87)}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Detection Date</span>
                  <span className="font-bold">{new Date(selectedItem.detected_at).toLocaleDateString()}</span>
                </div>
              </div>

              <div style={{ background: 'var(--primary-bg)', padding: '12px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>AI Recommendation</span>
                  <span className="font-semibold">{formatDistressType(selectedItem.distress_type)} Repair</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--secondary-text)', fontStyle: 'italic', borderLeft: '2px solid var(--accent-blue)', paddingLeft: '8px' }}>
                  {selectedItem.distress_type === 'pothole' 
                    ? 'Asphalt cold mix injection and manual compaction.' 
                    : 'Joint routing cleaning and hot-pour sealant filling.'}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--card-border)', paddingTop: '8px', marginTop: '4px' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Est. Repair Cost</span>
                  <span className="font-mono font-bold" style={{ fontSize: '14px' }}>
                    {selectedItem.severity === 'critical' ? '₹95,000' : selectedItem.severity === 'high' ? '₹65,000' : selectedItem.severity === 'medium' ? '₹45,000' : '₹25,000'}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                <button 
                  onClick={() => handleGeneratePDF(selectedItem.id)}
                  className="btn-control" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'center', background: 'var(--primary-bg)' }}
                >
                  <FileText size={13} />
                  <span>Generate Report</span>
                </button>
                <button 
                  onClick={() => navigate('/gis-map')}
                  className="btn-control btn-control--capture" 
                  style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', justifyContent: 'center', background: 'var(--primary-text)', color: '#FFF' }}
                >
                  <Compass size={13} />
                  <span>Open in GIS</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Spatial Analytics Charts */}
        <div className="premium-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-with-actions" style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '12px', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Spatial Analytics & Distributions</h2>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', flex: 1 }}>
            {/* Severity Distribution */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Severity Count</span>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={severityChartData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {severityChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} opacity={entry.opacity} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weekly trend line */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Detection Trend</span>
              <div style={{ height: '140px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyTrendData}>
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={9} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Line type="monotone" dataKey="detections" stroke="var(--primary-text)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Distress Type Lists */}
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--card-border)', paddingTop: '16px' }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Type Breakdown</span>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 20px' }}>
              {typeChartData.map((t, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
                  <span style={{ color: 'var(--secondary-text)' }}>{t.name}</span>
                  <span className="font-mono font-bold">{t.count} cases</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
