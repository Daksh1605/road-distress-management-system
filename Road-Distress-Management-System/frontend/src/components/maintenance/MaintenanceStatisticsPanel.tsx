import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import type { WorkOrder } from '../../types/maintenance';
import './MaintenanceStatisticsPanel.css';

interface MaintenanceStatisticsPanelProps {
  workOrders: WorkOrder[];
}

const STATUS_COLORS: Record<string, string> = {
  Pending: '#c084fc',
  Assigned: '#3b82f6',
  'In Progress': '#f59e0b',
  Completed: '#10b981',
};

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#ef4444',
  High: '#f59e0b',
  Medium: '#3b82f6',
  Low: '#64748b',
};

export default function MaintenanceStatisticsPanel({ workOrders }: MaintenanceStatisticsPanelProps) {
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {
      Pending: 0,
      Assigned: 0,
      'In Progress': 0,
      Completed: 0,
    };
    workOrders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: STATUS_COLORS[name] ?? '#94a3b8',
    }));
  }, [workOrders]);

  const priorityData = useMemo(() => {
    const counts: Record<string, number> = {
      Critical: 0,
      High: 0,
      Medium: 0,
      Low: 0,
    };
    workOrders.forEach((o) => {
      counts[o.priority] = (counts[o.priority] ?? 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
      color: PRIORITY_COLORS[name] ?? '#94a3b8',
    }));
  }, [workOrders]);

  const monthlyData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const completed = workOrders.filter((o) => o.status === 'Completed');
    const base = [18, 24, 31, 38, 45, completed.length];
    return months.map((month, i) => ({
      month,
      completed: base[i],
    }));
  }, [workOrders]);

  const completionRate = useMemo(() => {
    if (workOrders.length === 0) return 0;
    const completed = workOrders.filter((o) => o.status === 'Completed').length;
    return Math.round((completed / workOrders.length) * 100);
  }, [workOrders]);

  return (
    <section className="mnt-stats" aria-labelledby="mnt-stats-title">
      <header className="mnt-stats__header">
        <div className="mnt-stats__header-group">
          <BarChart3 size={16} className="mnt-stats__header-icon" />
          <h2 id="mnt-stats-title" className="mnt-stats__title">Maintenance Statistics</h2>
        </div>
        <span className="mnt-stats__rate font-mono">{completionRate}% complete</span>
      </header>

      <div className="mnt-stats__body">
        <div className="mnt-stats__chart-block">
          <h3 className="mnt-stats__chart-label">
            <PieChartIcon size={14} />
            Status Distribution
          </h3>
          <div className="mnt-stats__pie-wrap">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={60}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend iconSize={8} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mnt-stats__chart-block">
          <h3 className="mnt-stats__chart-label">
            <BarChart3 size={14} />
            Priority Breakdown
          </h3>
          <div className="mnt-stats__priority-bars">
            {priorityData.map((item) => {
              const max = Math.max(...priorityData.map((d) => d.value), 1);
              const width = (item.value / max) * 100;
              return (
                <div key={item.name} className="mnt-stats__priority-row">
                  <span className="mnt-stats__priority-name">{item.name}</span>
                  <div className="mnt-stats__priority-track">
                    <div
                      className="mnt-stats__priority-fill"
                      style={{ width: `${width}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="mnt-stats__priority-count font-mono">{item.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mnt-stats__chart-block mnt-stats__chart-block--full">
          <h3 className="mnt-stats__chart-label">
            <BarChart3 size={14} />
            Repairs Completed (Monthly)
          </h3>
          <div className="mnt-stats__bar-wrap">
            <ResponsiveContainer width="100%" height={120}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(148, 163, 184, 0.2)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  cursor={{ fill: 'rgba(148, 163, 184, 0.06)' }}
                />
                <Bar dataKey="completed" name="Completed" fill="#c084fc" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </section>
  );
}
