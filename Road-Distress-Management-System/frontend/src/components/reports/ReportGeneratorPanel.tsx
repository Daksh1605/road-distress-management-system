import { useState, useEffect } from 'react';
import {
  FileText,
  MapPin,
  AlertTriangle,
  Calendar,
  Layers,
  FileDown,
  Mail,
  Table2,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import type { DistressType, DistressSeverity } from '../../types/gis';
import './ReportGeneratorPanel.css';

export interface ReportFilters {
  state: string;
  district: string;
  distressType: string;
  severity: string;
  startDate: string;
  endDate: string;
}

export interface ReportSummary {
  id: string;
  generatedAt: string;
  filters: ReportFilters;
  totalDistresses: number;
  criticalCount: number;
  highSeverityCount: number;
  roadsAffected: number;
  topDistressType: string;
  averageConfidence: number;
  estimatedRepairCost: string;
}

interface ReportGeneratorPanelProps {
  onGenerate?: (filters: ReportFilters, summary: ReportSummary) => void;
  onExportPdf?: (summary: ReportSummary) => void;
  onExportCsv?: (summary: ReportSummary) => void;
  onEmail?: (summary: ReportSummary) => void;
}

const DEFAULT_FILTERS: ReportFilters = {
  state: '',
  district: '',
  distressType: '',
  severity: '',
  startDate: '2026-06-01',
  endDate: '2026-06-18',
};

const STATES_AND_DISTRICTS: Record<string, string[]> = {
  Maharashtra: ['Mumbai', 'Pune', 'Nagpur', 'Thane'],
  Karnataka: ['Bengaluru', 'Mysore', 'Hubli', 'Mangaluru'],
  Delhi: ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi'],
  'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Trichy'],
};

const DISTRESS_TYPES: { value: DistressType; label: string }[] = [
  { value: 'pothole', label: 'Pothole' },
  { value: 'crack', label: 'Crack (Alligator/Longitudinal)' },
  { value: 'raveling', label: 'Raveling' },
  { value: 'rutting', label: 'Rutting' },
  { value: 'shoving', label: 'Shoving' },
  { value: 'bleeding', label: 'Bleeding' },
  { value: 'edge_break', label: 'Edge Break' },
  { value: 'patch', label: 'Patch' },
];

const SEVERITIES: { value: DistressSeverity; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

function formatLabel(value: string, fallback: string): string {
  if (!value) return fallback;
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function buildMockSummary(filters: ReportFilters): ReportSummary {
  const seed =
    (filters.state.length + filters.district.length + filters.distressType.length) % 7;
  const total = 48 + seed * 12;
  const critical = Math.floor(total * 0.18) + seed;
  const high = Math.floor(total * 0.32) + seed;

  return {
    id: `REP-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date().toISOString(),
    filters: { ...filters },
    totalDistresses: total,
    criticalCount: critical,
    highSeverityCount: high,
    roadsAffected: 6 + seed * 2,
    topDistressType: filters.distressType
      ? formatLabel(filters.distressType, 'Pothole')
      : 'Pothole',
    averageConfidence: 91.4 + seed * 0.3,
    estimatedRepairCost: `₹${(1.2 + seed * 0.4).toFixed(1)}L`,
  };
}

export default function ReportGeneratorPanel({
  onGenerate,
  onExportPdf,
  onExportCsv,
  onEmail,
}: ReportGeneratorPanelProps) {
  const [filters, setFilters] = useState<ReportFilters>({ ...DEFAULT_FILTERS });
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [summary, setSummary] = useState<ReportSummary | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportAction, setExportAction] = useState<'pdf' | 'csv' | 'email' | null>(null);

  useEffect(() => {
    if (filters.state && STATES_AND_DISTRICTS[filters.state]) {
      setAvailableDistricts(STATES_AND_DISTRICTS[filters.state]);
      if (!STATES_AND_DISTRICTS[filters.state].includes(filters.district)) {
        setFilters((prev) => ({ ...prev, district: '' }));
      }
    } else {
      setAvailableDistricts([]);
      if (filters.district) {
        setFilters((prev) => ({ ...prev, district: '' }));
      }
    }
  }, [filters.state]);

  const handleChange = (field: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setSummary(null);

    setTimeout(() => {
      const generated = buildMockSummary(filters);
      setSummary(generated);
      setIsGenerating(false);
      onGenerate?.(filters, generated);
    }, 1200);
  };

  const handleExportPdf = () => {
    if (!summary) return;
    setExportAction('pdf');
    setTimeout(() => {
      onExportPdf?.(summary);
      setExportAction(null);
    }, 600);
  };

  const handleExportCsv = () => {
    if (!summary) return;
    setExportAction('csv');
    setTimeout(() => {
      onExportCsv?.(summary);
      setExportAction(null);
    }, 600);
  };

  const handleEmail = () => {
    if (!summary) return;
    setExportAction('email');
    setTimeout(() => {
      onEmail?.(summary);
      setExportAction(null);
    }, 800);
  };

  const hasReport = summary !== null;
  const formattedDate = summary
    ? new Date(summary.generatedAt).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '';

  return (
    <section className="rep-gen-panel" aria-labelledby="rep-gen-panel-title">
      <header className="rep-gen-panel__header">
        <div className="rep-gen-panel__header-title">
          <FileText className="rep-gen-panel__header-icon" size={18} />
          <h2 id="rep-gen-panel-title" className="rep-gen-panel__title">
            Report Generator
          </h2>
        </div>
        <p className="rep-gen-panel__subtitle">
          Configure filters and generate distress summary reports
        </p>
      </header>

      <div className="rep-gen-panel__layout">
        {/* Filters */}
        <div className="rep-gen-panel__filters">
          <h3 className="rep-gen-panel__section-label">Report Filters</h3>

          <div className="rep-gen-panel__filter-grid">
            <div className="rep-gen-panel__group">
              <label className="rep-gen-panel__label" htmlFor="rep-filter-state">
                <MapPin size={14} className="rep-gen-panel__label-icon" />
                State
              </label>
              <select
                id="rep-filter-state"
                className="rep-gen-panel__select"
                value={filters.state}
                onChange={(e) => handleChange('state', e.target.value)}
                disabled={isGenerating}
              >
                <option value="">All States</option>
                {Object.keys(STATES_AND_DISTRICTS).map((state) => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </select>
            </div>

            <div className="rep-gen-panel__group">
              <label className="rep-gen-panel__label" htmlFor="rep-filter-district">
                <MapPin size={14} className="rep-gen-panel__label-icon" />
                District
              </label>
              <select
                id="rep-filter-district"
                className="rep-gen-panel__select"
                value={filters.district}
                onChange={(e) => handleChange('district', e.target.value)}
                disabled={isGenerating || !filters.state}
              >
                <option value="">
                  {!filters.state ? 'Select State First' : 'All Districts'}
                </option>
                {availableDistricts.map((district) => (
                  <option key={district} value={district}>{district}</option>
                ))}
              </select>
            </div>

            <div className="rep-gen-panel__group">
              <label className="rep-gen-panel__label" htmlFor="rep-filter-distress">
                <Layers size={14} className="rep-gen-panel__label-icon" />
                Distress Type
              </label>
              <select
                id="rep-filter-distress"
                className="rep-gen-panel__select"
                value={filters.distressType}
                onChange={(e) => handleChange('distressType', e.target.value)}
                disabled={isGenerating}
              >
                <option value="">All Types</option>
                {DISTRESS_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div className="rep-gen-panel__group">
              <label className="rep-gen-panel__label" htmlFor="rep-filter-severity">
                <AlertTriangle size={14} className="rep-gen-panel__label-icon" />
                Severity
              </label>
              <select
                id="rep-filter-severity"
                className="rep-gen-panel__select"
                value={filters.severity}
                onChange={(e) => handleChange('severity', e.target.value)}
                disabled={isGenerating}
              >
                <option value="">All Severities</option>
                {SEVERITIES.map((severity) => (
                  <option key={severity.value} value={severity.value}>
                    {severity.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="rep-gen-panel__group rep-gen-panel__group--date-range">
              <span className="rep-gen-panel__label">
                <Calendar size={14} className="rep-gen-panel__label-icon" />
                Date Range
              </span>
              <div className="rep-gen-panel__date-range">
                <div className="rep-gen-panel__date-field">
                  <span className="rep-gen-panel__date-sublabel">From</span>
                  <input
                    type="date"
                    id="rep-filter-start"
                    className="rep-gen-panel__date-input"
                    value={filters.startDate}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    disabled={isGenerating}
                    aria-label="Start date"
                  />
                </div>
                <div className="rep-gen-panel__date-field">
                  <span className="rep-gen-panel__date-sublabel">To</span>
                  <input
                    type="date"
                    id="rep-filter-end"
                    className="rep-gen-panel__date-input"
                    value={filters.endDate}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    disabled={isGenerating}
                    aria-label="End date"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="rep-gen-panel__actions">
            <button
              type="button"
              className="rep-gen-panel__btn rep-gen-panel__btn--primary"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={16} className="rep-gen-panel__spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Generate Report
                </>
              )}
            </button>

            <div className="rep-gen-panel__export-row">
              <button
                type="button"
                className="rep-gen-panel__btn rep-gen-panel__btn--secondary"
                onClick={handleExportPdf}
                disabled={!hasReport || isGenerating || exportAction !== null}
              >
                {exportAction === 'pdf' ? (
                  <Loader2 size={16} className="rep-gen-panel__spin" />
                ) : (
                  <FileDown size={16} />
                )}
                Export PDF
              </button>

              <button
                type="button"
                className="rep-gen-panel__btn rep-gen-panel__btn--secondary"
                onClick={handleExportCsv}
                disabled={!hasReport || isGenerating || exportAction !== null}
              >
                {exportAction === 'csv' ? (
                  <Loader2 size={16} className="rep-gen-panel__spin" />
                ) : (
                  <Table2 size={16} />
                )}
                Export CSV
              </button>

              <button
                type="button"
                className="rep-gen-panel__btn rep-gen-panel__btn--secondary"
                onClick={handleEmail}
                disabled={!hasReport || isGenerating || exportAction !== null}
              >
                {exportAction === 'email' ? (
                  <Loader2 size={16} className="rep-gen-panel__spin" />
                ) : (
                  <Mail size={16} />
                )}
                Email Report
              </button>
            </div>
          </div>
        </div>

        {/* Preview */}
        <aside className="rep-gen-panel__preview" aria-label="Report preview">
          <h3 className="rep-gen-panel__section-label">Report Preview</h3>

          {isGenerating && (
            <div className="rep-gen-panel__preview-empty">
              <Loader2 size={32} className="rep-gen-panel__spin rep-gen-panel__preview-icon" />
              <p>Compiling distress data and building summary...</p>
            </div>
          )}

          {!isGenerating && !summary && (
            <div className="rep-gen-panel__preview-empty">
              <FileText size={32} className="rep-gen-panel__preview-icon" />
              <p>Configure filters and click Generate Report to preview the summary.</p>
            </div>
          )}

          {!isGenerating && summary && (
            <div className="rep-gen-panel__preview-content">
              <div className="rep-gen-panel__preview-banner">
                <CheckCircle2 size={18} className="rep-gen-panel__preview-banner-icon" />
                <div>
                  <span className="rep-gen-panel__preview-banner-title">Report Ready</span>
                  <span className="rep-gen-panel__preview-banner-meta">
                    {summary.id} · {formattedDate}
                  </span>
                </div>
              </div>

              <dl className="rep-gen-panel__summary-grid">
                <div className="rep-gen-panel__summary-item">
                  <dt>Total Distresses</dt>
                  <dd className="font-mono">{summary.totalDistresses}</dd>
                </div>
                <div className="rep-gen-panel__summary-item">
                  <dt>Critical Severity</dt>
                  <dd className="font-mono text-red">{summary.criticalCount}</dd>
                </div>
                <div className="rep-gen-panel__summary-item">
                  <dt>High Severity</dt>
                  <dd className="font-mono text-amber">{summary.highSeverityCount}</dd>
                </div>
                <div className="rep-gen-panel__summary-item">
                  <dt>Roads Affected</dt>
                  <dd className="font-mono">{summary.roadsAffected}</dd>
                </div>
                <div className="rep-gen-panel__summary-item">
                  <dt>Top Distress Type</dt>
                  <dd>{summary.topDistressType}</dd>
                </div>
                <div className="rep-gen-panel__summary-item">
                  <dt>Avg. Confidence</dt>
                  <dd className="font-mono">{summary.averageConfidence.toFixed(1)}%</dd>
                </div>
                <div className="rep-gen-panel__summary-item rep-gen-panel__summary-item--wide">
                  <dt>Est. Repair Cost</dt>
                  <dd className="font-mono text-green">{summary.estimatedRepairCost}</dd>
                </div>
              </dl>

              <div className="rep-gen-panel__filter-summary">
                <h4 className="rep-gen-panel__filter-summary-title">Applied Filters</h4>
                <ul className="rep-gen-panel__filter-summary-list">
                  <li>
                    <span>State</span>
                    <strong>{summary.filters.state || 'All States'}</strong>
                  </li>
                  <li>
                    <span>District</span>
                    <strong>{summary.filters.district || 'All Districts'}</strong>
                  </li>
                  <li>
                    <span>Distress Type</span>
                    <strong>
                      {summary.filters.distressType
                        ? formatLabel(summary.filters.distressType, 'All Types')
                        : 'All Types'}
                    </strong>
                  </li>
                  <li>
                    <span>Severity</span>
                    <strong>
                      {summary.filters.severity
                        ? formatLabel(summary.filters.severity, 'All Severities')
                        : 'All Severities'}
                    </strong>
                  </li>
                  <li>
                    <span>Date Range</span>
                    <strong className="font-mono">
                      {summary.filters.startDate} — {summary.filters.endDate}
                    </strong>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}
