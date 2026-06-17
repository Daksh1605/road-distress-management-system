import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import './MaintenanceAnalytics.css'

// Interfaces for component props and state structure
interface MetricItem {
  id: string
  label: string
  value: string | number
  status: 'success' | 'warning' | 'danger' | 'info'
}

interface ChartDataPoint {
  month: string
  repairs: number
}

// Predefined static sample data
const METRICS: MetricItem[] = [
  {
    id: 'completed',
    label: 'Completed Repairs',
    value: 324,
    status: 'success',
  },
  {
    id: 'in-progress',
    label: 'In Progress',
    value: 57,
    status: 'warning',
  },
  {
    id: 'pending',
    label: 'Pending Repairs',
    value: 72,
    status: 'danger',
  },
  {
    id: 'cost',
    label: 'Estimated Cost',
    value: '₹12.8M',
    status: 'info',
  },
]

const CHART_DATA: ChartDataPoint[] = [
  { month: 'Jan', repairs: 20 },
  { month: 'Feb', repairs: 35 },
  { month: 'Mar', repairs: 42 },
  { month: 'Apr', repairs: 51 },
  { month: 'May', repairs: 63 },
  { month: 'Jun', repairs: 78 },
]

export default function MaintenanceAnalytics() {
  return (
    <div className="maintenance-analytics-container">
      {/* Top Row: Mini KPI Cards */}
      <div className="maintenance-analytics-metrics">
        {METRICS.map((metric) => (
          <div
            key={metric.id}
            className={`maintenance-metric-card maintenance-metric-card--${metric.status}`}
          >
            <span className="maintenance-metric-card__label">{metric.label}</span>
            <span className="maintenance-metric-card__value">{metric.value}</span>
          </div>
        ))}
      </div>

      {/* Bottom Row: Bar Chart */}
      <div className="maintenance-analytics-chart-wrapper">
        <h3 className="maintenance-analytics-chart-title">Repairs Completed (Monthly)</h3>
        <div className="maintenance-analytics-chart">
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={CHART_DATA} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" vertical={false} />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={11} 
                tickLine={false} 
                axisLine={false} 
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#111827',
                  border: '1px solid rgba(148, 163, 184, 0.24)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
                itemStyle={{ color: '#f8fafc' }}
                labelStyle={{ color: '#cbd5e1', fontWeight: 600 }}
                cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
              />
              <Bar 
                dataKey="repairs" 
                name="Repairs" 
                fill="#c084fc" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={32}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
