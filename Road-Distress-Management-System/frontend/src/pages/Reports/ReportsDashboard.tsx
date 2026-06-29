import { useState, useMemo, useEffect } from 'react';
import apiService from '../../services/api/apiService';
import {
  FileText,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import ReportsTable from '../../components/reports/ReportsTable';
import type { ReportItem } from '../../components/reports/ReportsTable';
import ReportGeneratorPanel from '../../components/reports/ReportGeneratorPanel';
import type { ReportSummary, ReportFilters } from '../../components/reports/ReportGeneratorPanel';
import './ReportsDashboard.css';

const SEVERITY_MAP: Record<string, ReportItem['severity']> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
};

const DISTRICT_ROAD_MAP: Record<string, string> = {
  Mumbai: 'NH-4',
  Pune: 'NH-48',
  Nagpur: 'NH-44',
  Thane: 'NH-48',
  Satara: 'SH-10',
};

function mapSummaryToReportItem(summary: ReportSummary): ReportItem {
  const district = summary.filters.district || 'Mumbai';
  const severity = summary.filters.severity
    ? SEVERITY_MAP[summary.filters.severity] ?? 'Medium'
    : summary.criticalCount >= summary.highSeverityCount
      ? 'Critical'
      : 'High';

  return {
    id: summary.id,
    roadId: DISTRICT_ROAD_MAP[district] ?? 'NH-48',
    district,
    distressType: summary.topDistressType,
    severity,
    generatedDate: summary.generatedAt.split('T')[0],
    status: 'Approved',
  };
}

export default function ReportsDashboard() {
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [videos, setVideos] = useState<any[]>([]);

  useEffect(() => {
    let active = true;
    async function loadDashboardData() {

      try {
        const [reportsData, videosData] = await Promise.all([
          apiService.getReports(),
          apiService.getVideos(),
        ]);
        if (!active) return;

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
            reportType: rep.report_type,
          };
        });

        setReports(mappedReports);
        setVideos(videosData);
      } catch (err) {
        console.error("Failed to load reports/videos:", err);
      }
    }
    loadDashboardData();

    return () => {
      active = false;
    };
  }, []);

  const handleGeneratePdfReport = async (videoId: number) => {
    try {
      const newReport = await apiService.generatePDFReport(videoId);

      const roadId = `Road-${videoId}`;
      const districts = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Satara'];
      const district = districts[videoId % districts.length];
      const distressTypes = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Patch'];
      const distressType = distressTypes[videoId % distressTypes.length];
      const severities: ReportItem['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
      const severity = severities[videoId % severities.length];

      const newReportItem: ReportItem = {
        id: newReport.report_name,
        roadId,
        district,
        distressType,
        severity,
        generatedDate: newReport.generated_at ? newReport.generated_at.split('T')[0] : newReport.created_at.split('T')[0],
        status: newReport.filepath ? ('Exported' as const) : ('Approved' as const),
        filepath: newReport.filepath || undefined,
        reportId: newReport.id,
      };

      setReports((prev) => [newReportItem, ...prev]);
    } catch (err) {
      console.error("Failed to generate PDF report:", err);
      alert("Error generating PDF report. Make sure the video is processed successfully.");
      throw err;
    }
  };

  const handleGenerateExcelReport = async (videoId: number) => {
    try {
      const newReport = await apiService.generateExcelReport(videoId);

      const roadId = `Road-${videoId}`;
      const districts = ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Satara'];
      const district = districts[videoId % districts.length];
      const distressTypes = ['Pothole', 'Alligator Cracks', 'Rutting', 'Edge Break', 'Patch'];
      const distressType = distressTypes[videoId % distressTypes.length];
      const severities: ReportItem['severity'][] = ['Critical', 'High', 'Medium', 'Low'];
      const severity = severities[videoId % severities.length];

      const newReportItem: ReportItem = {
        id: newReport.report_name,
        roadId,
        district,
        distressType,
        severity,
        generatedDate: newReport.generated_at ? newReport.generated_at.split('T')[0] : newReport.created_at.split('T')[0],
        status: newReport.filepath ? ('Exported' as const) : ('Approved' as const),
        filepath: newReport.filepath || undefined,
        reportId: newReport.id,
        reportType: newReport.report_type,
      };

      setReports((prev) => [newReportItem, ...prev]);
    } catch (err) {
      console.error("Failed to generate Excel report:", err);
      alert("Error generating Excel report. Make sure the video is processed successfully.");
      throw err;
    }
  };

  // Dynamic KPI Stats derived from database
  const stats = useMemo(() => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'Under Review' || r.status === 'Draft').length;
    const thisMonth = reports.filter(r => r.generatedDate.includes('-06-')).length; // match current month simply
    const exported = reports.filter(r => r.status === 'Exported' || r.status === 'Approved').length;

    return { total, pending, thisMonth, exported };
  }, [reports]);

  // Recharts Donut Distribution data based on distressType
  const pieData = useMemo(() => {
    const counts: Record<string, number> = {
      'Pothole': 0,
      'Alligator Cracks': 0,
      'Rutting': 0,
      'Edge Break': 0,
      'Patch': 0
    };

    reports.forEach(r => {
      if (counts[r.distressType] !== undefined) {
        counts[r.distressType]++;
      } else {
        counts[r.distressType] = 1;
      }
    });

    return [
      { name: 'Potholes', value: counts['Pothole'] || 0, color: '#ef4444' },
      { name: 'Alligator Cracks', value: counts['Alligator Cracks'] || 0, color: '#facc15' },
      { name: 'Rutting', value: counts['Rutting'] || 0, color: '#f59e0b' },
      { name: 'Edge Breaks', value: counts['Edge Break'] || 0, color: '#3b82f6' },
      { name: 'Patches', value: counts['Patch'] || 0, color: '#10b981' }
    ].filter(item => item.value > 0);
  }, [reports]);

  const handleGenerateReport = (_filters: ReportFilters, summary: ReportSummary) => {
    const reportToAdd = mapSummaryToReportItem(summary);
    setReports((prev) => [reportToAdd, ...prev]);
  };

  const markReportExported = (summary: ReportSummary) => {
    setReports((prev) =>
      prev.map((r) => (r.id === summary.id ? { ...r, status: 'Exported' as const } : r))
    );
  };

  const handleDeleteReport = async (id: string, reportId?: number) => {
    if (reportId !== undefined) {
      try {
        await apiService.deleteReport(reportId);
        setReports((prev) => prev.filter((r) => r.reportId !== reportId));
      } catch (err) {
        console.error("Failed to delete report from DB:", err);
      }
    } else {
      setReports((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="rep-dash">
      {/* Page Header */}
      <header className="rep-dash__header">
        <div className="rep-dash__header-title-group">
          <h1 className="rep-dash__title">Reports Center</h1>
          <p className="rep-dash__subtitle">
            Generate, manage and export road distress reports
          </p>
        </div>
      </header>

      {/* Row 1: KPI Stats Grid */}
      <section className="rep-dash__kpi-grid" aria-label="Reports statistics summary">
        {/* KPI: Total Reports */}
        <article className="rep-kpi-card" aria-label="Total Reports">
          <div className="rep-kpi-card__header">
            <span className="rep-kpi-card__label">Total Reports Generated</span>
            <div className="rep-kpi-card__icon text-purple">
              <FileText size={18} />
            </div>
          </div>
          <div className="rep-kpi-card__body">
            <span className="rep-kpi-card__value font-mono">{stats.total}</span>
            <div className="rep-kpi-card__trend text-green">
              <ArrowUpRight size={14} />
              <span>+18% cumulative</span>
            </div>
          </div>
          <div className="rep-kpi-card__glow-purple" />
        </article>

        {/* KPI: This Month */}
        <article className="rep-kpi-card" aria-label="Reports This Month">
          <div className="rep-kpi-card__header">
            <span className="rep-kpi-card__label">Reports This Month</span>
            <div className="rep-kpi-card__icon text-blue">
              <Calendar size={18} />
            </div>
          </div>
          <div className="rep-kpi-card__body">
            <span className="rep-kpi-card__value font-mono">{stats.thisMonth}</span>
            <div className="rep-kpi-card__trend text-green">
              <ArrowUpRight size={14} />
              <span>+5 new this week</span>
            </div>
          </div>
          <div className="rep-kpi-card__glow-blue" />
        </article>

        {/* KPI: Pending Review */}
        <article className="rep-kpi-card" aria-label="Pending Review">
          <div className="rep-kpi-card__header">
            <span className="rep-kpi-card__label">Pending Reviews</span>
            <div className="rep-kpi-card__icon text-amber">
              <Clock size={18} />
            </div>
          </div>
          <div className="rep-kpi-card__body">
            <span className="rep-kpi-card__value font-mono">{stats.pending}</span>
            <div className="rep-kpi-card__trend text-amber">
              <span>Requires admin approval</span>
            </div>
          </div>
          <div className="rep-kpi-card__glow-amber" />
        </article>

        {/* KPI: Exported */}
        <article className="rep-kpi-card" aria-label="Exported Reports">
          <div className="rep-kpi-card__header">
            <span className="rep-kpi-card__label">Exported Reports</span>
            <div className="rep-kpi-card__icon text-green">
              <FileCheck size={18} />
            </div>
          </div>
          <div className="rep-kpi-card__body">
            <span className="rep-kpi-card__value font-mono">{stats.exported}</span>
            <div className="rep-kpi-card__trend text-green">
              <span>Approved & Downloadable</span>
            </div>
          </div>
          <div className="rep-kpi-card__glow-green" />
        </article>
      </section>

      {/* Row 2: Grid Split of Table and Donut Chart */}
      <div className="rep-dash__grid-row">
        {/* Reports Directory Component */}
        <ReportsTable reports={reports} onDeleteReport={handleDeleteReport} />

        {/* Report Distribution Pie Chart Card */}
        <section className="rep-dash-card rep-dash-card--chart" aria-labelledby="chart-title">
          <header className="rep-dash-card__header">
            <TrendingUp size={16} className="text-purple" />
            <h2 id="chart-title" className="rep-dash-card__title">Category Distribution</h2>
          </header>
          <div className="rep-dash-card__body flex-center">
            {pieData.length === 0 ? (
              <p className="text-slate-500">No data available</p>
            ) : (
              <div className="rep-chart-container">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        background: '#0f172a', 
                        border: '1px solid rgba(148, 163, 184, 0.2)', 
                        borderRadius: '8px' 
                      }} 
                    />
                    <Legend 
                      iconSize={8} 
                      iconType="circle" 
                      wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>
      </div>

      <ReportGeneratorPanel
        onGenerate={handleGenerateReport}
        onExportPdf={markReportExported}
        onExportCsv={markReportExported}
        onEmail={(summary) => {
          setReports((prev) =>
            prev.map((r) =>
              r.id === summary.id ? { ...r, status: 'Under Review' } : r
            )
          );
        }}
        videos={videos.filter(v => v.processing_status === 'completed')}
        onGeneratePdfReport={handleGeneratePdfReport}
        onGenerateExcelReport={handleGenerateExcelReport}
      />
    </div>
  );
}
