import DetectionTrendChart from './DetectionTrendChart'
import DistressDistributionChart from './DistressDistributionChart'
import KPISection from './KPISection'
import RecentDetectionsTable from './RecentDetectionsTable'
import QuickActions from './QuickActions'
import MaintenanceAnalytics from './MaintenanceAnalytics'
import './DashboardGrid.css'

function DashboardGrid() {
  return (
    <section className="dashboard-page" aria-label="Dashboard overview">
      <header className="dashboard-page__header">
        <h1>Dashboard</h1>
        <p>Real-Time Road Distress Monitoring and Maintenance Analytics</p>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-grid__kpis">
          <KPISection />
        </div>

        <article className="dashboard-grid__card dashboard-grid__card--gis">
          <h2>Road Distress GIS Overview</h2>
          <p>GIS Map Placeholder</p>
        </article>

        <article className="dashboard-grid__card dashboard-grid__card--distress">
          <h2>Distress Distribution</h2>
          <DistressDistributionChart />
        </article>

        <article className="dashboard-grid__card dashboard-grid__card--analytics">
          <h2>Detection Trend</h2>
          <DetectionTrendChart />
        </article>

        <article className="dashboard-grid__card dashboard-grid__card--analytics">
          <h2>Maintenance Analytics</h2>
          <MaintenanceAnalytics />
        </article>

        <article className="dashboard-grid__card dashboard-grid__card--recent">
          <h2>Recent Detections</h2>
          <RecentDetectionsTable />
        </article>

        <article className="dashboard-grid__card dashboard-grid__card--actions">
          <h2>Quick Actions</h2>
          <QuickActions />
        </article>
      </div>
    </section>
  )
}

export default DashboardGrid
