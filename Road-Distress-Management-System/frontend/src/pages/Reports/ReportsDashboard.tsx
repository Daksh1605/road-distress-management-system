import { useState, useMemo, useEffect } from 'react';
import apiService from '../../services/api/apiService';
import {
  FileText,
  Calendar,
  Clock,
  FileCheck,
  Search,
  RefreshCw,
  Share2,
  Trash2,
  Table2,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './ReportsDashboard.css';

interface ReportItem {
  id: string;
  roadId: string;
  district: string;
  distressType: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  generatedDate: string;
  status: 'Approved' | 'Exported' | 'Under Review' | 'Draft';
  filepath?: string;
  reportId?: number;
  reportType?: string;
}

const SEVERITY_COLORS: Record<string, string> = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#FACC15',
  Low: '#3B82F6',
};

const SEVERITY_MAP: Record<string, ReportItem['severity']> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

export default function ReportsDashboard() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  // Search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [severityFilter, setSeverityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Generator configuration states
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [filtersState, setFiltersState] = useState({
    state: '',
    district: '',
    distressType: '',
    severity: '',
    startDate: '2026-06-01',
    endDate: '2026-06-18',
  });
  
  const [activePreviewSummary, setActivePreviewSummary] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);
  const [isCompilingExcel, setIsCompilingExcel] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const loadDashboardData = async () => {
    try {
      const [reportsData, videosData] = await Promise.all([
        apiService.getReports(),
        apiService.getVideos(),
      ]);
      
      const mappedReports = reportsData.map((rep) => {
        const match = rep.report_name.match(/Video_(\d+)/i);
        let roadId = 'NH-48';
        let district = 'Mumbai';
        let distressType = 'Pothole';
        let severity: ReportItem['severity'] = 'High';

        if (match) {
          const vidId = parseInt(match[1]);
          const associatedVid = videosData.find((v) => v.id === vidId);
          if (associatedVid) {
            roadId = `Road-${associatedVid.id}`;
            const districts = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Satara'];
            district = districts[vidId % districts.length];
            const distressTypes = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Patch'];
            distressType = distressTypes[vidId % distressTypes.length];
            const severities: ReportItem['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
            severity = severities[vidId % severities.length];
          }
        }

        return {
          id: rep.report_name,
          roadId,
          district,
          distressType,
          severity,
          generatedDate: rep.generated_at ? rep.generated_at.split('T')[0] : rep.created_at.split('T')[0],
          status: rep.filepath ? ('Exported' as const) : ('Approved' as const),
          filepath: rep.filepath || undefined,
          reportId: rep.id,
          reportType: rep.report_type || 'PDF',
        };
      });

      setReports(mappedReports);
      setVideos(videosData);
      
      // Seed default active preview summary
      if (mappedReports.length > 0) {
        setActivePreviewSummary({
          id: mappedReports[0].id,
          generatedAt: mappedReports[0].generatedDate,
          totalDistresses: 42,
          criticalCount: 5,
          highSeverityCount: 14,
          roadsAffected: 4,
          topDistressType: mappedReports[0].distressType,
          averageConfidence: 92.4,
          estimatedRepairCost: '₹1.8L',
          filters: {
            state: 'Maharashtra',
            district: mappedReports[0].district,
            distressType: mappedReports[0].distressType.toLowerCase(),
            severity: mappedReports[0].severity.toLowerCase(),
          }
        });
      }
    } catch (err) {
      console.error("Failed to load reports:", err);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleGeneratePdfReport = async () => {
    if (!selectedVideoId) return;
    setIsCompiling(true);
    try {
      const vidId = Number(selectedVideoId);
      const newReport = await apiService.generatePDFReport(vidId);
      
      const roadId = `Road-${vidId}`;
      const districts = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Satara'];
      const district = districts[vidId % districts.length];
      const distressTypes = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Patch'];
      const distressType = distressTypes[vidId % distressTypes.length];
      const severities: ReportItem['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
      const severity = severities[vidId % severities.length];

      const newItem: ReportItem = {
        id: newReport.report_name,
        roadId,
        district,
        distressType,
        severity,
        generatedDate: newReport.generated_at ? newReport.generated_at.split('T')[0] : newReport.created_at.split('T')[0],
        status: newReport.filepath ? ('Exported' as const) : ('Approved' as const),
        filepath: newReport.filepath || undefined,
        reportId: newReport.id,
        reportType: 'PDF',
      };

      setReports((prev) => [newItem, ...prev]);
      setActivePreviewSummary({
        id: newItem.id,
        generatedAt: newItem.generatedDate,
        totalDistresses: 32,
        criticalCount: 4,
        highSeverityCount: 12,
        roadsAffected: 3,
        topDistressType: newItem.distressType,
        averageConfidence: 94.2,
        estimatedRepairCost: '₹1.4L',
        filters: { state: 'Maharashtra', district, distressType, severity: severity.toLowerCase() }
      });
      setSelectedVideoId('');
    } catch (err) {
      console.error(err);
      alert("Error compiling report from run data.");
    } finally {
      setIsCompiling(false);
    }
  };

  const handleGenerateExcelReport = async () => {
    if (!selectedVideoId) return;
    setIsCompilingExcel(true);
    try {
      const vidId = Number(selectedVideoId);
      const newReport = await apiService.generateExcelReport(vidId);

      const roadId = `Road-${vidId}`;
      const districts = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Satara'];
      const district = districts[vidId % districts.length];
      const distressTypes = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Patch'];
      const distressType = distressTypes[vidId % distressTypes.length];
      const severities: ReportItem['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
      const severity = severities[vidId % severities.length];

      const newItem: ReportItem = {
        id: newReport.report_name,
        roadId,
        district,
        distressType,
        severity,
        generatedDate: newReport.generated_at ? newReport.generated_at.split('T')[0] : newReport.created_at.split('T')[0],
        status: newReport.filepath ? ('Exported' as const) : ('Approved' as const),
        filepath: newReport.filepath || undefined,
        reportId: newReport.id,
        reportType: 'EXCEL',
      };

      setReports((prev) => [newItem, ...prev]);
      setSelectedVideoId('');
    } catch (err) {
      console.error(err);
      alert("Error compiling Excel report.");
    } finally {
      setIsCompilingExcel(false);
    }
  };

  const handleDeleteReport = async (reportItem: ReportItem) => {
    if (!confirm("Are you sure you want to delete this report from server registry?")) return;
    if (reportItem.reportId !== undefined) {
      try {
        await apiService.deleteReport(reportItem.reportId);
        setReports((prev) => prev.filter((r) => r.reportId !== reportItem.reportId));
        if (activePreviewSummary?.id === reportItem.id) {
          setActivePreviewSummary(null);
        }
      } catch (err) {
        console.error(err);
      }
    } else {
      setReports((prev) => prev.filter((r) => r.id !== reportItem.id));
    }
  };

  // Run filters
  const filteredReports = useMemo(() => {
    return reports.filter((r) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        r.id.toLowerCase().includes(query) ||
        r.roadId.toLowerCase().includes(query) ||
        r.district.toLowerCase().includes(query);
      const matchesType = typeFilter === 'All' || r.reportType === typeFilter;
      const matchesSeverity = severityFilter === 'All' || r.severity === severityFilter;
      const matchesStatus = statusFilter === 'All' || r.status === statusFilter;
      return matchesSearch && matchesType && matchesSeverity && matchesStatus;
    });
  }, [reports, searchQuery, typeFilter, severityFilter, statusFilter]);

  // Paginated list
  const totalPages = Math.max(1, Math.ceil(filteredReports.length / itemsPerPage));
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredReports.slice(start, start + itemsPerPage);
  }, [filteredReports, currentPage]);

  // KPI calculations
  const kpis = useMemo(() => {
    const total = reports.length;
    const pendingReview = reports.filter(r => r.status === 'Under Review').length || 2;
    const exportedReports = reports.filter(r => r.status === 'Exported').length;
    const todayCount = reports.filter(r => r.generatedDate === '2026-06-30').length || 3;
    
    return {
      total,
      todayCount,
      pendingReview,
      scheduled: 4,
      exportedReports,
      storageUsed: '4.2 MB'
    };
  }, [reports]);

  // Recharts Pie Chart Category Data
  const pieChartData = useMemo(() => {
    const counts: Record<string, number> = { Pothole: 0, Crack: 0, Rutting: 0, Patch: 0 };
    reports.forEach((r) => {
      const type = r.distressType.replace(/\s/g, '');
      if (type.includes('Pothole')) counts.Pothole++;
      else if (type.includes('Crack')) counts.Crack++;
      else if (type.includes('Rutting')) counts.Rutting++;
      else counts.Patch++;
    });
    return [
      { name: 'Potholes', value: counts.Pothole || 3, color: '#EF4444' },
      { name: 'Cracks', value: counts.Crack || 4, color: '#F97316' },
      { name: 'Rutting', value: counts.Rutting || 2, color: '#FACC15' },
      { name: 'Patches', value: counts.Patch || 2, color: '#10B981' },
    ];
  }, [reports]);

  const handleGenerateConfigReport = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const mockSummary = {
        id: `REP-${Math.random().toString(36).substring(3, 9).toUpperCase()}`,
        generatedAt: new Date().toISOString().split('T')[0],
        totalDistresses: 54,
        criticalCount: 6,
        highSeverityCount: 16,
        roadsAffected: 5,
        topDistressType: filtersState.distressType ? formatDistressType(filtersState.distressType) : 'Pothole',
        averageConfidence: 91.8,
        estimatedRepairCost: '₹2.1L',
        filters: { ...filtersState }
      };

      const newItem: ReportItem = {
        id: mockSummary.id,
        roadId: 'NH-48',
        district: filtersState.district || 'Pune',
        distressType: mockSummary.topDistressType,
        severity: (filtersState.severity ? SEVERITY_MAP[filtersState.severity] : 'High') as any,
        generatedDate: mockSummary.generatedAt,
        status: 'Approved',
        reportType: 'PDF'
      };

      setReports(prev => [newItem, ...prev]);
      setActivePreviewSummary(mockSummary);
      setIsGenerating(false);
    }, 1000);
  };

  const formatDistressType = (type: string) => {
    return type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1);
  };

  return (
    <div className="rep-dash animate-fade-in" aria-label="Reports Center">
      <header className="rep-dash__header" style={{ marginBottom: '4px' }}>
        <h1 className="bold-page-title" style={{ fontSize: '32px' }}>Reports Center</h1>
        <p className="light-secondary-text" style={{ fontSize: '14px' }}>Generate, manage, preview and export AI-generated road distress reports.</p>
      </header>

      {/* KPI Cards Row (6 columns) */}
      <section className="rep-dash__kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px', marginBottom: '24px' }} aria-label="Reports statistics summary">
        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Total Reports</span>
            <FileText size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>{kpis.total}</span>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Generated Today</span>
            <Calendar size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>{kpis.todayCount}</span>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Pending Reviews</span>
            <Clock size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--warning)' }}>{kpis.pendingReview}</span>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Scheduled Reports</span>
            <FileCheck size={16} style={{ color: 'var(--success)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>{kpis.scheduled}</span>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Exported Reports</span>
            <FileCheck size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>{kpis.exportedReports}</span>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Storage Used</span>
            <FileText size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>{kpis.storageUsed}</span>
        </div>
      </section>

      {/* Main Workspace: Left 70% generated reports archive, Right 30% analytics panel */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Reports Table */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Generated Reports Archive</h2>
            <button className="btn-control" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }} onClick={loadDashboardData}>
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Table Filters */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', background: 'var(--primary-bg)', padding: '10px 14px', borderRadius: 'var(--radius-md)', border: '1px solid var(--card-border)', marginBottom: '16px' }}>
            <div style={{ flex: 1.5, position: 'relative', minWidth: '150px' }}>
              <Search size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--secondary-text)' }} />
              <input 
                type="text" 
                placeholder="Search Report ID, Route..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', paddingLeft: '32px', height: '34px', border: '1px solid var(--card-border)', background: 'white', borderRadius: '6px', fontSize: '12px' }}
              />
            </div>
            
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              aria-label="Format filter"
              style={{ height: '34px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'white', borderRadius: '6px', fontSize: '12px', minWidth: '110px' }}
            >
              <option value="All">All Formats</option>
              <option value="PDF">PDF</option>
              <option value="EXCEL">EXCEL</option>
            </select>

            <select 
              value={severityFilter} 
              onChange={(e) => setSeverityFilter(e.target.value)}
              aria-label="Severity filter"
              style={{ height: '34px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'white', borderRadius: '6px', fontSize: '12px', minWidth: '110px' }}
            >
              <option value="All">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Status filter"
              style={{ height: '34px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'white', borderRadius: '6px', fontSize: '12px', minWidth: '110px' }}
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Exported">Exported</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>

          {/* Table content */}
          <div className="table-responsive" style={{ height: 'auto', overflowY: 'visible' }}>
            <table className="enterprise-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Road ID</th>
                  <th>District</th>
                  <th>Distress Type</th>
                  <th>Severity</th>
                  <th>Generated Date</th>
                  <th>Status</th>
                  <th>Format</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedReports.length === 0 ? (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', color: 'var(--secondary-text)', padding: '24px' }}>No reports matching query filters found.</td>
                  </tr>
                ) : (
                  paginatedReports.map((item) => (
                    <tr key={item.id} style={{ cursor: 'pointer' }} onClick={() => {
                      setActivePreviewSummary({
                        id: item.id,
                        generatedAt: item.generatedDate,
                        totalDistresses: 45,
                        criticalCount: 4,
                        highSeverityCount: 15,
                        roadsAffected: 3,
                        topDistressType: item.distressType,
                        averageConfidence: 93.4,
                        estimatedRepairCost: '₹1.6L',
                        filters: { state: 'Maharashtra', district: item.district, distressType: item.distressType.toLowerCase(), severity: item.severity.toLowerCase() }
                      });
                    }}>
                      <td>
                        <span className="font-mono font-bold" style={{ fontSize: '12px' }}>{item.id}</span>
                      </td>
                      <td>
                        <span className="font-mono font-bold">{item.roadId}</span>
                      </td>
                      <td>
                        <span>{item.district}</span>
                      </td>
                      <td>
                        <span className="font-semibold">{item.distressType}</span>
                      </td>
                      <td>
                        <span className={`status-pill badge-${item.severity.toLowerCase()}`}>{item.severity.toUpperCase()}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>{item.generatedDate}</span>
                      </td>
                      <td>
                        <span className={`status-pill status-pill--${item.status.toLowerCase().replace(/\s/g, '')}`} style={{ textTransform: 'capitalize', fontWeight: 600 }}>
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono font-bold" style={{ fontSize: '11px', color: 'var(--accent-blue)' }}>{item.reportType || 'PDF'}</span>
                      </td>
                      <td style={{ textAlign: 'right' }} onClick={(e) => e.stopPropagation()}>
                        <div className="table-actions" style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button className="btn-control" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => alert(`Previewing PDF Report data for ${item.id}`)}>
                            View
                          </button>
                          {item.filepath ? (
                            <a href={item.filepath} download className="btn-report-run font-semibold" style={{ fontSize: '11px', padding: '4px 8px', textDecoration: 'none' }}>
                              Download
                            </a>
                          ) : (
                            <button className="btn-report-run font-semibold" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => alert("Downloading compiled report data...")}>
                              Download
                            </button>
                          )}
                          <button className="btn-control" style={{ fontSize: '11px', padding: '4px 8px' }} onClick={() => alert(`Report link shared for defect ${item.id}`)}>
                            <Share2 size={11} />
                          </button>
                          <button className="btn-trash" onClick={() => handleDeleteReport(item)}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginator */}
          {filteredReports.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--card-border)', paddingTop: '14px', marginTop: 'auto' }}>
              <span style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>
                Showing <strong>{((currentPage - 1) * itemsPerPage) + 1}</strong> to <strong>{Math.min(currentPage * itemsPerPage, filteredReports.length)}</strong> of <strong>{filteredReports.length}</strong> reports
              </span>
              <div className="pagination-buttons">
                <button className="btn-page" disabled={currentPage === 1} onClick={() => setCurrentPage(p => Math.max(1, p - 1))}>
                  <ChevronLeft size={14} />
                </button>
                <span className="font-mono" style={{ fontSize: '12px', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
                <button className="btn-page" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right: Reports Analytics Panel */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', padding: 0 }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Reports Analytics</h2>
          </div>

          {/* Category Pie Chart */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Distress Type Distribution</span>
            <div style={{ height: '130px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={32}
                    outerRadius={48}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '9px' }}>
              {pieChartData.map(e => (
                <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                  <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: e.color }} />
                  <span style={{ color: 'var(--secondary-text)' }}>{e.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', borderTop: '1px solid var(--card-border)', paddingTop: '12px' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Severity Breakdown</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Object.entries(SEVERITY_COLORS).map(([name, color]) => {
                const count = reports.filter(r => r.severity === name).length || 3;
                return (
                  <div key={name} style={{ display: 'grid', gridTemplateColumns: '70px 1fr 20px', gap: '8px', alignItems: 'center', fontSize: '11px' }}>
                    <span style={{ color: 'var(--secondary-text)' }}>{name}</span>
                    <div style={{ height: '6px', background: '#E5E7EB', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min(100, (count / reports.length || 0.2) * 100)}%`, height: '100%', background: color, borderRadius: '3px' }} />
                    </div>
                    <span className="font-mono font-bold" style={{ textAlign: 'right' }}>{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: '12px', fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary-text)' }}>Avg. Compiling Speed:</span>
              <span className="font-bold">2.4 seconds</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--secondary-text)' }}>Export Queue Status:</span>
              <span className="font-bold" style={{ color: 'var(--success)' }}>Idle</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Report Generator (Responsive 2 Columns) */}
      <div className="premium-card" style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left Side: Configuration form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', padding: 0 }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Configure AI Reports Panel</h2>
          </div>

          {/* Video run selector */}
          {videos.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
              <label style={{ fontWeight: 600, color: 'var(--accent-blue)' }}>Select Completed Surveillance Run</label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <select 
                  value={selectedVideoId} 
                  onChange={(e) => setSelectedVideoId(e.target.value)}
                  aria-label="Surveillance runs selection dropdown"
                  style={{ flex: 1, height: '36px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: '6px', fontSize: '12px' }}
                >
                  <option value="">-- Choose Completed Video Run --</option>
                  {videos.filter(v => v.processing_status === 'completed').map(vid => (
                    <option key={vid.id} value={vid.id}>{vid.filename} (ID: {vid.id})</option>
                  ))}
                </select>
                <button 
                  className="btn-report-run font-semibold" 
                  disabled={!selectedVideoId || isCompiling} 
                  onClick={handleGeneratePdfReport}
                  style={{ height: '36px', padding: '0 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isCompiling ? <Loader2 size={13} className="animate-spin" /> : <FileText size={13} />}
                  <span>{isCompiling ? 'Compiling...' : 'PDF Report'}</span>
                </button>
                <button 
                  className="btn-control" 
                  disabled={!selectedVideoId || isCompilingExcel} 
                  onClick={handleGenerateExcelReport}
                  style={{ height: '36px', padding: '0 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isCompilingExcel ? <Loader2 size={13} className="animate-spin" /> : <Table2 size={13} />}
                  <span>{isCompilingExcel ? 'Compiling...' : 'Excel Report'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Filters Form */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '13px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>State</label>
              <select 
                value={filtersState.state} 
                onChange={(e) => setFiltersState(prev => ({ ...prev, state: e.target.value, district: '' }))}
                aria-label="State selector"
                style={{ height: '36px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="">All States</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Delhi">Delhi</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>District</label>
              <select 
                value={filtersState.district} 
                onChange={(e) => setFiltersState(prev => ({ ...prev, district: e.target.value }))}
                aria-label="District selector"
                style={{ height: '36px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="">All Districts</option>
                {filtersState.state === 'Maharashtra' && (
                  <>
                    <option value="Mumbai">Mumbai</option>
                    <option value="Pune">Pune</option>
                    <option value="Nagpur">Nagpur</option>
                    <option value="Thane">Thane</option>
                  </>
                )}
                {filtersState.state === 'Karnataka' && (
                  <>
                    <option value="Bengaluru">Bengaluru</option>
                    <option value="Mysore">Mysore</option>
                  </>
                )}
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Distress Type</label>
              <select 
                value={filtersState.distressType} 
                onChange={(e) => setFiltersState(prev => ({ ...prev, distressType: e.target.value }))}
                aria-label="Distress Type selector"
                style={{ height: '36px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="">All Types</option>
                <option value="pothole">Pothole</option>
                <option value="crack">Crack</option>
                <option value="rutting">Rutting</option>
                <option value="edge_break">Edge Break</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label>Severity</label>
              <select 
                value={filtersState.severity} 
                onChange={(e) => setFiltersState(prev => ({ ...prev, severity: e.target.value }))}
                aria-label="Severity selector"
                style={{ height: '36px', padding: '0 8px', border: '1px solid var(--card-border)', background: 'var(--primary-bg)', borderRadius: '6px', fontSize: '12px' }}
              >
                <option value="">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', borderTop: '1px solid var(--card-border)', paddingTop: '14px', marginTop: '4px' }}>
            <button className="btn-report-run font-semibold" style={{ height: '36px', padding: '0 16px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={handleGenerateConfigReport}>
              {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
              <span>{isGenerating ? 'Compiling Databank...' : 'Generate Custom Report'}</span>
            </button>
            <button className="btn-control" style={{ height: '36px', padding: '0 12px', fontSize: '12px' }} onClick={() => alert("Report scheduled for periodic generation weekly.")}>
              Schedule Report
            </button>
          </div>
        </div>

        {/* Right Side: Professional Report Preview */}
        <div style={{ borderLeft: '1px solid var(--card-border)', paddingLeft: '24px', display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', padding: 0, marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Live PDF Cover Preview</h2>
          </div>

          {!activePreviewSummary ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, color: 'var(--secondary-text)', textAlign: 'center', minHeight: '200px' }}>
              <FileText size={32} style={{ marginBottom: '10px', opacity: 0.5 }} />
              <p style={{ fontSize: '13px' }}>Select an archive record or generate one above to preview PDF cover sheets.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '16px', flex: 1 }}>
              {/* PDF Cover Illustration */}
              <div style={{ border: '1px solid var(--card-border)', borderRadius: '6px', padding: '10px', background: '#F8F9FA', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '170px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ borderBottom: '2px solid var(--primary-text)', paddingBottom: '4px', textAlign: 'center' }}>
                  <span style={{ fontSize: '8px', fontWeight: 'bold', display: 'block' }}>ROADVISION</span>
                  <span style={{ fontSize: '6px', color: 'var(--secondary-text)' }}>AI AUDIT REPORT</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                  <FileText size={24} style={{ color: 'var(--accent-blue)' }} />
                  <span style={{ fontSize: '7px', fontWeight: 'bold', textAlign: 'center' }}>{activePreviewSummary.id}</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ fontSize: '6px', color: 'var(--secondary-text)', display: 'block' }}>Generated at:</span>
                  <span style={{ fontSize: '6px', fontWeight: 'bold' }}>{activePreviewSummary.generatedAt}</span>
                </div>
              </div>

              {/* Cover text details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Estimated Pages</span>
                  <span className="font-bold">14 pages</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>File Footprint Size</span>
                  <span className="font-bold">1.8 MB</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--secondary-text)', fontWeight: 500 }}>Total Distresses Identified</span>
                  <span className="font-mono font-bold" style={{ color: 'var(--danger)' }}>{activePreviewSummary.totalDistresses} cases</span>
                </div>
                
                <div style={{ background: 'var(--primary-bg)', padding: '8px 10px', borderRadius: '4px', border: '1px solid var(--card-border)', marginTop: '4px' }}>
                  <span style={{ display: 'block', fontSize: '10px', fontWeight: 'bold', marginBottom: '2px' }}>Top distress category:</span>
                  <span style={{ fontSize: '11px', fontStyle: 'italic', color: 'var(--secondary-text)' }}>
                    {activePreviewSummary.topDistressType} &bull; Average speed index 2.4 sec.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Row 5: Bottom Section (Recent Report Activity) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
        {/* Recent Downloads */}
        <div className="premium-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '10px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Recent Downloads</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
              <span style={{ display: 'block', fontWeight: 600 }}>NH-48 Security Report.pdf</span>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Downloaded by Admin &bull; 2 min ago</span>
            </div>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
              <span style={{ display: 'block', fontWeight: 600 }}>SH-10 Sector Scan.xlsx</span>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Downloaded by Crew A &bull; 1 hr ago</span>
            </div>
          </div>
        </div>

        {/* Recently Emailed Reports */}
        <div className="premium-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '10px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Recently Emailed Reports</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
              <span style={{ display: 'block', fontWeight: 600 }}>NH-4 Pothole Audit</span>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Sent to planning@pwd.gov &bull; 3 hrs ago</span>
            </div>
          </div>
        </div>

        {/* Scheduled Reports */}
        <div className="premium-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '10px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Scheduled Reports</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '4px' }}>
              <span style={{ display: 'block', fontWeight: 600 }}>Weekly NH-48 Distress Audit</span>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>Every Monday at 08:00</span>
            </div>
          </div>
        </div>

        {/* Export Queue */}
        <div className="premium-card" style={{ padding: '16px 20px' }}>
          <span style={{ fontSize: '10px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>Export Queue</span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ borderBottom: '1px solid var(--card-border)', paddingBottom: '4px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ display: 'block', fontWeight: 600 }}>Structural Analysis</span>
                <span style={{ fontSize: '10px', color: 'var(--secondary-text)' }}>WO-2026-0142 &bull; PDF</span>
              </div>
              <span className="font-mono font-bold" style={{ color: 'var(--accent-blue)' }}>85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
