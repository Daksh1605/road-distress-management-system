import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  BarChart,
  Bar,
} from 'recharts';
import DistressTrendChart from '../../components/dashboard/DistressTrendChart';
import ModelPerformancePanel from '../../components/dashboard/ModelPerformancePanel';
import {
  TrendingUp,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Activity,
  Layers,
  Wrench,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import './AnalyticsDashboard.css';

// DistressTrendChart manages and renders its own 30-day telemetry data

// 2. Severity Pie Chart Mock Data
const severityData = [
  { name: 'Critical', value: 142, color: '#ef4444' },
  { name: 'High', value: 371, color: '#f97316' },
  { name: 'Medium', value: 583, color: '#eab308' },
  { name: 'Low', value: 870, color: '#3b82f6' },
];

// 3. State-wise Stacked Bar Chart Mock Data
const stateData = [
  { name: 'Maharashtra', critical: 42, high: 110, medium: 185, low: 260 },
  { name: 'Karnataka', critical: 28, high: 88, medium: 145, low: 210 },
  { name: 'Delhi', critical: 38, high: 79, medium: 122, low: 178 },
  { name: 'Tamil Nadu', critical: 34, high: 94, medium: 131, low: 222 },
];

// 4. Repair Progress Bar Chart Mock Data
const repairData = [
  { name: 'Pending', count: 184, color: '#ef4444' },
  { name: 'Assigned', count: 245, color: '#818cf8' },
  { name: 'In Progress', count: 180, color: '#3b82f6' },
  { name: 'Completed', count: 843, color: '#22c55e' },
];

// ModelPerformancePanel manages and renders its own telemetry and YOLOv11 engine specifications

// 6. AI Insights list
const aiInsights = [
  {
    type: 'warning',
    icon: <AlertTriangle size={15} />,
    title: 'High Severity Cracks Detected',
    text: 'Critical distresses have risen by 12% on NH-48 sector (Lonavala region). Immediate field inspection recommended.',
  },
  {
    type: 'success',
    icon: <Brain size={15} />,
    title: 'Model Confidence Stabilized',
    text: 'F1 Score improved to 94.5% after retraining with June image samples. Confidences are highest in daylight dry conditions.',
  },
  {
    type: 'info',
    icon: <Wrench size={15} />,
    title: 'Squad Bottleneck Alert',
    text: '32% of critical work orders in Pune District are pending squad assignment for > 7 days. Consider automatic load balancing.',
  },
  {
    type: 'predictive',
    icon: <TrendingUp size={15} />,
    title: 'Predictive Rain Damage Outlook',
    text: 'AI forecasts a 15% increase in rain-related raveling distresses on southern coastal state highways next month due to monsoon triggers.',
  },
];

export default function AnalyticsDashboard() {
  return (
    <div className="analytics-page">
      {/* Header */}
      <header className="analytics-page__header">
        <h1 className="analytics-page__title">Analytics Dashboard</h1>
        <p className="analytics-page__subtitle">
          AI-powered road distress insights and performance monitoring
        </p>
      </header>

      {/* Row 1: KPI Cards */}
      <section className="analytics-page__kpis" aria-label="Key Performance Indicators">
        {/* Total Distresses */}
        <article className="analytics-kpi-card" aria-label="Total Distresses">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Total Distresses</span>
            <div className="analytics-kpi-card__icon text-purple">
              <Layers size={18} />
            </div>
          </div>
          <div className="analytics-kpi-card__body">
            <span className="analytics-kpi-card__value">1,966</span>
            <div className="analytics-kpi-card__trend text-green">
              <ArrowUpRight size={14} />
              <span>+12.4% vs last month</span>
            </div>
          </div>
          <div className="analytics-kpi-card__glow" />
        </article>

        {/* Critical Distresses */}
        <article className="analytics-kpi-card" aria-label="Critical Distresses">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Critical Distresses</span>
            <div className="analytics-kpi-card__icon text-red">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="analytics-kpi-card__body">
            <span className="analytics-kpi-card__value">142</span>
            <div className="analytics-kpi-card__trend text-green">
              <ArrowDownRight size={14} />
              <span>-8.2% vs last month</span>
            </div>
          </div>
          <div className="analytics-kpi-card__glow" />
        </article>

        {/* Model Accuracy */}
        <article className="analytics-kpi-card" aria-label="Model Accuracy">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Model Accuracy</span>
            <div className="analytics-kpi-card__icon text-amber">
              <Brain size={18} />
            </div>
          </div>
          <div className="analytics-kpi-card__body">
            <span className="analytics-kpi-card__value">94.6%</span>
            <div className="analytics-kpi-card__trend text-purple">
              <Activity size={14} />
              <span>F1 Score: 0.93</span>
            </div>
          </div>
          <div className="analytics-kpi-card__glow" />
        </article>

        {/* Repairs Completed */}
        <article className="analytics-kpi-card" aria-label="Repairs Completed">
          <div className="analytics-kpi-card__header">
            <span className="analytics-kpi-card__title">Repairs Completed</span>
            <div className="analytics-kpi-card__icon text-green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="analytics-kpi-card__body">
            <span className="analytics-kpi-card__value">843</span>
            <div className="analytics-kpi-card__trend text-blue">
              <Wrench size={14} />
              <span>82% of monthly target</span>
            </div>
          </div>
          <div className="analytics-kpi-card__glow" />
        </article>
      </section>

      {/* Row 2: Distress Trend & Severity Pie */}
      <div className="analytics-page__grid-row analytics-page__grid-row--charts-split">
        {/* Trend Area Chart (70%) */}
        <DistressTrendChart />

        {/* Severity Distribution Pie (30%) */}
        <section className="analytics-chart-card" aria-labelledby="severity-title">
          <header className="analytics-chart-card__header">
            <AlertTriangle size={16} className="analytics-chart-card__header-icon text-red" />
            <h2 id="severity-title" className="analytics-chart-card__title">
              Severity Distribution
            </h2>
          </header>
          <div className="analytics-chart-card__canvas flex-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={severityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 3: State-wise Stacked Bar & Repair Progress */}
      <div className="analytics-page__grid-row analytics-page__grid-row--equal-split">
        {/* State Bar Chart */}
        <section className="analytics-chart-card" aria-labelledby="state-title">
          <header className="analytics-chart-card__header">
            <Layers size={16} className="analytics-chart-card__header-icon text-amber" />
            <h2 id="state-title" className="analytics-chart-card__title">
              State-wise Distress Analysis
            </h2>
          </header>
          <div className="analytics-chart-card__canvas">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={stateData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="critical" stackId="a" fill="#ef4444" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#f97316" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#eab308" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="#3b82f6" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Repair Progress Bar Chart */}
        <section className="analytics-chart-card" aria-labelledby="repairs-title">
          <header className="analytics-chart-card__header">
            <Wrench size={16} className="analytics-chart-card__header-icon text-green" />
            <h2 id="repairs-title" className="analytics-chart-card__title">
              Repair Progress Analytics
            </h2>
          </header>
          <div className="analytics-chart-card__canvas">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={repairData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: '8px' }}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.05)' }}
                />
                <Bar dataKey="count" name="Tickets" radius={[4, 4, 0, 0]}>
                  {repairData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      {/* Row 4: AI Insights & Model Metrics */}
      <div className="analytics-page__grid-row analytics-page__grid-row--insights-split">
        {/* AI Insights Panel */}
        <section className="analytics-details-card" aria-labelledby="insights-title">
          <header className="analytics-details-card__header">
            <Cpu size={18} className="analytics-details-card__header-icon text-purple" />
            <h2 id="insights-title" className="analytics-details-card__title">
              AI Insights & Action Plan
            </h2>
          </header>
          <div className="analytics-insights-list">
            {aiInsights.map((insight, idx) => (
              <div
                key={idx}
                className={`analytics-insight-item analytics-insight-item--${insight.type}`}
              >
                <div className="analytics-insight-item__icon-wrapper">
                  {insight.icon}
                </div>
                <div className="analytics-insight-item__content">
                  <h3 className="analytics-insight-item__title">{insight.title}</h3>
                  <p className="analytics-insight-item__text">{insight.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Model Performance metrics */}
        <ModelPerformancePanel />
      </div>
    </div>
  );
}
