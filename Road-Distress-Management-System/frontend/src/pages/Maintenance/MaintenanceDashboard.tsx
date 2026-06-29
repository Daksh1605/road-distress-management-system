import { useMemo } from 'react';
import {
  ClipboardList,
  Wrench,
  CheckCircle2,
  IndianRupee,
  ArrowUpRight,
} from 'lucide-react';
import WorkOrdersTable from '../../components/maintenance/WorkOrdersTable';
import MaintenanceStatisticsPanel from '../../components/maintenance/MaintenanceStatisticsPanel';
import TeamAssignmentBoard from '../../components/maintenance/TeamAssignmentBoard';
import UpcomingRepairSchedule from '../../components/maintenance/UpcomingRepairSchedule';
import RepairProgressTracker from '../../components/maintenance/RepairProgressTracker';
import {
  MOCK_WORK_ORDERS,
  MOCK_TEAMS,
  MOCK_UPCOMING_REPAIRS,
  MOCK_REPAIR_PROGRESS,
} from '../../data/maintenanceMockData';
import type { MaintenanceKPIs } from '../../types/maintenance';
import './MaintenanceDashboard.css';

function formatCost(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return `₹${amount.toLocaleString('en-IN')}`;
}

export default function MaintenanceDashboard() {
  const kpis = useMemo<MaintenanceKPIs>(() => {
    const activeWorkOrders = MOCK_WORK_ORDERS.filter((o) => o.status !== 'Completed').length;
    const repairsInProgress = MOCK_WORK_ORDERS.filter((o) => o.status === 'In Progress').length;
    const completedRepairs = MOCK_WORK_ORDERS.filter((o) => o.status === 'Completed').length;
    const totalMaintenanceCost = MOCK_WORK_ORDERS.reduce((sum, o) => sum + o.estimatedCost, 0);

    return {
      activeWorkOrders,
      repairsInProgress,
      completedRepairs,
      totalMaintenanceCost,
    };
  }, []);

  return (
    <div className="mnt-dash">
      <header className="mnt-dash__header">
        <h1 className="mnt-dash__title">Maintenance Management</h1>
        <p className="mnt-dash__subtitle">
          Track repair work orders, teams and maintenance schedules.
        </p>
      </header>

      {/* Row 1: KPI Cards */}
      <section className="mnt-dash__kpi-grid" aria-label="Maintenance statistics summary">
        <article className="mnt-kpi-card" aria-label="Active Work Orders">
          <div className="mnt-kpi-card__header">
            <span className="mnt-kpi-card__label">Active Work Orders</span>
            <div className="mnt-kpi-card__icon mnt-kpi-card__icon--purple">
              <ClipboardList size={18} />
            </div>
          </div>
          <div className="mnt-kpi-card__body">
            <span className="mnt-kpi-card__value font-mono">{kpis.activeWorkOrders}</span>
            <div className="mnt-kpi-card__trend mnt-kpi-card__trend--green">
              <ArrowUpRight size={14} />
              <span>Across all corridors</span>
            </div>
          </div>
          <div className="mnt-kpi-card__glow mnt-kpi-card__glow--purple" />
        </article>

        <article className="mnt-kpi-card" aria-label="Repairs In Progress">
          <div className="mnt-kpi-card__header">
            <span className="mnt-kpi-card__label">Repairs In Progress</span>
            <div className="mnt-kpi-card__icon mnt-kpi-card__icon--amber">
              <Wrench size={18} />
            </div>
          </div>
          <div className="mnt-kpi-card__body">
            <span className="mnt-kpi-card__value font-mono">{kpis.repairsInProgress}</span>
            <div className="mnt-kpi-card__trend mnt-kpi-card__trend--amber">
              <span>Teams on site now</span>
            </div>
          </div>
          <div className="mnt-kpi-card__glow mnt-kpi-card__glow--amber" />
        </article>

        <article className="mnt-kpi-card" aria-label="Completed Repairs">
          <div className="mnt-kpi-card__header">
            <span className="mnt-kpi-card__label">Completed Repairs</span>
            <div className="mnt-kpi-card__icon mnt-kpi-card__icon--green">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <div className="mnt-kpi-card__body">
            <span className="mnt-kpi-card__value font-mono">{kpis.completedRepairs}</span>
            <div className="mnt-kpi-card__trend mnt-kpi-card__trend--green">
              <ArrowUpRight size={14} />
              <span>+12% this month</span>
            </div>
          </div>
          <div className="mnt-kpi-card__glow mnt-kpi-card__glow--green" />
        </article>

        <article className="mnt-kpi-card" aria-label="Total Maintenance Cost">
          <div className="mnt-kpi-card__header">
            <span className="mnt-kpi-card__label">Total Maintenance Cost</span>
            <div className="mnt-kpi-card__icon mnt-kpi-card__icon--blue">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mnt-kpi-card__body">
            <span className="mnt-kpi-card__value font-mono">
              {formatCost(kpis.totalMaintenanceCost)}
            </span>
            <div className="mnt-kpi-card__trend mnt-kpi-card__trend--muted">
              <span>Estimated for active orders</span>
            </div>
          </div>
          <div className="mnt-kpi-card__glow mnt-kpi-card__glow--blue" />
        </article>
      </section>

      {/* Row 2: Work Orders + Statistics */}
      <div className="mnt-dash__grid-row mnt-dash__grid-row--70-30">
        <WorkOrdersTable workOrders={MOCK_WORK_ORDERS} />
        <MaintenanceStatisticsPanel workOrders={MOCK_WORK_ORDERS} />
      </div>

      {/* Row 3: Team Board + Schedule */}
      <div className="mnt-dash__grid-row mnt-dash__grid-row--equal">
        <TeamAssignmentBoard teams={MOCK_TEAMS} />
        <UpcomingRepairSchedule repairs={MOCK_UPCOMING_REPAIRS} />
      </div>

      {/* Row 4: Progress Tracker */}
      <RepairProgressTracker items={MOCK_REPAIR_PROGRESS} />
    </div>
  );
}
