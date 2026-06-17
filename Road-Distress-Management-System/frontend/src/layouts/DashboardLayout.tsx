import { Outlet } from 'react-router-dom'

import TopNavbar from '../components/common/TopNavbar'
import Sidebar from '../components/common/Sidebar'
import './DashboardLayout.css'

function DashboardLayout() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-layout__main">
        <TopNavbar />
        <main className="dashboard-layout__content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
