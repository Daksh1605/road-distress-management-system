import { useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Activity,
  Layers,
  Wrench,
  Cpu,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Clock,
  Zap,
  Gauge,
  Thermometer,
  HardDrive
} from 'lucide-react';
import './AnalyticsDashboard.css';

// Severity Pie Chart Data
const SEVERITY_DATA = [
  { name: 'Critical', value: 142, color: '#EF4444' },
  { name: 'High', value: 371, color: '#F97316' },
  { name: 'Medium', value: 583, color: '#FACC15' },
  { name: 'Low', value: 870, color: '#3B82F6' },
];

// State-wise Stacked Bar Chart Data
const STATE_DATA = [
  { name: 'Maharashtra', critical: 42, high: 110, medium: 185, low: 260 },
  { name: 'Karnataka', critical: 28, high: 88, medium: 145, low: 210 },
  { name: 'Delhi', critical: 38, high: 79, medium: 122, low: 178 },
  { name: 'Tamil Nadu', critical: 34, high: 94, medium: 131, low: 222 },
];

// District Risk Index Data
const DISTRICT_RISK_DATA = [
  { name: 'Pune (NH-48)', score: 9.2, cases: 245, topDistress: 'Pothole', level: 'Critical' },
  { name: 'Mumbai (NH-4)', score: 8.4, cases: 180, topDistress: 'Alligator Cracks', level: 'High' },
  { name: 'Thane (NH-48)', score: 7.8, cases: 145, topDistress: 'Rutting', level: 'High' },
  { name: 'Satara (SH-10)', score: 6.5, cases: 110, topDistress: 'Edge Break', level: 'Medium' },
  { name: 'Nagpur (NH-44)', score: 5.2, cases: 90, topDistress: 'Patching', level: 'Medium' },
];

// 30 Days trend mock data generator
const generateTrendData = (daysCount: number) => {
  const data = [];
  for (let i = daysCount; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Daily fluctuations
    const basePotholes = 15 + Math.sin((daysCount - i) * 0.3) * 6;
    const baseCracks = 22 + Math.cos((daysCount - i) * 0.2) * 8;
    const baseRutting = 8 + Math.sin((daysCount - i) * 0.4) * 3;

    data.push({
      date: dateLabel,
      potholes: Math.round(basePotholes + Math.random() * 3),
      cracks: Math.round(baseCracks + Math.random() * 4),
      rutting: Math.round(baseRutting + Math.random() * 2),
    });
  }
  return data;
};

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30D');

  const trendData = useMemo(() => {
    switch (timeRange) {
      case '7D':
        return generateTrendData(7);
      case '90D':
        return generateTrendData(90);
      case '1Y':
        return generateTrendData(180); // map to 180 points for layout
      case '30D':
      default:
        return generateTrendData(30);
    }
  }, [timeRange]);

  return (
    <div className="analytics-page animate-fade-in" aria-label="AI Analytics Platform">
      {/* Header */}
      <header className="analytics-page__header" style={{ marginBottom: '4px' }}>
        <h1 className="bold-page-title" style={{ fontSize: '32px' }}>Analytics Dashboard</h1>
        <p className="light-secondary-text" style={{ fontSize: '14px' }}>AI-powered road distress intelligence, prediction, and operational insights.</p>
      </header>

      {/* KPI Cards Row (6 Columns) */}
      <section className="analytics-page__kpis" style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '24px', marginBottom: '24px' }} aria-label="Key Performance Indicators">
        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Total Distresses</span>
            <Layers size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>1,966</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', marginTop: '2px' }}>
            <ArrowUpRight size={12} />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Critical Distresses</span>
            <AlertTriangle size={16} style={{ color: 'var(--danger)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--danger)' }}>142</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--success)', marginTop: '2px' }}>
            <ArrowDownRight size={12} />
            <span>-8.2% vs last month</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Model Accuracy</span>
            <Brain size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>94.6%</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--secondary-text)', marginTop: '2px' }}>
            <Activity size={12} />
            <span>F1 Score: 0.93</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Repairs Completed</span>
            <CheckCircle2 size={16} style={{ color: 'var(--success)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700, color: 'var(--success)' }}>843</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--accent-blue)', marginTop: '2px' }}>
            <Wrench size={12} />
            <span>82% of monthly target</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Avg Confidence</span>
            <Brain size={16} style={{ color: 'var(--accent-blue)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>87.4%</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--secondary-text)', marginTop: '2px' }}>
            <span>91% in daylight</span>
          </div>
        </div>

        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '4px', padding: 0 }}>
            <span style={{ fontSize: '11px', color: 'var(--secondary-text)', fontWeight: 600, textTransform: 'uppercase' }}>Detection Speed</span>
            <Zap size={16} style={{ color: 'var(--warning)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: '24px', fontWeight: 700 }}>12ms</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--secondary-text)', marginTop: '2px' }}>
            <span>83 FPS inference speed</span>
          </div>
        </div>
      </section>

      {/* Main Analytics Grid: Left 70% Area Chart | Right 30% Donut Chart */}
      <div style={{ display: 'grid', gridTemplateColumns: '2.3fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Detection Trend Area Chart */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: 'var(--accent-blue)' }} />
              <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Distress Detections Trend</h2>
            </div>
            
            {/* Time interval selector */}
            <div style={{ display: 'flex', background: 'var(--primary-bg)', borderRadius: '6px', padding: '2px' }}>
              {['7D', '30D', '90D', '1Y'].map(t => (
                <button 
                  key={t} 
                  className={timeRange === t ? 'btn-report-run font-semibold' : 'btn-control'} 
                  onClick={() => setTimeRange(t)}
                  style={{ padding: '4px 10px', fontSize: '11px', minWidth: '40px', border: 'none', height: '24px' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: '320px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="potholeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="crackGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#c084fc" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#c084fc" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.06)" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="potholes" name="Potholes" stroke="#EF4444" fill="url(#potholeGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="cracks" name="Cracks" stroke="#c084fc" fill="url(#crackGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Severity Distribution Pie Chart */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', padding: 0 }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Severity Distribution</h2>
          </div>

          <div style={{ height: '140px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={SEVERITY_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={36}
                  outerRadius={54}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {SEVERITY_DATA.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '9px' }}>
            {SEVERITY_DATA.map(e => (
              <div key={e.name} style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: e.color }} />
                <span style={{ color: 'var(--secondary-text)' }}>{e.name}: <strong>{e.value}</strong></span>
              </div>
            ))}
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--card-border)', fontSize: '11px', marginTop: 'auto' }}>
            <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '2px' }}>AI Summary Observation</span>
            <span style={{ color: 'var(--secondary-text)' }}>Low severity defects constitute the largest category (870 cases). Critical items decreased by 8.2%.</span>
          </div>
        </div>
      </div>

      {/* Row 3: Geographic Analytics (stacked bar & risk heatmap) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: State Stacked Bar */}
        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>State-wise Distress Analysis</h2>
          </div>
          <div style={{ height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={STATE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.05)" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={10} tickLine={false} />
                <Tooltip />
                <Bar dataKey="critical" stackId="a" fill="#EF4444" name="Critical" />
                <Bar dataKey="high" stackId="a" fill="#F97316" name="High" />
                <Bar dataKey="medium" stackId="a" fill="#FACC15" name="Medium" />
                <Bar dataKey="low" stackId="a" fill="#3B82F6" name="Low" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: District Risk Heatmap List */}
        <div className="premium-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>District Risk Heatmap</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {DISTRICT_RISK_DATA.map(d => (
              <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--primary-bg)', padding: '10px 14px', borderRadius: '6px', border: '1px solid var(--card-border)' }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="font-bold" style={{ fontSize: '13px' }}>{d.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--secondary-text)' }}>Top: {d.topDistress} &bull; Cases: {d.cases}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`status-pill badge-${d.level.toLowerCase()}`} style={{ fontSize: '9px' }}>{d.level}</span>
                  <span className="font-mono font-bold" style={{ fontSize: '14px', color: d.score > 8 ? 'var(--danger)' : 'var(--primary-text)' }}>{d.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4: Operations Analytics (progress tracker pipeline & model performance cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '24px', marginBottom: '24px' }}>
        {/* Left: Repair Progress Pipeline */}
        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Repair Progress Pipeline</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Completed Tickets</span>
                <span className="font-bold">843 cases (60%)</span>
              </div>
              <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--success)' }} />
              </div>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>In Progress repairs</span>
                <span className="font-bold">180 cases (13%)</span>
              </div>
              <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '13%', height: '100%', background: 'var(--warning)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Assigned work orders</span>
                <span className="font-bold">245 cases (17%)</span>
              </div>
              <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '17%', height: '100%', background: 'var(--accent-blue)' }} />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Pending Reviews</span>
                <span className="font-bold">184 cases (10%)</span>
              </div>
              <div style={{ height: '8px', background: '#E5E7EB', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: '10%', height: '100%', background: 'var(--danger)' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Right: Model Performance Cards */}
        <div className="premium-card">
          <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
            <h2 className="medium-section-title" style={{ fontSize: '15px' }}>AI Model Performance</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
            <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Precision</span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>95.2%</span>
              <span style={{ fontSize: '10px', color: 'var(--success)' }}>+0.4% vs last run</span>
            </div>
            
            <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Recall</span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>93.8%</span>
              <span style={{ fontSize: '10px', color: 'var(--success)' }}>+0.9% vs last run</span>
            </div>

            <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>F1 Score</span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>94.5%</span>
              <span style={{ fontSize: '10px', color: 'var(--success)' }}>+0.6% vs last run</span>
            </div>

            <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>mAP50</span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>96.1%</span>
              <span style={{ fontSize: '10px', color: 'var(--success)' }}>+1.5% vs last run</span>
            </div>

            <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>mAP50-95</span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>78.4%</span>
              <span style={{ fontSize: '10px', color: 'var(--success)' }}>+2.1% vs last run</span>
            </div>

            <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
              <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Accuracy</span>
              <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>94.8%</span>
              <span style={{ fontSize: '10px', color: 'var(--success)' }}>+1.2% vs last run</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 5: AI Insights */}
      <div className="premium-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
          <h2 className="medium-section-title" style={{ fontSize: '15px' }}>AI Insights & Recommendations</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div style={{ borderLeft: '4px solid var(--danger)', padding: '12px 14px', background: 'var(--primary-bg)', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--danger)', display: 'block', marginBottom: '4px' }}>High Severity Increase</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Critical cracks have risen by 12% on NH-48 sector (Lonavala region). Immediate field inspection recommended.</p>
          </div>
          
          <div style={{ borderLeft: '4px solid var(--accent-blue)', padding: '12px 14px', background: 'var(--primary-bg)', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--accent-blue)', display: 'block', marginBottom: '4px' }}>Weather Impact</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>High-moisture indices accelerate crack degradation by 2.4x. Priority patching scheduled ahead of monsoons.</p>
          </div>

          <div style={{ borderLeft: '4px solid var(--warning)', padding: '12px 14px', background: 'var(--primary-bg)', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--warning)', display: 'block', marginBottom: '4px' }}>Predicted Maintenance</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Weekly forecast shows a 15% increase in rain-related raveling distresses on southern state highways.</p>
          </div>

          <div style={{ borderLeft: '4px solid var(--success)', padding: '12px 14px', background: 'var(--primary-bg)', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--success)', display: 'block', marginBottom: '4px' }}>Model Recommendation</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>YOLOv11 model confidence stabilized at 94.6% after retraining with June image samples. Confidences are highest in dry conditions.</p>
          </div>

          <div style={{ borderLeft: '4px solid var(--accent-blue)', padding: '12px 14px', background: 'var(--primary-bg)', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--accent-blue)', display: 'block', marginBottom: '4px' }}>AI Observation</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>32% of critical work orders in Pune District are pending squad assignment for more than 7 days.</p>
          </div>

          <div style={{ borderLeft: '4px solid var(--success)', padding: '12px 14px', background: 'var(--primary-bg)', borderRadius: '4px' }}>
            <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--success)', display: 'block', marginBottom: '4px' }}>Suggested Action</span>
            <p style={{ fontSize: '12px', color: 'var(--secondary-text)' }}>Optimize team workloads automatically by routing Satara Highway team to the Khandala Descent section.</p>
          </div>
        </div>
      </div>

      {/* Row 6: Prediction Panel */}
      <div className="premium-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px' }}>
          <h2 className="medium-section-title" style={{ fontSize: '15px' }}>Predictive Analytics Outlook</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '16px' }}>
          <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Next Week Expected</span>
            <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>85 cases</span>
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Rainfall Impact</span>
            <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0', color: 'var(--warning)' }}>Medium Risk</span>
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Traffic Density</span>
            <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>High Load</span>
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>High Risk Corridor</span>
            <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0', color: 'var(--danger)' }}>NH-48 KM 42</span>
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Est. Cost Next Wk</span>
            <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>₹4.2L</span>
          </div>

          <div style={{ background: 'var(--primary-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--card-border)', textAlign: 'center' }}>
            <span style={{ fontSize: '10px', color: 'var(--secondary-text)', textTransform: 'uppercase', fontWeight: 600 }}>Forecast Confidence</span>
            <span style={{ display: 'block', fontSize: '20px', fontWeight: 700, margin: '4px 0' }}>88.5%</span>
          </div>
        </div>
      </div>

      {/* Row 7: Technical Performance Metrics (NVIDIA style) */}
      <div className="premium-card" style={{ background: 'var(--primary-text)', color: 'white' }}>
        <div className="card-header-with-actions" style={{ borderBottom: 'none', marginBottom: '14px', color: 'white' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Cpu size={16} style={{ color: '#76B900' }} />
            <h2 className="medium-section-title" style={{ fontSize: '15px', color: 'white' }}>NVIDIA AI Inference & Hardware Telemetry</h2>
          </div>
          <span className="font-mono" style={{ fontSize: '11px', color: '#76B900', fontWeight: 'bold' }}>ENGINE: YOLOv11x Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              <Gauge size={12} />
              <span>Inference Speed</span>
            </div>
            <span className="font-mono" style={{ display: 'block', fontSize: '20px', fontWeight: 700, marginTop: '6px', color: '#76B900' }}>82 FPS</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              <Clock size={12} />
              <span>Inference Latency</span>
            </div>
            <span className="font-mono" style={{ display: 'block', fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>12 ms</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              <Thermometer size={12} />
              <span>GPU Temp / Load</span>
            </div>
            <span className="font-mono" style={{ display: 'block', fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>72°C / 86%</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              <HardDrive size={12} />
              <span>VRAM Memory</span>
            </div>
            <span className="font-mono" style={{ display: 'block', fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>7.2 / 12.0 GB</span>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.06)', padding: '14px', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'rgba(255,255,255,0.7)', fontSize: '10px', textTransform: 'uppercase', fontWeight: 600 }}>
              <Cpu size={12} />
              <span>Model Parameters</span>
            </div>
            <span className="font-mono" style={{ display: 'block', fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>68.2M params</span>
          </div>
        </div>
      </div>
    </div>
  );
}
